#!/usr/bin/env node
/**
 * Generate hero images via the Gemini API (faster, more reliable than Playwright).
 *
 * Setup:
 *   1. Get an API key from https://aistudio.google.com/apikey
 *   2. Add to .env.local: GEMINI_API_KEY=...
 *   3. npm install --save-dev @google/genai sharp  (already done)
 *
 * Usage:
 *   node scripts/generate-hero-images-api.mjs
 *   node scripts/generate-hero-images-api.mjs --slug health-pulse
 *   node scripts/generate-hero-images-api.mjs --concurrency 4
 *   GEMINI_IMAGE_MODEL=imagen-3.0-generate-002 node scripts/generate-hero-images-api.mjs
 *
 * Resume-safe: skips entries where public/projects/{slug}.webp already exists.
 * After each successful generation, projects.json is updated incrementally so partial
 * runs preserve progress.
 *
 * Concurrency defaults to 4. The API SDK handles authentication; the script throttles
 * back on 429 errors with exponential backoff (up to 3 retries per entry).
 */

import { GoogleGenAI } from '@google/genai';
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = process.cwd();
const PROJECTS_FILE = path.join(ROOT, 'data', 'projects.json');
const OUTPUT_DIR = path.join(ROOT, 'public', 'projects');
const MODEL = process.env.GEMINI_IMAGE_MODEL || 'imagen-4.0-generate-001';
const TARGET_WIDTH = 1280;
const TARGET_HEIGHT = 720;
const TARGET_QUALITY = 82;
const MAX_RETRIES = 6;
const BASE_BACKOFF_MS = 8_000;

const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const arg = (name) => {
  const i = args.indexOf(name);
  return i >= 0 && i + 1 < args.length ? args[i + 1] : undefined;
};

const opts = {
  slug: arg('--slug'),
  concurrency: Number(arg('--concurrency') || '4'),
};

function log(...m) { console.log('[gen-hero-api]', ...m); }
function warn(...m) { console.warn('[gen-hero-api]', ...m); }

async function loadProjects() {
  return JSON.parse(await fs.readFile(PROJECTS_FILE, 'utf-8'));
}

// Serialize JSON writes to avoid concurrent-writer interleaving.
let writeChain = Promise.resolve();
function saveProjects(file) {
  writeChain = writeChain.then(() =>
    fs.writeFile(PROJECTS_FILE, JSON.stringify(file, null, 2), 'utf-8'),
  );
  return writeChain;
}

async function fileExists(p) {
  try { await fs.access(p); return true; } catch { return false; }
}

/**
 * Try to extract image bytes from a `generateImages` response.
 *
 * The @google/genai SDK normalizes image bytes onto `image.imageBytes` (base64). For
 * older SDK shapes, it has shown up under `image.data` or `imageBytes` directly on
 * the generated image — handle all three defensively.
 */
function extractImageBytes(result) {
  const gen = result?.generatedImages?.[0];
  if (!gen) return null;
  const candidates = [
    gen.image?.imageBytes,
    gen.image?.data,
    gen.imageBytes,
  ];
  for (const c of candidates) {
    if (typeof c === 'string' && c.length > 0) {
      return Buffer.from(c, 'base64');
    }
    if (c instanceof Uint8Array || Buffer.isBuffer(c)) {
      return Buffer.from(c);
    }
  }
  return null;
}

async function generateOne(ai, slug, prompt) {
  const fullPrompt = `${prompt}\n\nA single 16:9 editorial illustration.`;

  let lastErr;
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const result = await ai.models.generateImages({
        model: MODEL,
        prompt: fullPrompt,
        config: { numberOfImages: 1, aspectRatio: '16:9' },
      });
      const buf = extractImageBytes(result);
      if (!buf) throw new Error('no image bytes in response');
      return buf;
    } catch (err) {
      lastErr = err;
      const msg = String(err?.message || err);
      const is429 = /429|RESOURCE_EXHAUSTED|rate limit/i.test(msg);
      const is5xx = /5\d\d|UNAVAILABLE|INTERNAL/i.test(msg);
      if (!is429 && !is5xx) throw err;
      const hintMatch = msg.match(/retry in ([\d.]+)s/i);
      const hintMs = hintMatch ? Math.ceil(parseFloat(hintMatch[1]) * 1000) + 1000 : 0;
      const expBackoff = BASE_BACKOFF_MS * Math.pow(2, attempt);
      const wait = Math.max(hintMs, expBackoff);
      warn(`[${slug}] attempt ${attempt + 1} failed (429/5xx); retrying in ${wait}ms`);
      await new Promise((r) => setTimeout(r, wait));
    }
  }
  throw lastErr;
}

async function processEntry(ai, entry, file) {
  const outPath = path.join(OUTPUT_DIR, `${entry.slug}.webp`);

  if (await fileExists(outPath)) {
    log(`[${entry.slug}] already exists — skipping`);
    if (!entry.heroImage) {
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
  const buf = await generateOne(ai, entry.slug, entry.heroImagePrompt);

  const optimized = await sharp(buf)
    .resize(TARGET_WIDTH, TARGET_HEIGHT, { fit: 'cover', position: 'center' })
    .webp({ quality: TARGET_QUALITY })
    .toBuffer();

  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  await fs.writeFile(outPath, optimized);

  entry.heroImage = `/projects/${entry.slug}.webp`;
  await saveProjects(file);

  log(`[${entry.slug}] wrote ${outPath} (${optimized.length} bytes)`);
  return 'ok';
}

/** Tiny concurrency pool. */
async function pool(items, limit, worker) {
  const results = [];
  let idx = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (idx < items.length) {
      const i = idx++;
      try {
        results[i] = await worker(items[i]);
      } catch (err) {
        results[i] = { __error: err };
      }
    }
  });
  await Promise.all(workers);
  return results;
}

async function main() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      'GEMINI_API_KEY is required. Get a key at https://aistudio.google.com/apikey '
        + 'and add `GEMINI_API_KEY=...` to .env.local.',
    );
  }
  const ai = new GoogleGenAI({ apiKey });

  const file = await loadProjects();
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  const queue = file.entries.filter((e) => {
    if (opts.slug) return e.slug === opts.slug;
    return !e.heroImage;
  });

  log(`queue: ${queue.length} entries (concurrency ${opts.concurrency}, model ${MODEL})`);
  if (queue.length === 0) {
    log('nothing to do.');
    return;
  }

  let okCount = 0;
  let skipCount = 0;
  let errCount = 0;

  const results = await pool(queue, opts.concurrency, async (entry) => {
    try {
      const status = await processEntry(ai, entry, file);
      return { slug: entry.slug, status };
    } catch (err) {
      warn(`[${entry.slug}] FAILED: ${err.message}`);
      return { slug: entry.slug, status: 'error', err };
    }
  });

  for (const r of results) {
    if (!r) continue;
    if (r.status === 'ok') okCount++;
    else if (r.status === 'skipped') skipCount++;
    else errCount++;
  }

  // Final flush of any pending JSON write.
  await writeChain;

  log(`done. ok=${okCount} skipped=${skipCount} errors=${errCount}`);
  if (errCount > 0) {
    log('re-run the script to retry failed entries (resume-safe).');
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error('[gen-hero-api] fatal:', err);
  process.exit(1);
});
