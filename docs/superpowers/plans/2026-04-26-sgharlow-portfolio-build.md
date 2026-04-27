# sgharlow-portfolio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a new public portfolio site at `www.learningai365.com` that aggregates sgharlow's AI learning projects (GitHub repos, Vercel deployments, hackathons, books) with a daily-rotating "spotlight" project on the homepage, and migrate the existing learningai content to `training.learningai365.com`.

**Architecture:** Greenfield Next.js 16 + React 19 + TypeScript + Tailwind v4 app. Curated `data/projects.json` is the source of truth; build-time enrichment script calls GitHub + Vercel APIs to derive status fields. Static-first with ISR (1h spotlight, 6h elsewhere). No DB, no auth, no CMS. Deployed on a new Vercel project; existing `learningai365` Vercel project gets renamed to `learningai365-training` at cutover.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind v4, Vitest 4, Playwright, gh CLI, Vercel CLI, GitHub REST API, Vercel REST API.

**Note on Next.js version:** Plan was originally drafted as Next.js 15. Task 1's `create-next-app@latest` installed Next 16.2.4, which is what your other production sites already run (justicewatch, insight-exit per MEMORY). Next 16 is the actual stack. Subsequent tasks may need minor adjustments where Next 16 deviates from 15 conventions; flag any such drift during implementation.

**Spec:** `docs/superpowers/specs/2026-04-26-learningai365-pivot-design.md`

---

## File structure (locked)

```
sgharlow-portfolio/
├── app/
│   ├── page.tsx                     # spotlight interstitial at /
│   ├── today/page.tsx               # alias of /
│   ├── grid/page.tsx                # scrollable grid
│   ├── projects/[slug]/page.tsx     # project detail
│   ├── shop/page.tsx                # books + products
│   ├── sitemap.ts
│   ├── robots.ts
│   └── layout.tsx                   # top nav + footer band
├── components/
│   ├── ProjectCard.tsx
│   ├── ProjectHoverPopup.tsx
│   ├── ProjectModal.tsx
│   ├── ProjectLinkRows.tsx          # shared row content for hover + modal
│   ├── SpotlightInterstitial.tsx
│   ├── FooterMonetizationBand.tsx
│   ├── StatusBadge.tsx
│   ├── HeroImage.tsx                # renders file or programmatic stub
│   └── TopNav.tsx
├── lib/
│   ├── enrichment-types.ts
│   ├── projects.ts
│   ├── daily-spotlight.ts
│   └── links.ts                     # appendUtm()
├── data/
│   ├── projects.json
│   └── projects.enriched.json       # gitignored
├── scripts/
│   ├── enrich-projects.ts
│   └── list-image-prompts.ts
├── public/
│   └── projects/                    # hero images dropped here
├── tests/
│   ├── unit/daily-spotlight.test.ts
│   ├── unit/projects-loader.test.ts
│   ├── unit/links.test.ts
│   ├── unit/enrich-projects.test.ts
│   └── e2e/spotlight-to-grid.spec.ts
├── docs/
│   └── superpowers/
│       ├── specs/2026-04-26-learningai365-pivot-design.md
│       └── plans/2026-04-26-sgharlow-portfolio-build.md (this file)
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
├── next.config.ts
├── tailwind.config.ts (v4 uses CSS-first config; this may be unused)
├── postcss.config.mjs
├── vitest.config.ts
├── playwright.config.ts
└── README.md
```

---

## SECTION 1 — Repo scaffolding

### Task 1: Initialize Next.js project

**Files:**
- Create: `C:\Users\sghar\CascadeProjects\portfolio\` (entire scaffold)

- [ ] **Step 1: Verify the portfolio folder is empty**

Run: `ls -la /c/Users/sghar/CascadeProjects/portfolio`
Expected: only `.` and `..` entries (and possibly the `docs/` folder containing this plan).

- [ ] **Step 2: Initialize Next.js 15 with App Router + TS + Tailwind**

Run from `C:/Users/sghar/CascadeProjects/`:
```bash
npx --yes create-next-app@latest portfolio \
  --typescript --tailwind --app --src-dir=false \
  --import-alias "@/*" --eslint --no-turbopack --use-npm \
  --skip-install
```

Note: `--src-dir=false` puts `app/` at the project root (not under `src/`).
If create-next-app prompts despite the flags, accept all defaults.

- [ ] **Step 3: Install dependencies**

Run from `C:/Users/sghar/CascadeProjects/portfolio/`:
```bash
npm install
npm install --save-dev vitest @vitest/ui @testing-library/react @testing-library/jest-dom jsdom @playwright/test tsx
npm install date-fns
```

- [ ] **Step 4: Verify the dev server starts**

Run: `npm run dev` (run in background), wait 5s, then `curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000` → expect `200`. Kill the dev server.

- [ ] **Step 5: Commit baseline scaffold**

```bash
git add .
git commit -m "chore: initialize next.js 15 portfolio scaffold"
```

---

### Task 2: Move existing spec/plan into the repo

**Files:**
- Verify: `docs/superpowers/specs/2026-04-26-learningai365-pivot-design.md` (already created)
- Verify: `docs/superpowers/plans/2026-04-26-sgharlow-portfolio-build.md` (this file)

- [ ] **Step 1: Confirm files exist**

Run: `ls docs/superpowers/specs/ docs/superpowers/plans/`
Expected: spec + plan files visible.

- [ ] **Step 2: Commit**

```bash
git add docs/
git commit -m "docs: add design spec and implementation plan"
```

---

### Task 3: Configure project metadata + scripts

**Files:**
- Modify: `package.json`
- Create: `.env.example`
- Create: `README.md`

- [ ] **Step 1: Update `package.json` scripts**

Edit `package.json` so the `scripts` block becomes:

```json
{
  "scripts": {
    "dev": "next dev",
    "prebuild": "tsx scripts/enrich-projects.ts",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test",
    "list-prompts": "tsx scripts/list-image-prompts.ts"
  }
}
```

Also add `"name": "sgharlow-portfolio"` and `"private": false` (this repo is public).

- [ ] **Step 2: Create `.env.example`**

```bash
# GitHub token with read:packages + public_repo scopes
GH_TOKEN=

# Vercel token + team ID for the steves-projects-a71becf4 scope
VERCEL_TOKEN=
VERCEL_TEAM_ID=

# Site URL used in metadataBase + sitemap. Override per environment.
NEXT_PUBLIC_SITE_URL=https://www.learningai365.com
```

- [ ] **Step 3: Create minimal `README.md`**

```markdown
# sgharlow-portfolio

Personal AI-learning portfolio at https://www.learningai365.com.

See `docs/superpowers/specs/2026-04-26-learningai365-pivot-design.md` for design.

## Local dev

\`\`\`bash
cp .env.example .env.local
# fill in GH_TOKEN, VERCEL_TOKEN, VERCEL_TEAM_ID
npm install
npm run dev
\`\`\`

## Build

\`\`\`bash
npm run build  # runs prebuild enrichment first
\`\`\`

## Test

\`\`\`bash
npm test          # unit
npm run test:e2e  # playwright
\`\`\`
```

- [ ] **Step 4: Add `data/projects.enriched.json` to `.gitignore`**

Append to `.gitignore`:

```
# build-time enrichment output
/data/projects.enriched.json

# environment
.env.local
.env*.local
```

- [ ] **Step 5: Commit**

```bash
git add package.json .env.example README.md .gitignore
git commit -m "chore: configure scripts, env example, readme, gitignore"
```

---

### Task 4: Configure Vitest

**Files:**
- Create: `vitest.config.ts`
- Create: `tests/setup.ts`

- [ ] **Step 1: Write `vitest.config.ts`**

```typescript
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    globals: true,
    include: ['tests/unit/**/*.test.ts', 'tests/unit/**/*.test.tsx'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
});
```

- [ ] **Step 2: Write `tests/setup.ts`**

```typescript
import '@testing-library/jest-dom/vitest';
```

- [ ] **Step 3: Verify vitest runs (no tests yet → exit 0)**

Run: `npm test`
Expected: `No test files found` is acceptable; exit code 0.

- [ ] **Step 4: Commit**

```bash
git add vitest.config.ts tests/setup.ts
git commit -m "chore: configure vitest"
```

---

### Task 5: Configure Playwright

**Files:**
- Create: `playwright.config.ts`

- [ ] **Step 1: Write `playwright.config.ts`**

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  retries: 0,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});
```

- [ ] **Step 2: Install browsers**

Run: `npx playwright install chromium`

- [ ] **Step 3: Commit**

```bash
git add playwright.config.ts
git commit -m "chore: configure playwright"
```

---

### Task 6: Create GitHub repo and push

**Files:** none (git operations only)

- [ ] **Step 1: Create the GitHub repo**

Run: `gh repo create sgharlow/sgharlow-portfolio --public --description "Personal AI-learning portfolio at www.learningai365.com" --source . --remote origin --push`

If `gh` is not authenticated, run `gh auth status` and resolve.

- [ ] **Step 2: Verify the push**

Run: `gh repo view sgharlow/sgharlow-portfolio --json url,visibility,description`
Expected: visibility=PUBLIC, url=https://github.com/sgharlow/sgharlow-portfolio.

- [ ] **Step 3: Enable Dependabot**

Create `.github/dependabot.yml`:

```yaml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "weekly"
```

Commit:
```bash
git add .github/dependabot.yml
git commit -m "chore: enable dependabot"
git push
```

---

### Task 7: Link Vercel project

**Files:**
- Create: `.vercel/project.json` (auto-generated by `vercel link`)

- [ ] **Step 1: Link a new Vercel project**

Run: `vercel link --yes --project sgharlow-portfolio`

If the project doesn't exist, Vercel will create it. Confirm the scope is `steves-projects-a71becf4`.

- [ ] **Step 2: Verify `.vercel/project.json` was created**

Run: `cat .vercel/project.json`
Expected: contains `projectId` and `orgId`.

- [ ] **Step 3: Pull Vercel env vars (will be empty initially)**

Run: `vercel env pull .env.local`
Expected: `Created .env.local file` (likely with no real vars yet).

- [ ] **Step 4: Add the three required env vars to Vercel for Production**

```bash
vercel env add GH_TOKEN production
# paste a fine-grained PAT with public_repo + metadata read scope
vercel env add VERCEL_TOKEN production
# paste a Vercel personal access token
vercel env add VERCEL_TEAM_ID production
# paste team_nP3HzRc3PNm6SaWiApTGkEWa (from existing learningai365 .vercel/project.json orgId — same scope)
vercel env add NEXT_PUBLIC_SITE_URL production
# value: https://www.learningai365.com
```

Repeat for `preview` and `development` environments (paste same values; for `development` use `http://localhost:3000` for `NEXT_PUBLIC_SITE_URL`).

- [ ] **Step 5: Commit Vercel link metadata**

`.vercel/` is normally gitignored by Next.js scaffold — confirm it is, then no commit needed.

---

## SECTION 2 — Type definitions and data loader

### Task 8: Define enrichment types

**Files:**
- Create: `lib/enrichment-types.ts`

