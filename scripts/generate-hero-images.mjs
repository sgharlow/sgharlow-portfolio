#!/usr/bin/env node
/**
 * Generate hero images for portfolio projects via Gemini chat UI.
 *
 * Usage:
 *   GEMINI_URL=https://gemini.google.com/app node scripts/generate-hero-images.mjs
 *   GEMINI_URL=https://gemini.google.com/app node scripts/generate-hero-images.mjs --slug health-pulse  # one entry only
 *   GEMINI_URL=https://gemini.google.com/app node scripts/generate-hero-images.mjs --headed   # visible browser (default)
 *   GEMINI_URL=https://gemini.google.com/app node scripts/generate-hero-images.mjs --headless # for CI
 *
 * First run: a Chromium window opens. Sign in to Google. The script waits until you're signed in,
 * then proceeds. The session persists in ./.pw-data/ so subsequent runs don't need login.
 *
 * The script processes entries where heroImage is null, one at a time. After each successful
 * generation, projects.json is updated and saved (so a partial run preserves progress).
 *
 * If a single entry fails (selector drift, rate limit, network), it's logged and skipped.
 * Re-run the script to retry the failed entries.
 */

import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = process.cwd();
const PROJECTS_FILE = path.join(ROOT, 'data', 'projects.json');
const OUTPUT_DIR = path.join(ROOT, 'public', 'projects');
const PW_DATA_DIR = path.join(ROOT, '.pw-data');
const URL_DEFAULT = 'https://gemini.google.com/app';
const PER_ENTRY_TIMEOUT_MS = 120_000;
const POST_GENERATE_DELAY_MS = 4_000;
const TARGET_WIDTH = 1280;
const TARGET_HEIGHT = 720;
const TARGET_QUALITY = 82;

const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const arg = (name) => {
  const i = args.indexOf(name);
  return i >= 0 && i + 1 < args.length ? args[i + 1] : undefined;
};

const opts = {
  url: process.env.GEMINI_URL || URL_DEFAULT,
  headless: flag('--headless'),
  slug: arg('--slug'),
};

function log(...m) { console.log('[gen-hero]', ...m); }
function warn(...m) { console.warn('[gen-hero]', ...m); }

async function loadProjects() {
  return JSON.parse(await fs.readFile(PROJECTS_FILE, 'utf-8'));
}

async function saveProjects(file) {
  await fs.writeFile(PROJECTS_FILE, JSON.stringify(file, null, 2), 'utf-8');
}

async function fileExists(p) {
  try { await fs.access(p); return true; } catch { return false; }
}

async function ensureLogin(context, url) {
  const page = await context.newPage();
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  log('navigated to Gemini, checking login state...');

  // Poll for "logged in" signal: the prompt textarea exists.
  // If sign-in CTA visible, prompt user.
  const start = Date.now();
  const TIMEOUT = 5 * 60_000; // 5 minutes for first-time login

  while (Date.now() - start < TIMEOUT) {
    // Likely signal that we're logged in: a contenteditable / textarea / rich-textarea visible.
    const promptInput = page.locator(
      'textarea, rich-textarea, [contenteditable="true"][role="textbox"]',
    ).first();
    if (await promptInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      log('detected prompt input — logged in.');
      await page.close();
      return;
    }
    log('not yet logged in. Please complete Google sign-in in the open browser window.');
    await page.waitForTimeout(5000);
  }
  throw new Error('Timed out waiting for Google sign-in. Re-run the script.');
}

