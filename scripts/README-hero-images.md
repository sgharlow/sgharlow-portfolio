# Hero image generation

Two pipelines for generating the 56 project hero images:

## Path A — Playwright (interactive, no API key needed)

Drives gemini.google.com/app in a Chromium window. Persistent login.

```bash
node scripts/generate-hero-images.mjs              # all missing entries
node scripts/generate-hero-images.mjs --slug X     # one entry
node scripts/generate-hero-images.mjs --headless   # for CI / unattended re-runs after first login
```

**First run:** a Chromium window opens. Sign in to Google. The script waits up to 5 minutes for sign-in to complete, then continues. Session persists in `./.pw-data/` (gitignored) so subsequent runs are non-interactive.

**Resume-safe:** entries with `public/projects/{slug}.webp` already present are skipped. After each successful generation, `data/projects.json` is updated incrementally so partial runs preserve progress.

**Failure handling:** if a single entry fails (selector drift, rate limit, safety filter), it's logged and the script continues. Re-run to retry; only failed/missing entries will be processed.

**Selector fragility:** Gemini's UI changes. If selectors break, edit the locators in `generate-hero-images.mjs`:

- `input` — the prompt textarea
- `imgLocator` — the rendered image element

Rate limits: Gemini's free tier may throttle after ~10-20 generations. The 3-second inter-entry delay is conservative; bump to 10s if you see throttling.

Some entries may fail due to safety filters (rare for editorial illustration prompts but possible). Re-run with `--slug X` to retry.

## Path B — Gemini API (faster, more reliable, requires API key)

```bash
# 1. Get an API key from https://aistudio.google.com/apikey
# 2. Add to .env.local:
echo "GEMINI_API_KEY=YOUR_KEY_HERE" >> .env.local

# 3. Run
node scripts/generate-hero-images-api.mjs
```

Concurrency: defaults to 4 parallel requests. Adjust with `--concurrency N`. Total runtime for 56 images at concurrency 4: ~3-5 min.

Default model: `imagen-4.0-generate-001`. If you don't have access (premium tier required), override with the env var:

```bash
GEMINI_IMAGE_MODEL=imagen-3.0-generate-002 node scripts/generate-hero-images-api.mjs
```

The script handles 429s and 5xx errors with exponential backoff (up to 3 retries per entry).

## Image specs

- Format: WebP, quality 82
- Dimensions: 1280x720 (16:9), via `sharp` resize with cover-fit
- Target size: ~80kb each (achieved by the WebP quality + resize combo)

Used as detail-page hero (cards use the colored rail instead per Spectrum Lab design).

## Re-generating a specific image

If you don't like one image:

```bash
rm public/projects/health-pulse.webp
# Tweak the prompt in data/projects.json (heroImagePrompt field)
node scripts/generate-hero-images.mjs --slug health-pulse
# or
node scripts/generate-hero-images-api.mjs --slug health-pulse
```

The script picks up the updated prompt automatically.

## Tracked vs gitignored

- `.pw-data/` is gitignored (contains your Google login cookies — DO NOT COMMIT).
- `public/projects/*.webp` is **tracked** so deploys ship the images.