- [ ] **Step 1: Write the type definitions**

```typescript
export type Category = 'active' | 'frozen' | 'experiment' | 'product';

export type ProjectKind =
  | 'web-app'
  | 'cli'
  | 'mcp-server'
  | 'chrome-ext'
  | 'reddit-game'
  | 'library'
  | 'book'
  | 'course-platform';

export type HackathonStatus = 'submitted' | 'finalist' | 'won' | 'active';

export type ProductKind = 'kindle' | 'lemonsqueezy' | 'gumroad' | 'other';

export interface HackathonLink {
  name: string;
  url?: string;
  status: HackathonStatus;
  prize?: string;
}

export interface ProductLink {
  label: string;
  url: string;
  kind: ProductKind;
}

export interface ProjectLinks {
  deployedSite?: string;
  githubRepo?: string;
  youtubeVideo?: string;
  hackathon?: HackathonLink[];
  products?: ProductLink[];
}

export interface ProjectSpotlight {
  longDescription: string;
  callToAction?: { label: string; url: string };
  overrideDates?: string[];
}

export interface ProjectEntry {
  slug: string;
  name: string;
  tagline: string;
  summary: string;
  category: Category;
  kind: ProjectKind;
  heroImage: string | null;
  heroImagePrompt: string;
  order?: number;
  links: ProjectLinks;
  statusOverride?: string;
  spotlight?: ProjectSpotlight;
}

export interface ProjectsFile {
  version: 1;
  generatedAt?: string;
  spotlightLaunchDate: string;
  entries: ProjectEntry[];
}

export interface GithubEnrichment {
  lastCommitAt: string;
  archived: boolean;
  stars: number;
  primaryLanguage: string | null;
  latestRelease?: { tag: string; publishedAt: string };
  fetchedAt: string;
  fetchOk: boolean;
}

export interface VercelEnrichment {
  lastDeploymentAt: string;
  lastDeploymentState: 'READY' | 'ERROR' | 'BUILDING' | 'CANCELED';
  productionDomain: string;
  fetchedAt: string;
  fetchOk: boolean;
}

export interface EnrichmentBlock {
  github?: GithubEnrichment;
  vercel?: VercelEnrichment;
  derivedStatus: string;
  activityScore: number;
}

export interface EnrichedProjectEntry extends ProjectEntry {
  enriched: EnrichmentBlock;
}

export interface EnrichedProjectsFile extends Omit<ProjectsFile, 'entries'> {
  generatedAt: string;
  entries: EnrichedProjectEntry[];
}
```

- [ ] **Step 2: Verify it typechecks**

Run: `npm run typecheck`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add lib/enrichment-types.ts
git commit -m "feat: define enrichment types"
```

---

### Task 9: Seed `data/projects.json` with three entries

**Files:**
- Create: `data/projects.json`

- [ ] **Step 1: Write a minimal seed file with one of each non-product category**

```json
{
  "version": 1,
  "spotlightLaunchDate": "2026-04-26",
  "entries": [
    {
      "slug": "health-pulse",
      "name": "HealthPulse AI",
      "tagline": "Healthcare performance MCP server.",
      "summary": "MCP server that gives AI agents structured access to healthcare performance data. Submitted to Agents Assemble.",
      "category": "active",
      "kind": "mcp-server",
      "heroImage": null,
      "heroImagePrompt": "Format: 16:9 hero illustration, dark background, technical-but-warm aesthetic. Style: editorial flat illustration, subtle gradient lighting, clean geometric forms, muted color palette anchored on emerald green, NO text, NO logos, NO faces. Composition: central subject on a dark gradient backdrop, soft rim lighting, negative space top-right. Subject: a stylized heart-rate ECG line transforming into a network of connected nodes, with a translucent shield motif suggesting healthcare data integrity. Mood: vigilant, precise.",
      "links": {
        "deployedSite": "https://web-umber-alpha-41.vercel.app",
        "githubRepo": "sgharlow/health-pulse",
        "hackathon": [
          { "name": "Agents Assemble", "status": "submitted", "prize": "$25K pool" }
        ]
      },
      "spotlight": {
        "longDescription": "HealthPulse AI is an MCP server that exposes healthcare performance metrics to AI agents through a structured tool interface. Built for the Agents Assemble hackathon, it demonstrates how MCP can bridge AI assistants and clinical reporting workflows."
      }
    },
    {
      "slug": "comment-conspiracy",
      "name": "Comment Conspiracy",
      "tagline": "Reddit Devvit game — spot the AI comment.",
      "summary": "Daily Reddit game built on Devvit where players guess which comment in a thread was written by AI. Submitted to Reddit Games & Puzzles 2026.",
      "category": "frozen",
      "kind": "reddit-game",
      "heroImage": null,
      "heroImagePrompt": "Format: 16:9 hero illustration, dark background, technical-but-warm aesthetic. Style: editorial flat illustration, subtle gradient lighting, clean geometric forms, muted color palette anchored on warm amber, NO text, NO logos, NO faces. Composition: central subject on a dark gradient backdrop, soft rim lighting, negative space top-right. Subject: a tangled web of comment-bubble shapes connected by red string like a conspiracy board, with one bubble glowing as the real one. Mood: playful, suspicious.",
      "links": {
        "githubRepo": "sgharlow/comment-conspiracy",
        "hackathon": [
          { "name": "Reddit Games & Puzzles 2026", "status": "submitted" }
        ]
      },
      "spotlight": {
        "longDescription": "Comment Conspiracy is a Devvit-powered daily Reddit game. Each post presents a thread of comments, one of which was AI-generated; players have to spot the imposter. Submitted to the Reddit Games & Puzzles 2026 hackathon."
      }
    },
    {
      "slug": "ender-ai-leadership",
      "name": "Ender AI Leadership",
      "tagline": "Strategy book on AI-augmented leadership.",
      "summary": "Book exploring how leaders can adopt AI augmentation without losing strategic clarity.",
      "category": "product",
      "kind": "book",
      "heroImage": null,
      "heroImagePrompt": "Format: 16:9 hero illustration, dark background, technical-but-warm aesthetic. Style: editorial flat illustration, subtle gradient lighting, clean geometric forms, muted color palette anchored on electric blue, NO text, NO logos, NO faces. Composition: central subject on a dark gradient backdrop, soft rim lighting, negative space top-right. Subject: a stylized chess king piece dissolving at the edges into networked light particles, suggesting strategic command transmuted into AI-augmented decision-making. Mood: contemplative, decisive.",
      "links": {
        "products": [
          { "label": "Buy on Amazon", "url": "https://example.com/TODO-replace-with-amazon-asin", "kind": "kindle" }
        ]
      }
    }
  ]
}
```

- [ ] **Step 2: Commit**

```bash
git add data/projects.json
git commit -m "feat: seed projects.json with three entries"
```

---

### Task 10: Write the projects loader (TDD)

**Files:**
- Create: `tests/unit/projects-loader.test.ts`
- Create: `lib/projects.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// tests/unit/projects-loader.test.ts
import { describe, it, expect } from 'vitest';
import { loadProjectsFile } from '@/lib/projects';

describe('loadProjectsFile', () => {
  it('loads the seed projects.json with three entries', async () => {
    const file = await loadProjectsFile();
    expect(file.version).toBe(1);
    expect(file.entries).toHaveLength(3);
    expect(file.entries.map((e) => e.slug).sort()).toEqual([
      'comment-conspiracy',
      'ender-ai-leadership',
      'health-pulse',
    ]);
  });

  it('throws when a required field is missing', async () => {
    const malformed = { version: 1, spotlightLaunchDate: '2026-04-26', entries: [{ slug: 'x' }] };
    await expect(async () => {
      const { validateProjectsFile } = await import('@/lib/projects');
      validateProjectsFile(malformed);
    }).rejects.toThrow(/missing required field/i);
  });
});
```

- [ ] **Step 2: Run test, confirm it fails**

Run: `npm test`
Expected: 2 failures with "Cannot find module '@/lib/projects'".

- [ ] **Step 3: Implement `lib/projects.ts`**

```typescript
import fs from 'node:fs/promises';
import path from 'node:path';
import type { EnrichedProjectsFile, ProjectEntry, ProjectsFile } from './enrichment-types';

const REQUIRED_ENTRY_FIELDS: (keyof ProjectEntry)[] = [
  'slug', 'name', 'tagline', 'summary', 'category', 'kind', 'heroImagePrompt', 'links',
];

export function validateProjectsFile(raw: unknown): asserts raw is ProjectsFile {
  if (!raw || typeof raw !== 'object') throw new Error('projects.json must be an object');
  const file = raw as Partial<ProjectsFile>;
  if (file.version !== 1) throw new Error('projects.json: version must be 1');
  if (typeof file.spotlightLaunchDate !== 'string') throw new Error('projects.json: spotlightLaunchDate is required');
  if (!Array.isArray(file.entries)) throw new Error('projects.json: entries must be an array');
  for (const entry of file.entries) {
    for (const field of REQUIRED_ENTRY_FIELDS) {
      if (!(field in entry)) {
        throw new Error(`projects.json entry "${(entry as ProjectEntry).slug ?? '?'}" missing required field: ${field}`);
      }
    }
  }
}

export async function loadProjectsFile(): Promise<ProjectsFile> {
  const filePath = path.join(process.cwd(), 'data', 'projects.json');
  const raw = JSON.parse(await fs.readFile(filePath, 'utf-8'));
  validateProjectsFile(raw);
  return raw;
}

export async function loadEnrichedProjectsFile(): Promise<EnrichedProjectsFile> {
  const filePath = path.join(process.cwd(), 'data', 'projects.enriched.json');
  try {
    const raw = JSON.parse(await fs.readFile(filePath, 'utf-8'));
    return raw as EnrichedProjectsFile;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
      throw new Error('projects.enriched.json not found — run `npm run prebuild` first');
    }
    throw err;
  }
}
```

- [ ] **Step 4: Run tests, verify pass**

Run: `npm test`
Expected: 2 pass.

- [ ] **Step 5: Commit**

```bash
git add lib/projects.ts tests/unit/projects-loader.test.ts
git commit -m "feat: projects loader with validation"
```

---

## SECTION 3 — Daily Spotlight algorithm (TDD)

### Task 11: Write spotlight tests

**Files:**
- Create: `tests/unit/daily-spotlight.test.ts`

- [ ] **Step 1: Write the failing test file**

```typescript
import { describe, it, expect } from 'vitest';
import { selectSpotlightPool, getTodaysSpotlight } from '@/lib/daily-spotlight';
import type { EnrichedProjectEntry, EnrichedProjectsFile } from '@/lib/enrichment-types';

function entry(slug: string, category: EnrichedProjectEntry['category']): EnrichedProjectEntry {
  return {
    slug, name: slug, tagline: 't', summary: 's',
    category, kind: 'web-app', heroImage: null, heroImagePrompt: '',
    links: {},
    enriched: { derivedStatus: 'x', activityScore: 0 },
  };
}