async function generateOneImage(context, entry) {
  const page = await context.newPage();
  try {
    await page.goto(opts.url, { waitUntil: 'domcontentloaded' });

    // Find the prompt input. Gemini may use any of: textarea, rich-textarea, contenteditable.
    const input = page.locator(
      'rich-textarea, [contenteditable="true"][role="textbox"], textarea[placeholder*="prompt" i], textarea[aria-label*="prompt" i]',
    ).first();
    await input.waitFor({ state: 'visible', timeout: 30_000 });

    // Force the prompt to ask for a 16:9 image, since Gemini chat default is square.
    const promptText = `${entry.heroImagePrompt}\n\nGenerate the above as a single 16:9 hero illustration. Output one image only.`;

    await input.click();
    // For contenteditable, fill() may not work — use type or keyboard input
    try {
      await input.fill(promptText);
    } catch {
      await input.click();
      await page.keyboard.insertText(promptText);
    }

    await page.waitForTimeout(500);
    await page.keyboard.press('Enter');

    // Wait for an <img> to appear in the response.
    // Gemini renders generated images inside the latest model-response block.
    // EXCLUDE: profile pictures (header avatar) and other UI chrome.
    // Strategy: wait for a *large* image inside a model-response container.
    const imgLocator = page.locator([
      // Generated images typically have alt that mentions "image" or "generated" but NOT "profile"
      'img[alt*="generated" i]:not([alt*="profile" i]):not([class*="user-icon"])',
      // Or src on data: URIs (data:image/...)
      'img[src^="data:image"]:not([class*="user-icon"])',
      // Or hosted on Google content storage but explicitly NOT the avatar (avatar URL contains /a/ACg8oc... and ends with -c-v1-rj or similar)
      'img[src*="googleusercontent.com"]:not([src*="/a/"]):not([class*="user-icon"]):not([alt*="profile" i])',
      'img[src*="storage.googleapis.com"]:not([class*="user-icon"])',
    ].join(', ')).last();

    // Wait for the image to appear AND have meaningful dimensions (>200px wide).
    // This protects against thumbnails / icons that might match.
    await imgLocator.waitFor({ state: 'visible', timeout: PER_ENTRY_TIMEOUT_MS });

    // Verify the matched element is a real generated image, not a small UI element.
    // If width < 200px, wait longer for the actual image to render.
    const startWait = Date.now();
    while (Date.now() - startWait < 30_000) {
      const dims = await imgLocator.evaluate((el) => ({
        w: el.naturalWidth || el.width,
        h: el.naturalHeight || el.height,
      })).catch(() => ({ w: 0, h: 0 }));
      if (dims.w >= 200 && dims.h >= 200) break;
      await page.waitForTimeout(2000);
    }

    // Give Gemini a couple seconds to finalize streaming the image.
    await page.waitForTimeout(POST_GENERATE_DELAY_MS);

    const src = await imgLocator.getAttribute('src');
    if (!src) throw new Error('image element has no src');

    // Final dimension check; bail if still tiny (likely matched the wrong element)
    const finalDims = await imgLocator.evaluate((el) => ({
      w: el.naturalWidth || el.width,
      h: el.naturalHeight || el.height,
    })).catch(() => ({ w: 0, h: 0 }));
    if (finalDims.w < 200 || finalDims.h < 200) {
      throw new Error(`matched image too small (${finalDims.w}x${finalDims.h}) — likely UI element, not generated image`);
    }

    // Fetch the image bytes. Gemini sometimes uses data: URIs and sometimes remote URLs.
    // Use the page's fetch() so cookies/auth ride along for remote URLs.
    const arr = await page.evaluate(async (url) => {
      const resp = await fetch(url);
      const buf = await resp.arrayBuffer();
      return Array.from(new Uint8Array(buf));
    }, src);

    if (!arr || !arr.length) throw new Error('fetched image was empty');
    return Buffer.from(arr);
  } finally {
    await page.close().catch(() => {});
  }
}

async function processEntry(context, entry, file) {
  const outPath = path.join(OUTPUT_DIR, `${entry.slug}.webp`);

  if (await fileExists(outPath)) {
    log(`[${entry.slug}] already exists — skipping`);
    if (!entry.heroImage) {
      // File exists but JSON wasn't updated — fix the inconsistency
      entry.heroImage = `/projects/${entry.slug}.webp`;
      await saveProjects(file);
    }
    return 'skipped';
  }

  if (!entry.heroImagePrompt) {
    warn(`[${entry.slug}] no heroImagePrompt — skipping`);
    return 'skipped';
  }

  log(`[${entry.slug}] generating...`);
  const buf = await generateOneImage(context, entry);

  // Convert + resize.
  const optimized = await sharp(buf)
    .resize(TARGET_WIDTH, TARGET_HEIGHT, { fit: 'cover', position: 'center' })
    .webp({ quality: TARGET_QUALITY })
    .toBuffer();

  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  await fs.writeFile(outPath, optimized);

  // Update JSON incrementally
  entry.heroImage = `/projects/${entry.slug}.webp`;
  await saveProjects(file);

  log(`[${entry.slug}] wrote ${outPath} (${optimized.length} bytes)`);
  return 'ok';
}

async function main() {
  const file = await loadProjects();
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  const queue = file.entries.filter((e) => {
    if (opts.slug) return e.slug === opts.slug;
    return !e.heroImage; // only entries that don't yet have an image
  });

  log(`queue: ${queue.length} entries (out of ${file.entries.length} total)`);
  if (queue.length === 0) {
    log('nothing to do.');
    return;
  }

  const context = await chromium.launchPersistentContext(PW_DATA_DIR, {
    headless: opts.headless,
    viewport: { width: 1400, height: 900 },
    args: ['--disable-blink-features=AutomationControlled'],
  });

  await ensureLogin(context, opts.url);

  let okCount = 0;
  let skipCount = 0;
  let errCount = 0;

  for (const entry of queue) {
    try {
      const status = await processEntry(context, entry, file);
      if (status === 'ok') okCount++;
      else if (status === 'skipped') skipCount++;
    } catch (err) {
      errCount++;
      warn(`[${entry.slug}] FAILED: ${err.message}`);
    }
    // Brief pause between entries to be friendly to rate limits
    await new Promise((r) => setTimeout(r, 3_000));
  }

  await context.close();
  log(`done. ok=${okCount} skipped=${skipCount} errors=${errCount}`);
  if (errCount > 0) {
    log('re-run the script to retry failed entries (resume-safe).');
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error('[gen-hero] fatal:', err);
  process.exit(1);
});