function file(entries: EnrichedProjectEntry[], launch = '2026-04-26'): EnrichedProjectsFile {
  return { version: 1, generatedAt: '2026-04-26T00:00:00Z', spotlightLaunchDate: launch, entries };
}

describe('selectSpotlightPool', () => {
  it('includes only active and frozen entries, sorted by slug', () => {
    const entries = [
      entry('zebra', 'active'),
      entry('apple', 'experiment'),
      entry('mango', 'frozen'),
      entry('banana', 'active'),
      entry('book', 'product'),
    ];
    const pool = selectSpotlightPool(entries);
    expect(pool.map((e) => e.slug)).toEqual(['banana', 'mango', 'zebra']);
  });

  it('returns empty array when no eligible entries', () => {
    expect(selectSpotlightPool([entry('a', 'experiment'), entry('b', 'product')])).toEqual([]);
  });
});

describe('getTodaysSpotlight', () => {
  const pool = [entry('alpha', 'active'), entry('bravo', 'frozen'), entry('charlie', 'active')];

  it('rotates deterministically by day', () => {
    const f = file(pool);
    expect(getTodaysSpotlight(f, new Date('2026-04-26T12:00:00Z')).slug).toBe('alpha');
    expect(getTodaysSpotlight(f, new Date('2026-04-27T12:00:00Z')).slug).toBe('bravo');
    expect(getTodaysSpotlight(f, new Date('2026-04-28T12:00:00Z')).slug).toBe('charlie');
    expect(getTodaysSpotlight(f, new Date('2026-04-29T12:00:00Z')).slug).toBe('alpha');
  });

  it('honors per-day overrides', () => {
    const overridden = [...pool];
    overridden[2] = { ...overridden[2], spotlight: { longDescription: '', overrideDates: ['2026-04-26'] } };
    const f = file(overridden);
    expect(getTodaysSpotlight(f, new Date('2026-04-26T00:00:00Z')).slug).toBe('charlie');
  });

  it('handles dates before launch without crashing', () => {
    const f = file(pool, '2026-04-26');
    const result = getTodaysSpotlight(f, new Date('2026-04-20T12:00:00Z'));
    expect(['alpha', 'bravo', 'charlie']).toContain(result.slug);
  });

  it('throws when pool is empty', () => {
    const f = file([entry('only-experiment', 'experiment')]);
    expect(() => getTodaysSpotlight(f, new Date('2026-04-26'))).toThrow(/empty/i);
  });

  it('returns the single entry consistently when pool size is 1', () => {
    const f = file([entry('lonely', 'active')]);
    for (let d = 0; d < 30; d++) {
      const date = new Date(`2026-04-${String(26 + (d % 4)).padStart(2, '0')}T12:00:00Z`);
      expect(getTodaysSpotlight(f, date).slug).toBe('lonely');
    }
  });

  it('produces a stable 30-day snapshot for a fixture pool', () => {
    const fivePool = [
      entry('aardvark', 'active'),
      entry('beaver', 'frozen'),
      entry('coyote', 'active'),
      entry('dingo', 'frozen'),
      entry('emu', 'active'),
    ];
    const f = file(fivePool, '2026-04-26');
    const slugs: string[] = [];
    for (let d = 0; d < 30; d++) {
      const date = new Date(Date.UTC(2026, 3, 26 + d, 12));
      slugs.push(getTodaysSpotlight(f, date).slug);
    }
    expect(slugs).toEqual([
      'aardvark', 'beaver', 'coyote', 'dingo', 'emu',
      'aardvark', 'beaver', 'coyote', 'dingo', 'emu',
      'aardvark', 'beaver', 'coyote', 'dingo', 'emu',
      'aardvark', 'beaver', 'coyote', 'dingo', 'emu',
      'aardvark', 'beaver', 'coyote', 'dingo', 'emu',
      'aardvark', 'beaver', 'coyote', 'dingo', 'emu',
    ]);
  });
});
```

- [ ] **Step 2: Run, confirm fails**

Run: `npm test`
Expected: failures (module not found).

- [ ] **Step 3: Commit (test only)**

```bash
git add tests/unit/daily-spotlight.test.ts
git commit -m "test: add daily-spotlight tests (failing)"
```

---

### Task 12: Implement daily-spotlight

**Files:**
- Create: `lib/daily-spotlight.ts`

- [ ] **Step 1: Write the implementation**

```typescript
import type { EnrichedProjectEntry, EnrichedProjectsFile } from './enrichment-types';

const SPOTLIGHT_POOL_CATEGORIES = ['active', 'frozen'] as const;

function getTodayUTC(now: Date): string {
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, '0');
  const d = String(now.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function selectSpotlightPool(entries: EnrichedProjectEntry[]): EnrichedProjectEntry[] {
  return entries
    .filter((e) => (SPOTLIGHT_POOL_CATEGORIES as readonly string[]).includes(e.category))
    .sort((a, b) => a.slug.localeCompare(b.slug));
}

export function getTodaysSpotlight(
  file: EnrichedProjectsFile,
  now: Date = new Date(),
): EnrichedProjectEntry {
  const pool = selectSpotlightPool(file.entries);
  if (pool.length === 0) {
    throw new Error('Spotlight pool is empty — at least one active or frozen entry required');
  }

  const todayStr = getTodayUTC(now);
  const override = pool.find((e) => e.spotlight?.overrideDates?.includes(todayStr));
  if (override) return override;

  const todayUTC = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const launch = new Date(file.spotlightLaunchDate);
  const launchUTC = Date.UTC(launch.getUTCFullYear(), launch.getUTCMonth(), launch.getUTCDate());
  const daysSinceLaunch = Math.floor((todayUTC - launchUTC) / 86_400_000);
  const index = ((daysSinceLaunch % pool.length) + pool.length) % pool.length;
  return pool[index];
}
```

- [ ] **Step 2: Run tests, verify pass**

Run: `npm test`
Expected: 7 pass.

- [ ] **Step 3: Commit**

```bash
git add lib/daily-spotlight.ts
git commit -m "feat: daily-spotlight selection algorithm"
```

---

## SECTION 4 — Build-time enrichment script (TDD)

### Task 13: Enrichment script tests

**Files:**
- Create: `tests/unit/enrich-projects.test.ts`

- [ ] **Step 1: Write the failing tests**

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { deriveStatus, computeActivityScore, formatRelative } from '@/scripts/enrich-projects';

describe('formatRelative', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-26T00:00:00Z'));
  });

  it('formats ages in d/w/mo/y', () => {
    expect(formatRelative('2026-04-23T00:00:00Z')).toBe('3d ago');
    expect(formatRelative('2026-04-12T00:00:00Z')).toBe('2w ago');
    expect(formatRelative('2026-01-26T00:00:00Z')).toBe('3mo ago');
    expect(formatRelative('2024-04-26T00:00:00Z')).toBe('2y ago');
  });
});

describe('computeActivityScore', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-26T00:00:00Z'));
  });

  it('uses the most recent of github + vercel timestamps', () => {
    expect(
      computeActivityScore({
        github: { lastCommitAt: '2026-04-20T00:00:00Z' },
        vercel: { lastDeploymentAt: '2026-04-25T00:00:00Z' },
      }),
    ).toBe(1);
  });

  it('returns +Infinity-ish for entries with no signals', () => {
    expect(computeActivityScore({})).toBeGreaterThan(99_999);
  });
});

describe('deriveStatus', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-26T00:00:00Z'));
  });

  it('honors statusOverride first', () => {
    expect(deriveStatus('active', 'Custom override', undefined, undefined)).toBe('Custom override');
  });

  it('formats from github lastCommit when no override', () => {
    expect(
      deriveStatus('active', undefined, { lastCommitAt: '2026-04-23T00:00:00Z' }, undefined),
    ).toBe('Active — last commit 3d ago');
  });

  it('falls back to category-only string when no enrichment', () => {
    expect(deriveStatus('frozen', undefined, undefined, undefined)).toBe('Frozen / archived');
    expect(deriveStatus('experiment', undefined, undefined, undefined)).toBe('Experiment');
    expect(deriveStatus('product', undefined, undefined, undefined)).toBe('Product');
  });
});
```

- [ ] **Step 2: Run, confirm fails**

Run: `npm test`
Expected: failures (module not found).

- [ ] **Step 3: Commit**

```bash
git add tests/unit/enrich-projects.test.ts
git commit -m "test: enrich-projects helpers (failing)"
```

---

### Task 14: Implement enrichment script

**Files:**
- Create: `scripts/enrich-projects.ts`

- [ ] **Step 1: Write the script**

```typescript
import fs from 'node:fs/promises';
import path from 'node:path';
import type {
  EnrichedProjectEntry, EnrichedProjectsFile, GithubEnrichment, ProjectEntry, ProjectsFile, VercelEnrichment,
} from '../lib/enrichment-types';
import { loadProjectsFile } from '../lib/projects';

// ---------- exported helpers (testable) ----------

export function formatRelative(iso: string, now: Date = new Date()): string {
  const ms = now.getTime() - new Date(iso).getTime();
  const days = Math.floor(ms / 86_400_000);
  if (days < 7) return `${Math.max(days, 0)}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

export function computeActivityScore(
  signals: { github?: { lastCommitAt: string }; vercel?: { lastDeploymentAt: string } },
  now: Date = new Date(),
): number {
  const candidates: number[] = [];
  if (signals.github?.lastCommitAt) candidates.push(new Date(signals.github.lastCommitAt).getTime());
  if (signals.vercel?.lastDeploymentAt) candidates.push(new Date(signals.vercel.lastDeploymentAt).getTime());
  if (candidates.length === 0) return Number.MAX_SAFE_INTEGER;
  return Math.floor((now.getTime() - Math.max(...candidates)) / 86_400_000);
}

export function deriveStatus(
  category: ProjectEntry['category'],
  statusOverride: string | undefined,
  github: { lastCommitAt: string } | undefined,
  vercel: { lastDeploymentAt: string } | undefined,
  now: Date = new Date(),
): string {
  if (statusOverride) return statusOverride;

  const lastSignal = [github?.lastCommitAt, vercel?.lastDeploymentAt]
    .filter(Boolean)
    .sort()
    .at(-1);

  if (lastSignal) {
    const labels: Record<ProjectEntry['category'], string> = {
      active: 'Active', frozen: 'Frozen', experiment: 'Experiment', product: 'Product',
    };
    const verb = github?.lastCommitAt ? 'last commit' : 'last deploy';
    return `${labels[category]} — ${verb} ${formatRelative(lastSignal, now)}`;
  }

  return { active: 'Active', frozen: 'Frozen / archived', experiment: 'Experiment', product: 'Product' }[category];
}

// ---------- API fetchers ----------

const GH_API = 'https://api.github.com';
const VERCEL_API = 'https://api.vercel.com';

async function fetchGithub(repo: string, token: string): Promise<GithubEnrichment | undefined> {
  try {
    const headers = { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' };
    const repoResp = await fetch(`${GH_API}/repos/${repo}`, { headers });
    if (!repoResp.ok) {
      console.warn(`[enrich] github ${repo} → ${repoResp.status}`);
      return undefined;
    }
    const repoJson = (await repoResp.json()) as Record<string, unknown>;

    const commitsResp = await fetch(`${GH_API}/repos/${repo}/commits?per_page=1`, { headers });
    const commitsJson = (await commitsResp.json()) as Array<{ commit: { committer: { date: string } } }>;
    const lastCommitAt = commitsJson[0]?.commit?.committer?.date ?? (repoJson.pushed_at as string);

    const releasesResp = await fetch(`${GH_API}/repos/${repo}/releases/latest`, { headers });
    let latestRelease: GithubEnrichment['latestRelease'];
    if (releasesResp.ok) {
      const r = (await releasesResp.json()) as { tag_name: string; published_at: string };
      latestRelease = { tag: r.tag_name, publishedAt: r.published_at };
    }

    return {
      lastCommitAt,
      archived: Boolean(repoJson.archived),
      stars: Number(repoJson.stargazers_count) || 0,
      primaryLanguage: (repoJson.language as string | null) ?? null,
      latestRelease,
      fetchedAt: new Date().toISOString(),
      fetchOk: true,
    };
  } catch (err) {
    console.warn(`[enrich] github ${repo} threw`, err);
    return undefined;
  }
}

async function fetchVercel(projectName: string, token: string, teamId: string): Promise<VercelEnrichment | undefined> {
  try {
    const headers = { Authorization: `Bearer ${token}` };
    const proj = await fetch(`${VERCEL_API}/v9/projects/${projectName}?teamId=${teamId}`, { headers });
    if (!proj.ok) {
      console.warn(`[enrich] vercel ${projectName} → ${proj.status}`);
      return undefined;
    }
    const projJson = (await proj.json()) as { id: string; name: string; targets?: Record<string, { domain?: string }> };

    const deploys = await fetch(
      `${VERCEL_API}/v6/deployments?projectId=${projJson.id}&teamId=${teamId}&target=production&limit=1`,
      { headers },
    );
    const deploysJson = (await deploys.json()) as { deployments: Array<{ created: number; state: VercelEnrichment['lastDeploymentState']; url: string }> };
    const latest = deploysJson.deployments[0];
    if (!latest) return undefined;

    return {
      lastDeploymentAt: new Date(latest.created).toISOString(),
      lastDeploymentState: latest.state,
      productionDomain: projJson.targets?.production?.domain ?? latest.url,
      fetchedAt: new Date().toISOString(),
      fetchOk: true,
    };
  } catch (err) {
    console.warn(`[enrich] vercel ${projectName} threw`, err);
    return undefined;
  }
}

// ---------- main ----------

async function enrichEntry(entry: ProjectEntry, ghToken: string, vercelToken: string, vercelTeamId: string): Promise<EnrichedProjectEntry> {
  const github = entry.links.githubRepo ? await fetchGithub(entry.links.githubRepo, ghToken) : undefined;
  const vercel = entry.links.deployedSite && entry.kind !== 'book'
    ? await fetchVercel(entry.slug, vercelToken, vercelTeamId)
    : undefined;

  const derivedStatus = deriveStatus(entry.category, entry.statusOverride, github, vercel);
  const activityScore = computeActivityScore({ github, vercel });

  return { ...entry, enriched: { github, vercel, derivedStatus, activityScore } };
}

async function main(): Promise<void> {
  const ghToken = process.env.GH_TOKEN;
  const vercelToken = process.env.VERCEL_TOKEN;
  const vercelTeamId = process.env.VERCEL_TEAM_ID;

  if (!ghToken || !vercelToken || !vercelTeamId) {
    throw new Error('GH_TOKEN, VERCEL_TOKEN, and VERCEL_TEAM_ID must all be set.');
  }

  const file: ProjectsFile = await loadProjectsFile();
  console.log(`[enrich] processing ${file.entries.length} entries`);

  const enriched: EnrichedProjectEntry[] = [];
  for (const entry of file.entries) {
    console.log(`[enrich] ${entry.slug}`);
    enriched.push(await enrichEntry(entry, ghToken, vercelToken, vercelTeamId));
  }

  const out: EnrichedProjectsFile = {
    ...file,
    generatedAt: new Date().toISOString(),
    entries: enriched,
  };

  const outPath = path.join(process.cwd(), 'data', 'projects.enriched.json');
  await fs.writeFile(outPath, JSON.stringify(out, null, 2), 'utf-8');
  console.log(`[enrich] wrote ${outPath}`);
}

if (import.meta.url === `file://${process.argv[1]?.replaceAll('\\', '/')}`) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
```

- [ ] **Step 2: Run unit tests, verify pass**

Run: `npm test`
Expected: helper tests pass.

- [ ] **Step 3: Run enrichment manually with a dummy token**

Run: `GH_TOKEN=dummy VERCEL_TOKEN=dummy VERCEL_TEAM_ID=team_x npx tsx scripts/enrich-projects.ts`
Expected: writes `data/projects.enriched.json` with 3 entries; github/vercel fields likely undefined or `fetchOk: false`. The script should NOT throw — it should complete with degraded enrichment.

- [ ] **Step 4: Commit**

```bash
git add scripts/enrich-projects.ts
git commit -m "feat: build-time enrichment script (gh + vercel apis)"
```

---

## SECTION 5 — UI primitives

### Task 15: HeroImage with programmatic stub fallback

**Files:**
- Create: `components/HeroImage.tsx`
- Create: `tests/unit/hero-image.test.tsx`

- [ ] **Step 1: Write the test**

```typescript
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { HeroImage } from '@/components/HeroImage';

describe('HeroImage', () => {
  it('renders an img when heroImage is set', () => {
    const { container } = render(
      <HeroImage slug="x" name="X" heroImage="/projects/x.webp" />,
    );
    expect(container.querySelector('img')).toBeTruthy();
  });

  it('renders a programmatic stub div when heroImage is null', () => {
    const { container, getByText } = render(
      <HeroImage slug="x" name="HealthPulse AI" heroImage={null} />,
    );
    expect(container.querySelector('img')).toBeNull();
    expect(getByText('HealthPulse AI')).toBeTruthy();
  });

  it('produces a stable hue for the same slug', () => {
    const { container } = render(<HeroImage slug="health-pulse" name="HP" heroImage={null} />);
    const div = container.querySelector('[data-stub-hue]');
    expect(div?.getAttribute('data-stub-hue')).toMatch(/^\d+$/);
  });
});
```

- [ ] **Step 2: Run test, fail**

Run: `npm test`
Expected: failure.

- [ ] **Step 3: Implement `components/HeroImage.tsx`**

```typescript
import Image from 'next/image';
import type { ReactElement } from 'react';

interface Props {
  slug: string;
  name: string;
  heroImage: string | null;
  priority?: boolean;
}

function hashSlug(slug: string): number {
  let h = 0;
  for (let i = 0; i < slug.length; i++) {
    h = (h * 31 + slug.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

export function HeroImage({ slug, name, heroImage, priority }: Props): ReactElement {
  if (heroImage) {
    return (
      <Image
        src={heroImage}
        alt={`${name} hero`}
        width={1280}
        height={720}
        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
        className="aspect-video w-full rounded-xl object-cover"
        priority={priority}
      />
    );
  }
  const hue = hashSlug(slug) % 360;
  return (
    <div
      className="aspect-video w-full rounded-xl flex items-center justify-center"
      data-stub-hue={hue}
      style={{
        background: `linear-gradient(135deg, hsl(${hue} 60% 22%), hsl(${(hue + 40) % 360} 70% 14%))`,
      }}
    >
      <span className="font-display text-2xl text-white/85 px-6 text-center">{name}</span>
    </div>
  );
}
```

- [ ] **Step 4: Run, pass**

Run: `npm test`

- [ ] **Step 5: Commit**

```bash
git add components/HeroImage.tsx tests/unit/hero-image.test.tsx
git commit -m "feat: hero image with programmatic stub fallback"
```

---

### Task 16: StatusBadge

**Files:**
- Create: `components/StatusBadge.tsx`

- [ ] **Step 1: Implement**

```typescript
import type { ReactElement } from 'react';
import type { Category } from '@/lib/enrichment-types';

const STYLES: Record<Category, { label: string; className: string }> = {
  active:     { label: 'Active',      className: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
  frozen:     { label: 'Frozen',      className: 'bg-amber-500/15 text-amber-300 border-amber-500/30' },
  experiment: { label: 'Experiment',  className: 'bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/30' },
  product:    { label: 'Product',     className: 'bg-sky-500/15 text-sky-300 border-sky-500/30' },
};

export function StatusBadge({ category }: { category: Category }): ReactElement {
  const { label, className } = STYLES[category];
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-mono ${className}`}>
      {label}
    </span>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/StatusBadge.tsx
git commit -m "feat: status badge component"
```

---

### Task 17: ProjectLinkRows (shared content for hover + modal)

**Files:**
- Create: `components/ProjectLinkRows.tsx`

- [ ] **Step 1: Implement**

```typescript
import type { ReactElement } from 'react';
import type { EnrichedProjectEntry } from '@/lib/enrichment-types';
import { appendUtm } from '@/lib/links';
import { StatusBadge } from './StatusBadge';

interface Props {
  entry: EnrichedProjectEntry;
  utmMedium: 'hover-popup' | 'modal' | 'spotlight';
}

export function ProjectLinkRows({ entry, utmMedium }: Props): ReactElement {
  const { links, slug } = entry;
  const u = (url: string) => appendUtm(url, { medium: utmMedium, campaign: slug });

  return (
    <div className="space-y-2 text-sm">
      <div className="text-white/80">{entry.enriched.derivedStatus}</div>

      {links.deployedSite && (
        <a className="block hover:underline" href={u(links.deployedSite)} target="_blank" rel="noreferrer">
          🌐 Live site →
        </a>
      )}
      {links.githubRepo && (
        <a className="block hover:underline" href={`https://github.com/${links.githubRepo}`} target="_blank" rel="noreferrer">
          🐙 GitHub →
        </a>
      )}
      {links.youtubeVideo && (
        <a className="block hover:underline" href={u(links.youtubeVideo)} target="_blank" rel="noreferrer">
          ▶ Latest video →
        </a>
      )}

      {links.hackathon?.map((h, i) => (
        <a
          key={i}
          className="block hover:underline"
          href={h.url ? u(h.url) : '#'}
          target="_blank"
          rel="noreferrer"
        >
          🏆 {h.name} ({h.status}{h.prize ? ` · ${h.prize}` : ''})
        </a>
      ))}

      <div className="pt-1"><StatusBadge category={entry.category} /></div>

      {links.products?.map((p, i) => (
        <a key={i} className="block hover:underline" href={u(p.url)} target="_blank" rel="noreferrer">
          📚 {p.label} →
        </a>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/ProjectLinkRows.tsx
git commit -m "feat: shared link rows for hover + modal"
```

---

### Task 18: appendUtm helper (TDD)

**Files:**
- Create: `tests/unit/links.test.ts`
- Create: `lib/links.ts`

- [ ] **Step 1: Write the failing test**

```typescript
import { describe, it, expect } from 'vitest';
import { appendUtm } from '@/lib/links';

describe('appendUtm', () => {
  it('appends utm params to a clean URL', () => {
    const out = appendUtm('https://example.com/page', { medium: 'hover-popup', campaign: 'health-pulse' });
    expect(out).toBe('https://example.com/page?utm_source=portfolio&utm_medium=hover-popup&utm_campaign=health-pulse');
  });

  it('preserves existing query params (Amazon affiliate tag)', () => {
    const out = appendUtm('https://amazon.com/dp/B0XXX?tag=sgharlow-20', {
      medium: 'footer-band', campaign: 'ender',
    });
    expect(out).toContain('tag=sgharlow-20');
    expect(out).toContain('utm_source=portfolio');
    expect(out).toContain('utm_medium=footer-band');
    expect(out).toContain('utm_campaign=ender');
  });

  it('returns the input unchanged for non-http URLs', () => {
    expect(appendUtm('mailto:x@y.com', { medium: 'hover-popup', campaign: 'x' })).toBe('mailto:x@y.com');
  });
});
```

- [ ] **Step 2: Run, fails**

Run: `npm test`

- [ ] **Step 3: Implement**

```typescript
// lib/links.ts

interface UtmParams {
  medium: 'hover-popup' | 'modal' | 'spotlight' | 'grid-card' | 'footer-band' | 'shop' | 'top-nav';
  campaign: string;
}

export function appendUtm(url: string, params: UtmParams): string {
  if (!/^https?:\/\//.test(url)) return url;
  const u = new URL(url);
  u.searchParams.set('utm_source', 'portfolio');
  u.searchParams.set('utm_medium', params.medium);
  u.searchParams.set('utm_campaign', params.campaign);
  return u.toString();
}
```

- [ ] **Step 4: Run, pass**

Run: `npm test`

- [ ] **Step 5: Commit**

```bash
git add lib/links.ts tests/unit/links.test.ts
git commit -m "feat: appendUtm helper"
```

---

### Task 19: ProjectHoverPopup

**Files:**
- Create: `components/ProjectHoverPopup.tsx`

- [ ] **Step 1: Implement**

```typescript
import type { ReactElement } from 'react';
import type { EnrichedProjectEntry } from '@/lib/enrichment-types';
import { ProjectLinkRows } from './ProjectLinkRows';

export function ProjectHoverPopup({ entry }: { entry: EnrichedProjectEntry }): ReactElement {
  return (
    <div className="absolute inset-0 hidden md:flex flex-col justify-end rounded-xl bg-black/85 p-5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 backdrop-blur-sm">
      <h3 className="font-display text-lg text-white mb-2">{entry.name}</h3>
      <ProjectLinkRows entry={entry} utmMedium="hover-popup" />
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/ProjectHoverPopup.tsx
git commit -m "feat: project hover popup"
```

---

### Task 20: ProjectModal (mobile)

**Files:**
- Create: `components/ProjectModal.tsx`

- [ ] **Step 1: Implement**

```typescript
'use client';

import { useEffect } from 'react';
import type { ReactElement } from 'react';
import type { EnrichedProjectEntry } from '@/lib/enrichment-types';
import { ProjectLinkRows } from './ProjectLinkRows';

interface Props {
  entry: EnrichedProjectEntry | null;
  onClose: () => void;
}

export function ProjectModal({ entry, onClose }: Props): ReactElement | null {
  useEffect(() => {
    if (!entry) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [entry, onClose]);

  if (!entry) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end md:hidden bg-black/70" onClick={onClose}>
      <div className="w-full rounded-t-2xl bg-zinc-950 p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-4">
          <h3 className="font-display text-xl text-white">{entry.name}</h3>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="text-white/60 hover:text-white text-2xl leading-none"
          >
            ✕
          </button>
        </div>
        <p className="text-sm text-white/70 mb-4">{entry.summary}</p>
        <ProjectLinkRows entry={entry} utmMedium="modal" />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/ProjectModal.tsx
git commit -m "feat: project modal (mobile)"
```

---

### Task 21: ProjectCard

**Files:**
- Create: `components/ProjectCard.tsx`

- [ ] **Step 1: Implement**

```typescript
'use client';

import { useState } from 'react';
import type { ReactElement } from 'react';
import Link from 'next/link';
import type { EnrichedProjectEntry } from '@/lib/enrichment-types';
import { HeroImage } from './HeroImage';
import { StatusBadge } from './StatusBadge';
import { ProjectHoverPopup } from './ProjectHoverPopup';
import { ProjectModal } from './ProjectModal';

interface Props {
  entry: EnrichedProjectEntry;
}

export function ProjectCard({ entry }: Props): ReactElement {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <article className="group relative">
        <Link
          href={`/projects/${entry.slug}`}
          className="hidden md:block"
          aria-label={entry.name}
        >
          <div className="relative">
            <HeroImage slug={entry.slug} name={entry.name} heroImage={entry.heroImage} />
            <ProjectHoverPopup entry={entry} />
          </div>
        </Link>

        <button
          type="button"
          className="block md:hidden w-full text-left"
          onClick={() => setModalOpen(true)}
          aria-label={`Open ${entry.name} details`}
        >
          <HeroImage slug={entry.slug} name={entry.name} heroImage={entry.heroImage} />
        </button>

        <div className="mt-3">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-display text-base text-white">{entry.name}</h3>
            <StatusBadge category={entry.category} />
          </div>
          <p className="text-sm text-white/70">{entry.tagline}</p>
        </div>
      </article>

      <ProjectModal entry={modalOpen ? entry : null} onClose={() => setModalOpen(false)} />
    </>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/ProjectCard.tsx
git commit -m "feat: project card with hover + modal integration"
```

---

### Task 22: SpotlightInterstitial

**Files:**
- Create: `components/SpotlightInterstitial.tsx`

- [ ] **Step 1: Implement**

```typescript
import Link from 'next/link';
import type { ReactElement } from 'react';
import type { EnrichedProjectEntry } from '@/lib/enrichment-types';
import { HeroImage } from './HeroImage';
import { ProjectLinkRows } from './ProjectLinkRows';

interface Props {
  entry: EnrichedProjectEntry;
  date: Date;
}

export function SpotlightInterstitial({ entry, date }: Props): ReactElement {
  const dateLabel = date.toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  });

  return (
    <main className="min-h-[80vh] max-w-5xl mx-auto px-6 py-12">
      <div className="text-xs font-mono uppercase text-white/50 mb-2">
        Today's Spotlight · {dateLabel}
      </div>
      <hr className="border-white/10 mb-8" />

      <div className="grid md:grid-cols-2 gap-8 items-start">
        <HeroImage slug={entry.slug} name={entry.name} heroImage={entry.heroImage} priority />

        <div>
          <h1 className="font-display text-4xl text-white mb-2">{entry.name}</h1>
          <p className="text-white/70 mb-6">{entry.tagline}</p>

          <div className="prose prose-invert max-w-none mb-6">
            {(entry.spotlight?.longDescription ?? entry.summary)
              .split('\n\n')
              .map((p, i) => <p key={i}>{p}</p>)}
          </div>

          <ProjectLinkRows entry={entry} utmMedium="spotlight" />
        </div>
      </div>

      <hr className="border-white/10 my-12" />

      <div className="flex justify-center">
        <Link
          href="/grid"
          prefetch
          className="rounded-full border border-white/20 px-6 py-2 text-white hover:bg-white/10"
        >
          ✕ Close — Browse all projects
        </Link>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/SpotlightInterstitial.tsx
git commit -m "feat: spotlight interstitial"
```

---

### Task 23: FooterMonetizationBand

**Files:**
- Create: `components/FooterMonetizationBand.tsx`

- [ ] **Step 1: Implement**

```typescript
import type { ReactElement } from 'react';
import Link from 'next/link';
import type { EnrichedProjectEntry } from '@/lib/enrichment-types';
import { HeroImage } from './HeroImage';
import { appendUtm } from '@/lib/links';

interface Props {
  entries: EnrichedProjectEntry[];
}

function ProductRow({ title, items }: { title: string; items: EnrichedProjectEntry[] }): ReactElement | null {
  if (items.length === 0) return null;
  return (
    <div className="mb-6">
      <h2 className="font-mono text-xs uppercase text-white/50 mb-3">{title}</h2>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {items.map((entry) => {
          const product = entry.links.products?.[0];
          const href = product
            ? appendUtm(product.url, { medium: 'footer-band', campaign: entry.slug })
            : `/projects/${entry.slug}`;
          const label = product?.label ?? 'Coming soon';
          return (
            <Link
              key={entry.slug}
              href={href}
              target={product ? '_blank' : undefined}
              rel={product ? 'noreferrer' : undefined}
              className="block w-40 flex-shrink-0 hover:opacity-80"
            >
              <div className="w-40">
                <HeroImage slug={entry.slug} name={entry.name} heroImage={entry.heroImage} />
              </div>
              <div className="text-sm text-white mt-2">{entry.name}</div>
              <div className="text-xs text-white/60">{label} →</div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function FooterMonetizationBand({ entries }: Props): ReactElement {
  const products = entries.filter((e) => e.category === 'product');
  const books = products.filter((e) => e.kind === 'book');
  const others = products.filter((e) => e.kind !== 'book');

  return (
    <footer className="border-t border-white/10 bg-black/30 mt-16">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <ProductRow title="Books I've written" items={books} />
        <ProductRow title="Other products" items={others} />
        <div className="pt-6 border-t border-white/10 text-xs text-white/40 flex gap-4">
          <span>© {new Date().getFullYear()} sgharlow</span>
          <Link href="/sitemap.xml" className="hover:text-white/70">Sitemap</Link>
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/FooterMonetizationBand.tsx
git commit -m "feat: footer monetization band"
```

---

### Task 24: TopNav

**Files:**
- Create: `components/TopNav.tsx`

- [ ] **Step 1: Implement**

```typescript
import type { ReactElement } from 'react';
import Link from 'next/link';

export function TopNav(): ReactElement {
  return (
    <nav className="border-b border-white/10 bg-black/30">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="font-display text-white">sgharlow</Link>
        <div className="flex items-center gap-6 text-sm text-white/70">
          <Link href="/" className="hover:text-white">Today</Link>
          <Link href="/grid" className="hover:text-white">All projects</Link>
          <Link href="/shop" className="hover:text-white">Shop</Link>
          <a href="https://github.com/sgharlow" target="_blank" rel="noreferrer" className="hover:text-white">GitHub</a>
        </div>
      </div>
    </nav>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/TopNav.tsx
git commit -m "feat: top nav"
```

---

## SECTION 6 — Pages

### Task 25: Root layout with TopNav + FooterBand

**Files:**
- Modify: `app/layout.tsx`
- Modify: `app/globals.css`

- [ ] **Step 1: Replace `app/layout.tsx`**

```typescript
import type { Metadata } from 'next';
import { Inter_Tight, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { TopNav } from '@/components/TopNav';
import { FooterMonetizationBand } from '@/components/FooterMonetizationBand';
import { loadEnrichedProjectsFile } from '@/lib/projects';

const display = Inter_Tight({ subsets: ['latin'], variable: '--font-display' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.learningai365.com';

export const metadata: Metadata = {
  title: 'sgharlow — AI learning portfolio',
  description: 'Portfolio of AI learning projects, hackathons, and writing by sgharlow.',
  metadataBase: new URL(SITE_URL),
  openGraph: { type: 'website', url: SITE_URL, siteName: 'sgharlow' },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const file = await loadEnrichedProjectsFile();
  return (
    <html lang="en" className="dark">
      <body className={`${display.variable} ${mono.variable} bg-zinc-950 text-white antialiased min-h-screen flex flex-col`}>
        <TopNav />
        <div className="flex-1">{children}</div>
        <FooterMonetizationBand entries={file.entries} />
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Update `app/globals.css`**

Replace contents with:

```css
@import "tailwindcss";

@theme {
  --font-display: var(--font-display, 'Inter Tight'), system-ui, sans-serif;
  --font-mono: var(--font-mono, 'JetBrains Mono'), ui-monospace, monospace;
}

body { font-family: var(--font-display); }
.font-display { font-family: var(--font-display); }
.font-mono { font-family: var(--font-mono); }
```

- [ ] **Step 3: Commit**

```bash
git add app/layout.tsx app/globals.css
git commit -m "feat: root layout with nav, footer band, fonts"
```

---

### Task 26: Spotlight homepage `/` and alias `/today`

**Files:**
- Modify: `app/page.tsx` (replace boilerplate)
- Create: `app/today/page.tsx`

- [ ] **Step 1: Replace `app/page.tsx`**

```typescript
import { loadEnrichedProjectsFile } from '@/lib/projects';
import { getTodaysSpotlight } from '@/lib/daily-spotlight';
import { SpotlightInterstitial } from '@/components/SpotlightInterstitial';

export const revalidate = 3600;

export default async function HomePage() {
  const file = await loadEnrichedProjectsFile();
  const now = new Date();
  const today = getTodaysSpotlight(file, now);
  return <SpotlightInterstitial entry={today} date={now} />;
}
```

- [ ] **Step 2: Create `app/today/page.tsx`**

```typescript
export { default } from '../page';
export { revalidate } from '../page';
```

- [ ] **Step 3: Run prebuild + dev to verify it renders**

```bash
GH_TOKEN=dummy VERCEL_TOKEN=dummy VERCEL_TEAM_ID=team_x npm run prebuild
npm run dev
```

In another shell: `curl -s http://localhost:3000 | head -50` — expect HTML containing one of the three seed slugs.

Kill dev server.

- [ ] **Step 4: Commit**

```bash
git add app/page.tsx app/today/page.tsx
git commit -m "feat: spotlight homepage and /today alias"
```

---

### Task 27: Grid page `/grid`

**Files:**
- Create: `app/grid/page.tsx`

- [ ] **Step 1: Implement**

```typescript
import type { Metadata } from 'next';
import { loadEnrichedProjectsFile } from '@/lib/projects';
import { ProjectCard } from '@/components/ProjectCard';
import type { Category, EnrichedProjectEntry } from '@/lib/enrichment-types';
import Link from 'next/link';

export const revalidate = 21600;

export const metadata: Metadata = {
  title: 'All projects — sgharlow',
};

const FILTERS: Array<{ key: 'all' | Category; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'frozen', label: 'Frozen' },
  { key: 'experiment', label: 'Experiments' },
  { key: 'product', label: 'Products' },
];

interface PageProps {
  searchParams: Promise<{ filter?: string }>;
}

export default async function GridPage({ searchParams }: PageProps) {
  const file = await loadEnrichedProjectsFile();
  const { filter = 'all' } = await searchParams;

  const entries: EnrichedProjectEntry[] = [...file.entries].sort((a, b) => {
    if (a.order !== undefined && b.order !== undefined) return a.order - b.order;
    if (a.order !== undefined) return -1;
    if (b.order !== undefined) return 1;
    return a.enriched.activityScore - b.enriched.activityScore;
  });

  const filtered = filter === 'all' ? entries : entries.filter((e) => e.category === filter);

  return (
    <main className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="font-display text-3xl text-white mb-6">All projects</h1>

      <div className="flex flex-wrap gap-2 mb-8">
        {FILTERS.map((f) => (
          <Link
            key={f.key}
            href={f.key === 'all' ? '/grid' : `/grid?filter=${f.key}`}
            className={`px-3 py-1 rounded-full text-sm border ${
              filter === f.key
                ? 'bg-white/10 border-white/40 text-white'
                : 'border-white/15 text-white/60 hover:text-white'
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map((entry) => <ProjectCard key={entry.slug} entry={entry} />)}
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/grid/page.tsx
git commit -m "feat: grid page with category filter"
```

---

### Task 28: Project detail `/projects/[slug]`

**Files:**
- Create: `app/projects/[slug]/page.tsx`

- [ ] **Step 1: Implement**

```typescript
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { loadEnrichedProjectsFile } from '@/lib/projects';
import { HeroImage } from '@/components/HeroImage';
import { ProjectLinkRows } from '@/components/ProjectLinkRows';

export const revalidate = 21600;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const file = await loadEnrichedProjectsFile();
  return file.entries.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const file = await loadEnrichedProjectsFile();
  const entry = file.entries.find((e) => e.slug === slug);
  if (!entry) return { title: 'Not found' };
  return { title: `${entry.name} — sgharlow`, description: entry.tagline };
}

export default async function ProjectPage({ params }: PageProps) {
  const { slug } = await params;
  const file = await loadEnrichedProjectsFile();
  const entry = file.entries.find((e) => e.slug === slug);
  if (!entry) notFound();

  const body = entry.spotlight?.longDescription ?? entry.summary;

  return (
    <main className="max-w-4xl mx-auto px-6 py-10">
      <article className="grid md:grid-cols-2 gap-8 items-start">
        <HeroImage slug={entry.slug} name={entry.name} heroImage={entry.heroImage} priority />
        <div>
          <h1 className="font-display text-3xl text-white mb-2">{entry.name}</h1>
          <p className="text-white/70 mb-6">{entry.tagline}</p>
          <div className="prose prose-invert max-w-none mb-6">
            {body.split('\n\n').map((p, i) => <p key={i}>{p}</p>)}
          </div>
          <ProjectLinkRows entry={entry} utmMedium="modal" />
        </div>
      </article>
    </main>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/projects/[slug]/page.tsx
git commit -m "feat: project detail page"
```

---

### Task 29: Shop page `/shop`

**Files:**
- Create: `app/shop/page.tsx`

- [ ] **Step 1: Implement**

```typescript
import type { Metadata } from 'next';
import Link from 'next/link';
import { loadEnrichedProjectsFile } from '@/lib/projects';
import { HeroImage } from '@/components/HeroImage';
import { appendUtm } from '@/lib/links';

export const revalidate = 21600;

export const metadata: Metadata = {
  title: 'Shop — sgharlow',
  description: 'Books and products by sgharlow.',
};

export default async function ShopPage() {
  const file = await loadEnrichedProjectsFile();
  const products = file.entries.filter((e) => e.category === 'product');

  return (
    <main className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="font-display text-3xl text-white mb-6">Shop</h1>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((entry) => {
          const p = entry.links.products?.[0];
          const href = p ? appendUtm(p.url, { medium: 'shop', campaign: entry.slug }) : `/projects/${entry.slug}`;
          return (
            <Link
              key={entry.slug}
              href={href}
              target={p ? '_blank' : undefined}
              rel={p ? 'noreferrer' : undefined}
              className="block hover:opacity-90"
            >
              <HeroImage slug={entry.slug} name={entry.name} heroImage={entry.heroImage} />
              <div className="mt-3">
                <h2 className="font-display text-base text-white">{entry.name}</h2>
                <p className="text-sm text-white/70">{entry.tagline}</p>
                <p className="text-xs text-white/50 mt-1">{p?.label ?? 'Coming soon'} →</p>
              </div>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/shop/page.tsx
git commit -m "feat: shop page"
```

---

### Task 30: sitemap.ts and robots.ts

**Files:**
- Create: `app/sitemap.ts`
- Create: `app/robots.ts`
- Create: `app/api/revalidate/route.ts`

- [ ] **Step 1: Sitemap**

```typescript
// app/sitemap.ts
import type { MetadataRoute } from 'next';
import { loadEnrichedProjectsFile } from '@/lib/projects';

export const revalidate = 21600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.learningai365.com';
  const file = await loadEnrichedProjectsFile();

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${base}/`, priority: 1.0, changeFrequency: 'daily' },
    { url: `${base}/today`, priority: 0.9, changeFrequency: 'daily' },
    { url: `${base}/grid`, priority: 0.9, changeFrequency: 'weekly' },
    { url: `${base}/shop`, priority: 0.7, changeFrequency: 'weekly' },
  ];

  const projectPages: MetadataRoute.Sitemap = file.entries.map((e) => ({
    url: `${base}/projects/${e.slug}`,
    priority: 0.7,
    changeFrequency: 'weekly',
  }));

  return [...staticPages, ...projectPages];
}
```

- [ ] **Step 2: robots.ts**

```typescript
// app/robots.ts
import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.learningai365.com';
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/api/'] }],
    sitemap: `${base}/sitemap.xml`,
  };
}
```

- [ ] **Step 3: On-demand revalidate route**

```typescript
// app/api/revalidate/route.ts
import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const secret = process.env.REVALIDATE_SECRET;
  const url = new URL(request.url);
  if (!secret || url.searchParams.get('secret') !== secret) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  revalidatePath('/', 'layout');
  return NextResponse.json({ revalidated: true, at: new Date().toISOString() });
}
```

- [ ] **Step 4: Commit**

```bash
git add app/sitemap.ts app/robots.ts app/api/revalidate/route.ts
git commit -m "feat: sitemap, robots, on-demand revalidate"
```

---

## SECTION 7 — Build verification + image prompt extractor + E2E

### Task 31: Run a real build with seed data

**Files:** none

- [ ] **Step 1: Run prebuild + build**

```bash
GH_TOKEN=dummy VERCEL_TOKEN=dummy VERCEL_TEAM_ID=team_x npm run build
```

Expected: enrichment writes `data/projects.enriched.json`; Next.js produces `.next/`; no TypeScript or build errors.

- [ ] **Step 2: Run tests**

```bash
npm test
```

Expected: all unit tests pass.

- [ ] **Step 3: If anything fails, fix inline (no separate task) and re-run.**

- [ ] **Step 4: Commit any fixes from Step 3.**

```bash
git add -A
git commit -m "fix: build verification adjustments" || echo "no changes"
```

---

### Task 32: list-image-prompts.ts script

**Files:**
- Create: `scripts/list-image-prompts.ts`

- [ ] **Step 1: Implement**

```typescript
import { loadProjectsFile } from '../lib/projects';

async function main(): Promise<void> {
  const file = await loadProjectsFile();
  for (const entry of file.entries) {
    if (!entry.heroImage) {
      console.log(`# ${entry.slug} (${entry.category}, ${entry.kind})`);
      console.log(entry.heroImagePrompt);
      console.log();
    }
  }
}

main().catch((err) => { console.error(err); process.exit(1); });
```

- [ ] **Step 2: Verify it runs**

Run: `npm run list-prompts`
Expected: prints prompts for the seed entries.

- [ ] **Step 3: Commit**

```bash
git add scripts/list-image-prompts.ts
git commit -m "feat: list-image-prompts utility"
```

---

### Task 33: E2E spotlight → grid → modal smoke test

**Files:**
- Create: `tests/e2e/spotlight-to-grid.spec.ts`

- [ ] **Step 1: Write the test**

```typescript
import { test, expect } from '@playwright/test';

test('spotlight closes to grid; mobile modal opens', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText("Today's Spotlight", { exact: false })).toBeVisible();

  await page.getByRole('link', { name: /Browse all projects/ }).click();
  await expect(page).toHaveURL(/\/grid/);
  await expect(page.getByRole('heading', { name: 'All projects' })).toBeVisible();

  // mobile viewport — modal trigger
  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  const firstCard = page.locator('article').first();
  await firstCard.locator('button').click();
  await expect(page.getByRole('button', { name: 'Close' })).toBeVisible();
});
```

- [ ] **Step 2: Run e2e**

Pre-req: `data/projects.enriched.json` exists (run prebuild if needed).

```bash
npm run test:e2e
```

Expected: 1 test passes.

- [ ] **Step 3: Commit**

```bash
git add tests/e2e/spotlight-to-grid.spec.ts
git commit -m "test: e2e smoke for spotlight → grid → modal"
```

---

### Task 34: GitHub Actions CI workflow

**Files:**
- Create: `.github/workflows/ci.yml`

- [ ] **Step 1: Implement**

```yaml
name: ci
on:
  pull_request:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm }
      - run: npm ci
      - run: npm run typecheck
      - run: npm test
      - name: prebuild + build
        env:
          GH_TOKEN: ${{ secrets.GH_TOKEN || 'dummy' }}
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN || 'dummy' }}
          VERCEL_TEAM_ID: ${{ secrets.VERCEL_TEAM_ID || 'dummy' }}
          NEXT_PUBLIC_SITE_URL: https://www.learningai365.com
        run: npm run build
      - run: npx playwright install --with-deps chromium
      - run: npm run test:e2e
```

- [ ] **Step 2: Commit + push**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: add typecheck + unit + build + e2e workflow"
git push
```

- [ ] **Step 3: Verify CI green on GitHub**

Run: `gh run watch`
Expected: all jobs green.

---

## SECTION 8 — First Vercel preview deploy

### Task 35: Deploy preview, verify renders

**Files:** none (deployment only)

- [ ] **Step 1: Push current main, deploy preview**

```bash
git push
vercel --yes
```

Expected: a preview URL is printed.

- [ ] **Step 2: Smoke-test the preview URL**

The preview URL was printed by `vercel --yes` in Step 1 — copy it and substitute below as `$PREVIEW_URL`. (Or run `vercel ls` and grab the latest deployment URL for `sgharlow-portfolio`.)

```bash
PREVIEW_URL='<paste preview URL here>'
curl -s -o /dev/null -w "%{http_code}\n" "$PREVIEW_URL"                          # expect 200
curl -s -o /dev/null -w "%{http_code}\n" "$PREVIEW_URL/grid"                     # expect 200
curl -s -o /dev/null -w "%{http_code}\n" "$PREVIEW_URL/shop"                     # expect 200
curl -s -o /dev/null -w "%{http_code}\n" "$PREVIEW_URL/projects/health-pulse"    # expect 200
```

If any non-200, inspect Vercel deployment logs (`vercel inspect <deployment-url>`) and fix.

- [ ] **Step 3: Commit any fixes from Step 2 + redeploy**

```bash
git add -A && git commit -m "fix: preview deploy issues" || echo "none"
git push
```

---

## SECTION 9 — Content authoring (USER-DRIVEN, paused)

> **Pause point.** Tasks 36-38 require sgharlow input to populate full content. Implementation agent should mark these complete only when sgharlow has supplied the content and the JSON is committed.

### Task 36: Finalize inclusion list with sgharlow

**Files:**
- Modify: `data/projects.json`

- [ ] **Step 1: Open the spec section 10 inclusion-subset table with sgharlow**

Walk through the 24 candidate slugs in `docs/superpowers/specs/2026-04-26-learningai365-pivot-design.md` Section 10. For each, sgharlow confirms include/exclude and category (`active` / `frozen` / `experiment` / `product`).

- [ ] **Step 2: Add confirmed entries to `data/projects.json`**

For each confirmed entry, populate: `slug`, `name`, `tagline`, `summary`, `category`, `kind`, `links` (githubRepo, deployedSite, hackathon, products as applicable), `heroImagePrompt` (using the template in spec section 9), `spotlight.longDescription` (~150 words for `active`/`frozen`).

- [ ] **Step 3: Run prebuild + build**

```bash
GH_TOKEN=$GH_TOKEN VERCEL_TOKEN=$VERCEL_TOKEN VERCEL_TEAM_ID=$VERCEL_TEAM_ID npm run build
```

Expected: succeeds; `data/projects.enriched.json` has the new entry count.

- [ ] **Step 4: Commit**

```bash
git add data/projects.json
git commit -m "content: finalize inclusion list"
git push
```

---

### Task 37: Generate hero images via nano-banana

**Files:**
- Create: `public/projects/{slug}.webp` for each entry
- Modify: `data/projects.json` (`heroImage` field per entry)

- [ ] **Step 1: Extract prompts**

```bash
npm run list-prompts > prompts.txt
```

- [ ] **Step 2: sgharlow runs prompts through nano-banana, saves outputs**

Save each generated image as `public/projects/{slug}.webp` (target ~80kb).

- [ ] **Step 3: Update `data/projects.json` per entry**

For each generated image, set `"heroImage": "/projects/{slug}.webp"`.

- [ ] **Step 4: Verify build still passes**

```bash
npm run build
```

- [ ] **Step 5: Commit**

```bash
git add public/projects/ data/projects.json
git commit -m "content: hero images"
git push
```

---

### Task 38: Confirm product purchase URLs

**Files:**
- Modify: `data/projects.json`

- [ ] **Step 1: Replace `https://example.com/TODO-replace-*` URLs**

For `ender-ai-leadership` and any other product entries, sgharlow provides:
- Final Amazon ASIN URL (Kindle)
- LemonSqueezy product URLs
- Other product URLs as applicable

- [ ] **Step 2: Commit**

```bash
git add data/projects.json
git commit -m "content: real product URLs"
git push
```

---

## SECTION 10 — Pre-cutover prep on the `learningai` repo

> **Switching repos.** Tasks 39-41 modify the existing `learningai` repo (NOT `sgharlow-portfolio`). The agent should cd to `C:\Users\sghar\CascadeProjects\learningai` for these.

### Task 39: Refactor learningai for env-driven domains

**Files in `learningai` repo:**
- Modify: `frontend/next-sitemap.config.js` (lines 3, 16)
- Modify: `frontend/next.config.ts` (line 17)
- Modify: `frontend/src/app/page.tsx` (lines 40, 49, 52)
- Modify: `frontend/src/app/layout.tsx` (line 45)
- Modify: `frontend/src/app/sitemap.ts` (line 64)
- Modify: `frontend/.env.production.local` (line 12)

- [ ] **Step 1: Add `NEXT_PUBLIC_SITE_URL` env var fallback to all 8 sites**

For each file/line above, replace the hardcoded `https://learningai365.com` with `process.env.NEXT_PUBLIC_SITE_URL ?? 'https://training.learningai365.com'` (for TypeScript files) or `process.env.NEXT_PUBLIC_SITE_URL || 'https://training.learningai365.com'` (for JS/config). Note default is now `training.`, not `www.`.

For `next-sitemap.config.js`:
```javascript
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://training.learningai365.com';
module.exports = {
  siteUrl: SITE_URL,
  // ...
  robotsTxtOptions: {
    additionalSitemaps: [`${SITE_URL}/sitemap.xml`],
  },
};
```

For `app/sitemap.ts`:
```typescript
const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://training.learningai365.com';
```

For schema.org JSON-LD in `app/page.tsx` and `app/layout.tsx`:
```typescript
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://training.learningai365.com';
// then use ${siteUrl} in the URL fields
```

For `next.config.ts` line 17 (image remotePatterns) — this references `api.learningai365.com` not `learningai365.com`; leave it unchanged.

For `.env.production.local` line 12: change to `NEXT_PUBLIC_SITE_URL="https://training.learningai365.com"`.

- [ ] **Step 2: Add Vercel env var on the existing `learningai365` Vercel project**

```bash
cd /c/Users/sghar/CascadeProjects/learningai
vercel env add NEXT_PUBLIC_SITE_URL production
# value: https://training.learningai365.com
vercel env add NEXT_PUBLIC_SITE_URL preview
# value: https://training.learningai365.com
```

- [ ] **Step 3: Run learningai's existing tests**

```bash
cd frontend
npm test
```

Expected: all existing tests still pass.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "refactor: read site URL from NEXT_PUBLIC_SITE_URL env var"
git push
```

- [ ] **Step 5: Wait for Vercel deploy, verify the production site still renders correctly at the OLD `www.learningai365.com` URL**

Vercel will build with `NEXT_PUBLIC_SITE_URL=https://training.learningai365.com` even though the domain serving the site is still `www`. This is fine — the site renders identically; only canonical URLs in JSON-LD/sitemap reflect the new value.

---

### Task 40: Update Strapi CORS allowlist

**Files (on EC2):**
- Modify: `config/middlewares.ts` (or `config/middlewares.js`) on `34.222.150.191`

- [ ] **Step 1: SSH to EC2**

```bash
ssh -i /c/Users/sghar/CascadeProjects/learningai/infrastructure/learningai365-strapi-key.pem ec2-user@34.222.150.191
```

(Adjust user if not `ec2-user`.)

- [ ] **Step 2: Edit Strapi middleware to add `training.learningai365.com` to CORS allowlist**

Locate the `cors` entry in `config/middlewares.ts`. Add `https://training.learningai365.com` to the `origin` array. Keep `https://www.learningai365.com` and `https://learningai365.com` in the array (do NOT remove yet).

- [ ] **Step 3: Restart Strapi**

```bash
pm2 restart strapi
# or: sudo systemctl restart strapi
```

- [ ] **Step 4: Verify CORS from local machine**

```bash
curl -I -X OPTIONS \
  -H "Origin: https://training.learningai365.com" \
  -H "Access-Control-Request-Method: GET" \
  https://api.learningai365.com/api/learning-paths
```

Expected: response includes `Access-Control-Allow-Origin: https://training.learningai365.com`.

- [ ] **Step 5: Document the change in repo**

In `learningai` repo, add a note to its CHANGELOG or relevant docs: "Strapi CORS allowlist on EC2 now includes training.learningai365.com (added 2026-04-XX)."

- [ ] **Step 6: Commit doc update**

```bash
git add -A
git commit -m "docs: note strapi cors update for training subdomain"
git push
```

---

### Task 41: Stage `training.learningai365.com` on the existing project

**Files:** none (Vercel + DNS only)

- [ ] **Step 1: Add `training.learningai365.com` as additional production domain on existing `learningai365` Vercel project**

Vercel dashboard → `learningai365` project → Settings → Domains → Add `training.learningai365.com` (do NOT remove `www.learningai365.com` or apex).

- [ ] **Step 2: Add DNS CNAME record at registrar**

`training` → `cname.vercel-dns.com`

- [ ] **Step 3: Wait for SSL provisioning**

Vercel UI shows green when ready (usually <60s).

- [ ] **Step 4: Verify both URLs render the same content**

```bash
curl -s -o /dev/null -w "%{http_code}\n" https://www.learningai365.com           # expect 200
curl -s -o /dev/null -w "%{http_code}\n" https://training.learningai365.com      # expect 200
```

In a browser, open both — verify they render identically.

- [ ] **Step 5: Verify Strapi data loads on training**

In an incognito browser, navigate to `https://training.learningai365.com/paths` — confirm the learning-paths grid populates from Strapi (no CORS errors in DevTools console).

---

## SECTION 11 — Cutover (the 10-minute flip)

> **Coordination point.** Tasks 42-44 are the live cutover. Pre-cutover checklist (sgharlow approval) before starting.

### Task 42: Pre-cutover checklist

**Files:** none

- [ ] **Step 1: Run `/pre-deploy-check` on `sgharlow-portfolio` repo**

`cd /c/Users/sghar/CascadeProjects/portfolio && /pre-deploy-check`

- [ ] **Step 2: Verify portfolio metadataBase is `https://www.learningai365.com`**

Grep `app/layout.tsx` for `metadataBase` — confirm it reads from `NEXT_PUBLIC_SITE_URL`. Vercel env for portfolio's production should be `https://www.learningai365.com`.

- [ ] **Step 3: Capture pre-cutover state of existing `learningai365` Vercel project**

```bash
cd /c/Users/sghar/CascadeProjects/learningai
vercel inspect https://www.learningai365.com > /tmp/learningai365-pre-cutover.txt
vercel env pull /tmp/learningai365-env-backup.env
```

Save both backups outside the repo (e.g., to `/c/Users/sghar/Desktop/cutover-backups/`).

- [ ] **Step 4: Snapshot screenshot of current `www.learningai365.com`**

Open in browser, screenshot homepage + `/paths` + a course page. Save to `/c/Users/sghar/Desktop/cutover-backups/`.

- [ ] **Step 5: Confirm with sgharlow: "Ready to flip — proceeding to Task 43"**

---

### Task 43: Execute the cutover

**Files:** none

- [ ] **Step 1: Rename existing Vercel project**

Vercel dashboard → existing `learningai365` project → Settings → General → Project name → change to `learningai365-training`. Save.

- [ ] **Step 2: Remove `www.learningai365.com` and apex from `learningai365-training`**

Vercel dashboard → `learningai365-training` → Settings → Domains → remove `www.learningai365.com` AND `learningai365.com`. Project should now only have `training.learningai365.com`.

- [ ] **Step 3: Add `www.learningai365.com` to `sgharlow-portfolio`**

Vercel dashboard → `sgharlow-portfolio` → Settings → Domains → Add Domain → `www.learningai365.com`. Mark as production.

- [ ] **Step 4: Add apex `learningai365.com` to `sgharlow-portfolio` configured as redirect**

Vercel dashboard → `sgharlow-portfolio` → Settings → Domains → Add Domain → `learningai365.com`. When prompted, choose "Redirect to www.learningai365.com" with status 301.

- [ ] **Step 5: Wait for SSL on `www`**

Vercel UI green check. Usually <60s.

- [ ] **Step 6: Smoke test in incognito browser**

```bash
curl -s -o /dev/null -w "www → %{http_code}\n" https://www.learningai365.com
curl -sI https://learningai365.com | head -5      # expect 301 → https://www.learningai365.com
curl -s -o /dev/null -w "training → %{http_code}\n" https://training.learningai365.com
curl -s https://www.learningai365.com/sitemap.xml | head -3  # expect portfolio sitemap
```

All expected: 200 / 301 / 200 / portfolio sitemap.

In incognito browser:
- `https://www.learningai365.com` → portfolio homepage (spotlight)
- `https://learningai365.com` → 301s to `www`
- `https://training.learningai365.com` → old learningai content
- `https://www.learningai365.com/grid` → grid loads with seed entries

---

### Task 44: Post-cutover SEO redirects

**Files:**
- Modify: `next.config.ts` (in `sgharlow-portfolio` repo)

- [ ] **Step 1: Add catch-all 301 redirects**

Append to `next.config.ts`:

```typescript
import type { NextConfig } from 'next';

const TRAINING = 'https://training.learningai365.com';

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: '/paths/:slug*', destination: `${TRAINING}/paths/:slug*`, permanent: true },
      { source: '/courses/:slug*', destination: `${TRAINING}/courses/:slug*`, permanent: true },
      { source: '/categories/:slug*', destination: `${TRAINING}/categories/:slug*`, permanent: true },
      { source: '/topics/:slug*', destination: `${TRAINING}/topics/:slug*`, permanent: true },
      { source: '/skills/:slug*', destination: `${TRAINING}/skills/:slug*`, permanent: true },
      { source: '/use-cases/:slug*', destination: `${TRAINING}/use-cases/:slug*`, permanent: true },
      { source: '/providers/:slug*', destination: `${TRAINING}/providers/:slug*`, permanent: true },
      { source: '/quiz', destination: `${TRAINING}/quiz`, permanent: true },
      { source: '/quiz/:path*', destination: `${TRAINING}/quiz/:path*`, permanent: true },
      { source: '/about', destination: `${TRAINING}/about`, permanent: true },
      { source: '/faq', destination: `${TRAINING}/faq`, permanent: true },
      { source: '/privacy', destination: `${TRAINING}/privacy`, permanent: true },
      { source: '/terms', destination: `${TRAINING}/terms`, permanent: true },
      { source: '/daily-specials/:slug*', destination: `${TRAINING}/daily-specials/:slug*`, permanent: true },
    ];
  },
};

export default nextConfig;
```

(Preserve any existing settings already in `nextConfig` — merge this `redirects()` into the existing object rather than overwriting.)

- [ ] **Step 2: Build + deploy**

```bash
npm run build
vercel --prod --yes
```

- [ ] **Step 3: Verify a redirect**

```bash
curl -sI https://www.learningai365.com/paths/ai-engineering-roadmap | head -5
```

Expected: 301 Location: https://training.learningai365.com/paths/ai-engineering-roadmap

- [ ] **Step 4: Submit sitemaps to Google Search Console**

In GSC:
- Add `training.learningai365.com` as a new property; submit `https://training.learningai365.com/sitemap.xml`.
- Existing `www.learningai365.com` property → re-submit `https://www.learningai365.com/sitemap.xml`.

- [ ] **Step 5: Commit + push**

```bash
git add next.config.ts
git commit -m "feat: catch-all 301 redirects from legacy paths to training subdomain"
git push
```

---

## SECTION 12 — Post-cutover monitoring + cleanup

### Task 45: 72-hour monitoring window

**Files:** none

- [ ] **Step 1: Daily for 3 days, check Vercel Analytics on both projects**

`vercel inspect <portfolio-prod-url>` — look for error rate spikes, 4xx counts.

- [ ] **Step 2: Check Strapi error logs on EC2**

```bash
ssh -i /c/Users/sghar/CascadeProjects/learningai/infrastructure/learningai365-strapi-key.pem ec2-user@34.222.150.191 \
  "pm2 logs strapi --lines 200 | grep -i 'cors\|error'"
```

Expected: no new CORS rejections.

- [ ] **Step 3: Check Google Search Console for crawl errors**

GSC → Coverage report on both properties. Note any new "Submitted URL not found (404)" entries.

- [ ] **Step 4: If a missed legacy URL pattern appears**

Add it to the `redirects()` array in `next.config.ts`. Commit, push, redeploy.

- [ ] **Step 5: Rollback if criteria triggered**

Trigger criteria (per spec section 7 phase 7): >5min error window, >25% 404 rate in 1h, or Strapi backend down.

Rollback procedure:
1. Vercel: remove `www` and apex from `sgharlow-portfolio`
2. Vercel: re-add both to `learningai365-training`
3. (Optional) rename project back to `learningai365`
4. Verify in incognito

---

### Task 46: 14-day post-cutover cleanup

**Files (on EC2):**
- Modify: `config/middlewares.ts` (Strapi CORS)

**Files (`learningai` repo):**
- Modify: Vercel env vars

- [ ] **Step 1: Wait 14 days from cutover**

Verify portfolio + training are stable, no rollback triggered.

- [ ] **Step 2: Remove `www.learningai365.com` from Strapi CORS allowlist**

SSH to EC2, edit `config/middlewares.ts`, remove `https://www.learningai365.com` from `origin` array (keep `training.learningai365.com`). Restart Strapi.

- [ ] **Step 3: Drop legacy env var from `learningai-training` Vercel project**

If a duplicate / legacy env var exists pointing to `https://www.learningai365.com`, remove it. Only `https://training.learningai365.com` should remain.

- [ ] **Step 4: Review Vercel Analytics for missed 404 patterns**

If any new patterns appear in 404 logs that aren't in the `redirects()` array, add them. Commit + redeploy.

- [ ] **Step 5: Final commit on `learningai` repo (if any changes)**

```bash
cd /c/Users/sghar/CascadeProjects/learningai
git add -A && git commit -m "chore: remove www.learningai365.com from cors allowlist (training is canonical)" || echo "none"
git push
```

---

## Self-review notes

- **Spec coverage:** Verified each spec section maps to tasks: §3 architecture → tasks 1-7; §4 data model → tasks 8-9; §5 components → tasks 15-24; §6 spotlight algorithm → tasks 11-12; §7 cutover → tasks 39-46; §8 monetization → tasks 23, 29; §9 hero strategy → tasks 15, 32, 37; §10 inclusion subset → task 36; §11 open questions → flagged for tasks 36-38.
- **Placeholders:** None — all code shown verbatim.
- **Type consistency:** `appendUtm` accepts `medium: 'hover-popup' | 'modal' | 'spotlight' | 'grid-card' | 'footer-band' | 'shop' | 'top-nav'` — used consistently across `ProjectLinkRows`, `FooterMonetizationBand`, `SpotlightInterstitial`, `ShopPage`. `EnrichedProjectsFile` shape stable across loader, spotlight, and pages. `Category` exported from `enrichment-types` and reused by `StatusBadge`, `GridPage` filters.
- **Cutover risk:** Tasks 39-44 modify production. Task 42 step 5 forces an explicit sgharlow approval before the flip. Rollback procedure documented in task 45 step 5.
