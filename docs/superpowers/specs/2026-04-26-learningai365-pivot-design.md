# learningai365.com Pivot — Design Spec

**Date:** 2026-04-26
**Author:** Claude (Opus 4.7) with sgharlow
**Status:** ⚠️ **ABANDONED 2026-05-01.** Superseded by the subdomain plan (see top-of-file addendum). Original status (now stale): §1–4, §7–8, §10–12 still authoritative for the cutover. §5 (component layout) and §6 (daily-spotlight rotation) **superseded 2026-04-26 evening** by `/spectrum-lab-design.md` (commit `1befa1f`). See addendum below.

---

## ABANDONED 2026-05-01 — cutover replaced by subdomain plan

**The cutover described in this spec was never executed and will not be.** Both `www.learningai365.com` and `training.learningai365.com` continue to serve the LearningAI affiliate site (the cutover prep made them point at the same Vercel project; that's where it stops). The portfolio will not take over `www.`.

### Replacement plan

- **`www.learningai365.com`** stays the LearningAI affiliate / training site, long-term. The site has $0 affiliate revenue today; the play is to build organic traffic + content (programmatic compare pages, fresh-content `/courses/new`, distribution via LinkedIn/Twitter) and let the existing link equity compound.
- **`portfolio.learningai365.com`** is the new home for the portfolio (this repo). One-time DNS + Vercel domain ops (CNAME → cname.vercel-dns.com, add domain to `sgharlow-portfolio` Vercel project). No path-mounting, no rewrites, no basePath. Each site is fully independent at the edge.
- **Top-nav cross-links**: learningai gets a "Portfolio" link (next to "About") pointing at `https://portfolio.learningai365.com`. Portfolio gets an "AI Courses" link pointing at `https://www.learningai365.com`. Symmetric two-way bridge.

### Why this spec was abandoned

The cutover was correct as a design but mispriced as a near-term move:

1. **Asymmetric investment.** Five days of commits on learningai (`36dfaa5` direct affiliate CTA, `fbefca5` "Start course #1" CTA, `a8d9a9a` OpenAI enrichment, `962a21c` /courses/new, `7cf2f3d` DeepLearning.AI scrapers, `51ffa04` compare pages) showed the affiliate site was being polished as the revenue surface — not as a soon-to-be-demoted subdomain.
2. **SEO link equity.** `www.learningai365.com` has accrued months of indexation against the catalog. Demoting it to `training.*` and migrating equity via Phase-6 catch-all 301s would have worked, but for a site with $0 baseline revenue the right move is to keep the equity in place and let traffic compound.
3. **Subdomain dissolves all the implementation costs of path-mounting.** No rewrite-edge fragility, no basePath refactor on the portfolio, no `/_next/static/*` collisions, no JSON-LD canonical edits. The portfolio standalone Vercel deploy keeps working unchanged.

### What was unwound on 2026-05-01

- `learningai/frontend/src/app/layout.tsx`, `next-sitemap.config.js`, `src/app/page.tsx`, `src/app/sitemap.ts` — `NEXT_PUBLIC_SITE_URL` defaults reverted from `training.*` back to `www.*`
- `learningai/frontend/src/app/layout.tsx` and `MobileNav.tsx` — Portfolio nav links updated from `https://sgharlow-portfolio.vercel.app` to `https://portfolio.learningai365.com`, `target="_blank"` removed (now same-property)
- `portfolio/next.config.ts` — 14-entry catch-all 301 redirect table to `training.*` removed (no longer needed; routes that don't exist on the portfolio simply 404)
- `portfolio/tests/unit/redirects.test.ts` — deleted (was testing the redirect table that was just removed)

### What was kept from this spec for reference

- §5–6 superseded by Spectrum Lab (already noted in the 2026-04-28 addendum below)
- §9 hero-image strategy and nano-banana prompt template — still useful for portfolio entries
- §10 inclusion subset table — became `data/projects.json` (56 entries shipped)
- §11–12 open questions / out-of-scope — partially still open, partially moot

The original spec body is preserved below for historical context.

---

## ADDENDUM 2026-04-28 — Spectrum Lab supersedes §5–6

After the brainstorm captured in §5–6 (full-viewport "Today's Spotlight" interstitial + daily rotation), the design pivoted the same evening to the **Spectrum Lab** approach in `/spectrum-lab-design.md`. That doc is the source of truth for component layout, color, typography, and category model. The built site at `app/page.tsx` matches it exactly.

### What changed vs §5–6

| Topic | §5–6 (this doc, original) | Spectrum Lab (built, v1) |
|---|---|---|
| Homepage | Full-viewport "Today's Spotlight" interstitial → close → `/grid` | "The lab" — direct grid with category filter chips, no interstitial |
| Categories | `active / frozen / experiment / product` (lifecycle) | `agents / mcp / product / research / tooling` (taxonomy) |
| Status | implicit in category | separate field: `active / in progress / shipped / experiment / archived` |
| Daily rotation | yes (`lib/daily-spotlight.ts`, slug-sorted pool, launch-date epoch) | **deferred to v2** |
| Color meaning | category accent per lifecycle | category = color (paint-chip), status = small mono dot |
| `/today` route | aliased to `/` | not present in v1 |
| Schema version | 1 | **2** (see `lib/enrichment-types.ts`) |

### Why the pivot

The original lifecycle-categories design conflated "what kind of project is this" with "where in lifecycle it sits." The Spectrum Lab split lets visitors scan by *kind* (the dominant signal) and then secondarily filter by *status*. The 9-section spec at `/spectrum-lab-design.md` locks color, typography, layout, and avoid-list values — that document is binding for any future spectrum-lab changes.

### Daily-spotlight rotation — deferred, not abandoned

> **v2 status (as of 2026-05-01 closeout): no active v2 roadmap exists.** The site is in closeout state. Whether v2 is deferred (revisit when analytics justify it) or cancelled is an owner decision. Owner confirm required before treating this as an open engineering item.

If we add it back as v2:
- Pool definition would shift to `status ∈ {'active', 'shipped'}` (works against the v1 schema; no new field needed).
- Add `app/today/page.tsx` rendering a spotlight interstitial — does **not** replace `/`.
- TopNav gets a "Today" link.
- `lib/daily-spotlight.ts` algorithm in §6 stays valid; just operate on the v2 schema's `EnrichedProjectEntry`.

Trigger for revisiting: data showing return-visit value (Vercel Analytics on the live portfolio for ≥1 week post-cutover).

### What still applies from the original §5–6

- `<ProjectCard>` hover popup / mobile modal contract for live site / GitHub / video / hackathon / product rows. (Implementation detail in spectrum-lab spec.)
- Footer monetization band on every route. (Implementation in `app/layout.tsx`.)
- `/projects/[slug]` detail pages and `/shop` filtered grid.
- The cutover plan in §7, monetization in §8, and inclusion subset in §10 are unchanged.

---

## 1. Goal

Pivot `learningai365.com` from a single-purpose AI-training affiliate site into a personal AI-learning portfolio, while preserving the existing site under a new subdomain.

End state:

- `www.learningai365.com` — new portfolio site (this spec)
- `training.learningai365.com` — existing learningai content (moved subdomain, no content change)
- `learningai365.com` (apex) — 301 redirect → `https://www.learningai365.com`

---

## 2. Decisions locked during brainstorming

| Topic | Decision |
|---|---|
| Cutover style | Sequential, no interim redirect (Q1/B). Build portfolio fully behind preview URL; one big-bang flip at the end. |
| Data source | Hybrid (Q2/C). Curated `data/projects.json` is source of truth; build-time enrichment from GitHub + Vercel APIs for status fields. |
| Inclusion scope | Curated AI-learning portfolio subset (Q3/B). Excludes internal tooling (orchestra-lite, mdlink-check, ticket-quality, system-docs, etc.). Final list assembled during implementation. |
| Mobile UX for hover popup | Modal on tap (Q4/B), same content as desktop hover. |
| Daily Special placement | Full-page interstitial at `/` (Q5/B). Close button → `/grid`. |
| Spotlight pool | `active` + `frozen` only (Q6). Experiments and products excluded. |
| Hero images | Programmatic stubs (Q7/A) as fallback; per-project nano-banana prompts in `data/projects.json` for hand-generated art. |
| Monetization | Footer band + first-class product entries in grid (Q8/B+D). |
| Repo + Vercel project name | `sgharlow-portfolio` (Q9). Public repo. New Vercel project. Existing `learningai365` Vercel project renamed in-place to `learningai365-training` at cutover. |
| Apex destination | 301 → `https://www.learningai365.com` (Q10/A). |
| Approach | Greenfield Next.js 15 + React 19 + TypeScript + Tailwind v4 (Approach 1). |

---

## 3. Architecture

### Stack

- Next.js 15 (App Router) + React 19 + TypeScript
- Tailwind v4
- No database, no auth, no CMS
- ISR with 6-hour default revalidation; 1-hour for the spotlight page
- Vitest for unit tests; Playwright for one smoke flow

### Repo & deployment

- Disk path: `C:\Users\sghar\CascadeProjects\portfolio\` (folder may be renamed on disk to match repo at any point — the GitHub repo and Vercel project are the canonical names)
- GitHub: `sgharlow/sgharlow-portfolio` (public, MIT, Dependabot enabled)
- Vercel project: `sgharlow-portfolio` (new, separate from `learningai365`)
- Production domain post-cutover: `www.learningai365.com`
- Apex `learningai365.com`: configured at Vercel domain settings as 301 → `www`

### Directory layout

```
sgharlow-portfolio/
├── app/
│   ├── page.tsx                    # Today's Spotlight interstitial (full-page)
│   ├── today/page.tsx              # Alias of /, for direct linking
│   ├── grid/page.tsx               # Scrollable project grid
│   ├── projects/[slug]/page.tsx    # Per-project detail page
│   ├── shop/page.tsx               # Books + LemonSqueezy products
│   ├── sitemap.ts
│   ├── robots.ts
│   ├── layout.tsx                  # Footer monetization band lives here
│   └── api/revalidate/route.ts     # On-demand revalidation webhook
├── components/
│   ├── ProjectCard.tsx
│   ├── ProjectHoverPopup.tsx       # Desktop hover content
│   ├── ProjectModal.tsx            # Mobile tap modal (same content)
│   ├── SpotlightInterstitial.tsx
│   ├── FooterMonetizationBand.tsx
│   └── StatusBadge.tsx             # active / frozen / experiment / product chips
├── lib/
│   ├── projects.ts                 # Loads + types projects.enriched.json
│   ├── daily-spotlight.ts          # Port of getActiveSpecial(), pool-filtered
│   ├── enrichment-types.ts
│   └── links.ts                    # appendUtm() helper
├── data/
│   ├── projects.json               # Hand-curated source of truth (committed)
│   └── projects.enriched.json      # Build output (gitignored)
├── scripts/
│   ├── enrich-projects.ts          # prebuild: gh + Vercel API enrichment
│   └── list-image-prompts.ts       # extracts heroImagePrompt fields by slug
├── public/
│   └── projects/{slug}.{webp,png}  # Hero images you drop in
├── docs/superpowers/specs/2026-04-26-learningai365-pivot-design.md
├── tests/
│   ├── unit/daily-spotlight.test.ts
│   ├── unit/projects-loader.test.ts
│   ├── unit/enrich-projects.test.ts
│   └── e2e/spotlight-to-grid.spec.ts
├── .env.example                    # GH_TOKEN, VERCEL_TOKEN, VERCEL_TEAM_ID
└── package.json                    # "prebuild": "tsx scripts/enrich-projects.ts"
```

### Build-time enrichment flow

1. `prebuild` script reads `data/projects.json`.
2. For each entry with `githubRepo`: GitHub API fetch — last commit date, archived flag, primary language, stars, latest release.
3. For each entry with `vercelProject`: Vercel REST API fetch — latest production deployment timestamp, deployment state, primary domain.
4. Writes `data/projects.enriched.json`.
5. Build fails loud if `GH_TOKEN` or `VERCEL_TOKEN` missing — no silent fallback to stale data.
6. Pages import the enriched JSON; ISR `revalidate` triggers periodic re-enrichment.

---

## 4. Data model

### Curated source (`data/projects.json`)

```typescript
type Category = 'active' | 'frozen' | 'experiment' | 'product';
type ProjectKind =
  | 'web-app' | 'cli' | 'mcp-server' | 'chrome-ext'
  | 'reddit-game' | 'library' | 'book' | 'course-platform';

interface ProjectEntry {
  slug: string;                    // url-safe; primary key
  name: string;
  tagline: string;                 // ≤80 chars
  summary: string;                 // 2-3 sentences for popup/modal body
  category: Category;
  kind: ProjectKind;
  heroImage: string | null;        // path under /public/projects/, null → stub
  heroImagePrompt: string;         // nano-banana prompt, kept for traceability
  order?: number;                  // optional manual sort weight; default = activityScore asc

  links: {
    deployedSite?: string;
    githubRepo?: string;           // "owner/repo"
    youtubeVideo?: string;
    hackathon?: Array<{
      name: string;
      url?: string;
      status: 'submitted' | 'finalist' | 'won' | 'active';
      prize?: string;
    }>;
    products?: Array<{
      label: string;
      url: string;
      kind: 'kindle' | 'lemonsqueezy' | 'gumroad' | 'other';
    }>;
  };

  statusOverride?: string;         // wins over enriched derivedStatus

  spotlight?: {
    longDescription: string;       // markdown; full-page interstitial body
    callToAction?: { label: string; url: string };
    overrideDates?: string[];      // ["YYYY-MM-DD"]; pin entry to specific dates
  };
}

interface ProjectsFile {
  version: 1;
  generatedAt?: string;            // ISO; only on .enriched.json
  spotlightLaunchDate: string;     // ISO date; daily-spotlight epoch
  entries: ProjectEntry[];
}
```

### Enriched output (`data/projects.enriched.json`, gitignored)

```typescript
interface EnrichedProjectEntry extends ProjectEntry {
  enriched: {
    github?: {
      lastCommitAt: string;
      archived: boolean;
      stars: number;
      primaryLanguage: string | null;
      latestRelease?: { tag: string; publishedAt: string };
      fetchedAt: string;
      fetchOk: boolean;
    };
    vercel?: {
      lastDeploymentAt: string;
      lastDeploymentState: 'READY' | 'ERROR' | 'BUILDING' | 'CANCELED';
      productionDomain: string;
      fetchedAt: string;
      fetchOk: boolean;
    };
    derivedStatus: string;         // human-readable
    activityScore: number;         // days since last activity; lower = fresher
  };
}
```

### Derivation rules

- `derivedStatus` precedence: `statusOverride` → enriched data formatted (`"Active — last commit 3d ago"`) → category-only fallback (`"Frozen / archived"`).
- `activityScore` = days since `max(github.lastCommitAt, vercel.lastDeploymentAt)`. Used for grid ordering when `order` unset.
- Spotlight pool = entries where `category ∈ {'active', 'frozen'}`.

---

## 5. Component layout

### Layout chrome (`app/layout.tsx`)

- **Top nav:** logo (`sgharlow`) left; right side `Today` · `All projects` · `Shop` · `GitHub` · `LinkedIn`.
- **Footer monetization band** (every page):
  - Row 1: "Books I've written" — entries with `kind: 'book'`. Cover thumbnail + title + buy CTA.
  - Row 2: "Other products" — entries with `kind ∈ {'lemonsqueezy', 'gumroad', 'other'}` excluding books.
  - Empty rows hidden.
- Footer links: copyright, RSS, sitemap, contact.

### Surface 1 — Spotlight interstitial (`/` and `/today`)

Full-viewport hero on first paint. Renders `<SpotlightInterstitial entry={todaysProject} />`.

- Title: "Today's Spotlight · {date}"
- Hero image (16:9), full width on mobile
- Project name + tagline
- Long description (markdown rendered)
- Status badge
- CTAs: Visit site / GitHub / Watch demo / Hackathon row (only if data present)
- Close button → `<Link href="/grid" prefetch>`. `Esc` keyboard shortcut.
- `revalidate: 3600` (1h)

### Surface 2 — Project grid (`/grid`)

Vertical scroll. Default sort: `activityScore` ascending (freshest first). Filter chips: `All` · `Active` · `Frozen` · `Experiments` · `Products` via URL search params.

`<ProjectCard>` structure:

- 16:9 hero image (rounded), with hover popup overlay on desktop / tap modal on mobile
- Project name + status badge inline
- One-line tagline
- Kind chip

### Hover popup / modal — shared content (item 3.C contract)

Rows render only when their data exists:

1. Live site link (`links.deployedSite`)
2. GitHub repo link (`links.githubRepo`)
3. Latest YouTube video (`links.youtubeVideo`)
4. Status text (`derivedStatus`)
5. Hackathon entries (each entry from `links.hackathon[]`)
6. Category badge ("Active development" / "Frozen / archived" / "Experiment" / "Product")
7. Product purchase links (each entry from `links.products[]`)

Shared component takes `entry: EnrichedProjectEntry` and `variant: 'hover' | 'modal'`. Hover: positioned over hero, no header, fade+slide-up 180ms. Modal: full-screen, header with name + close-X, fade 200ms.

### Surface 3 — Project detail (`/projects/[slug]`)

Pre-rendered via `generateStaticParams` from enriched JSON. Same content as spotlight body, always accessible. Useful for sharing.

### Surface 4 — `/shop`

Grid filtered to `category: 'product'`. Card click → directly to product purchase URL (no intermediate detail page).

### Visual tone

- Display sans (Inter Tight or Geist) for headings; system mono for status badges
- Dark mode default, light toggle
- Per-category accent: `active` = green, `frozen` = amber, `experiment` = magenta, `product` = electric blue
- Status pill is the only colored element on a card at rest — eye scans by activity at a glance
- Generous whitespace; ~240px hero height on desktop cards
- Subtle motion only — fade+slide, no scroll-jacking

Detailed styling decisions deferred to implementation phase using `frontend-design` skill.

---

## 6. Daily Spotlight algorithm

Direct port of `getActiveSpecial()` from `learningai/frontend/src/data/daily-specials.ts:49-65`, adapted for project entries.

### `lib/daily-spotlight.ts`

```typescript
const SPOTLIGHT_POOL_CATEGORIES = ['active', 'frozen'] as const;

function getTodayUTC(now: Date = new Date()): string {
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, '0');
  const d = String(now.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function selectSpotlightPool(
  entries: EnrichedProjectEntry[]
): EnrichedProjectEntry[] {
  return entries
    .filter((e) => (SPOTLIGHT_POOL_CATEGORIES as readonly string[]).includes(e.category))
    .sort((a, b) => a.slug.localeCompare(b.slug)); // stable order = stable rotation
}

export function getTodaysSpotlight(
  file: ProjectsFile & { entries: EnrichedProjectEntry[] },
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

### Why this design

1. **Stable rotation under churn:** sort by `slug` before indexing means adding/removing entries only shifts the schedule from that point — no retroactive reshuffling.
2. **Pool drift handled:** category flips just adjust the modulo.
3. **`overrideDates`** lets you pin a project to a specific date (demos, launches).
4. **`spotlightLaunchDate` in JSON:** rotation epoch shifts by editing one field.
5. **Pre-launch safety:** double-modulo prevents `NaN` indexing.

### Page integration

```typescript
// app/page.tsx — server component
export const revalidate = 3600; // 1h to bound stale-spotlight after UTC midnight rollover

export default async function Page() {
  const file = await getProjectsFile();
  const today = getTodaysSpotlight(file);
  return <SpotlightInterstitial entry={today} />;
}
```

### Optional manual override (deferred — not in v1 unless flagged)

`/?spotlight=health-pulse` query param could force a specific entry for demos. Gated by slug-existence check, with visible "Override" badge so manually-pinned URLs aren't mistaken for live rotation. **Not included in v1.**

### Test coverage

- `selectSpotlightPool`: filters experiments + products, includes active + frozen, sort stability
- `getTodaysSpotlight`: deterministic across known dates, override wins over rotation, pre-launch dates don't crash, single-entry pool, empty-pool throws
- Snapshot test covering 30 consecutive days against a 5-entry fixture pool — guards against rotation drift

---

## 7. Cutover plan

### Pre-cutover state

- Vercel project `learningai365` (`prj_gOhBy4UhMFtHC5uDdeH0SGO2dFq2`) serves `www.learningai365.com` + apex
- Strapi at `api.learningai365.com` on EC2 `34.222.150.191` — untouched by this pivot

### Target end state

- Vercel project `learningai365-training` (renamed from `learningai365`) serves `training.learningai365.com`
- Vercel project `sgharlow-portfolio` (new) serves `www.learningai365.com`
- Apex `learningai365.com` 301 → `https://www.learningai365.com`
- Strapi unchanged

### Phase 0 — Capture pre-cutover state

- `vercel inspect <prj_id>` for existing project — record domains, env vars, deployment history
- Screenshot of current `www.learningai365.com`
- `vercel env pull` from existing project to a backup file outside the repo
- Document GTM/Analytics tag IDs (these stay with `learningai365-training` after rename)

### Phase 1 — Strapi backend prep

- SSH to EC2 `34.222.150.191`, edit `config/middlewares.ts` to add `training.learningai365.com` to CORS allowlist
- Restart Strapi
- Curl-test that origin `https://training.learningai365.com` is accepted
- **Do NOT** remove `www.learningai365.com` from CORS yet — both must work during cutover

### Phase 2 — Build portfolio site behind preview URL

- `sgharlow-portfolio` repo + Vercel project created
- All content authored in `data/projects.json`
- Hero images placed in `public/projects/`
- Vitest + Playwright pass
- Internal review against this spec

### Phase 3 — Stage `training.learningai365.com` on the existing project

- Add `training.learningai365.com` as additional production domain (alongside `www`, apex)
- Add CNAME at registrar: `training.learningai365.com` → `cname.vercel-dns.com`
- Wait for SSL provisioning
- Add env var `NEXT_PUBLIC_SITE_URL=https://training.learningai365.com` (don't remove old one yet)
- Edit the 8 hardcoded URLs in the learningai repo to read from env (one PR, deploy, verify)
- Both domains now serve identical content; no redirect; SEO healthy

### Phase 4 — Final pre-cutover checks

- Run `/pre-deploy-check` against portfolio repo
- Verify `metadataBase = https://www.learningai365.com`
- Verify portfolio sitemap generates correctly
- Verify `robots.txt` is permissive
- Save latest portfolio deployment URL as rollback target

### Phase 5 — Cutover (single ~10-minute window)

In this exact order:

1. Rename existing Vercel project `learningai365` → `learningai365-training`
2. Remove `www.learningai365.com` and `learningai365.com` (apex) from `learningai365-training`'s domain list
3. Add `www.learningai365.com` to `sgharlow-portfolio` as production domain
4. Add `learningai365.com` (apex) to `sgharlow-portfolio` configured as 301 → `www`
5. Wait for SSL provisioning on `www`
6. Smoke test in incognito:
   - `https://www.learningai365.com` → portfolio
   - `https://learningai365.com` → 301 → `www`
   - `https://training.learningai365.com` → old site
   - Sitemap matches surface
7. Submit updated sitemaps in Google Search Console:
   - Add `training.learningai365.com` as new property
   - Re-submit existing `www.learningai365.com` property sitemap

### Phase 6 — Post-cutover SEO preservation (next 7 days)

Catch-all 301 redirects in `next.config.ts` of `sgharlow-portfolio`:

```typescript
async redirects() {
  return [
    { source: '/paths/:slug*', destination: 'https://training.learningai365.com/paths/:slug*', permanent: true },
    { source: '/courses/:slug*', destination: 'https://training.learningai365.com/courses/:slug*', permanent: true },
    { source: '/categories/:slug*', destination: 'https://training.learningai365.com/categories/:slug*', permanent: true },
    { source: '/topics/:slug*', destination: 'https://training.learningai365.com/topics/:slug*', permanent: true },
    { source: '/skills/:slug*', destination: 'https://training.learningai365.com/skills/:slug*', permanent: true },
    { source: '/use-cases/:slug*', destination: 'https://training.learningai365.com/use-cases/:slug*', permanent: true },
    { source: '/providers/:slug*', destination: 'https://training.learningai365.com/providers/:slug*', permanent: true },
    { source: '/quiz', destination: 'https://training.learningai365.com/quiz', permanent: true },
    { source: '/quiz/:path*', destination: 'https://training.learningai365.com/quiz/:path*', permanent: true },
    { source: '/about', destination: 'https://training.learningai365.com/about', permanent: true },
    { source: '/faq', destination: 'https://training.learningai365.com/faq', permanent: true },
    { source: '/privacy', destination: 'https://training.learningai365.com/privacy', permanent: true },
    { source: '/terms', destination: 'https://training.learningai365.com/terms', permanent: true },
    { source: '/daily-specials/:slug*', destination: 'https://training.learningai365.com/daily-specials/:slug*', permanent: true },
  ];
}
```

Removable later once training has accumulated its own SEO footprint.

### Phase 7 — Monitor & rollback (first 72h)

Monitor:
- Vercel deployment errors on either project
- Spike in 404s in Vercel Analytics
- Strapi error logs (CORS rejections from missed cases)
- Google Search Console crawl errors

Rollback triggers (any one):
- Portfolio renders errors in production for >5 minutes
- 404 rate on `www.learningai365.com` > 25% of traffic in any 1h window
- Strapi backend down due to CORS misconfiguration

Rollback procedure (target <10 min):
1. Remove `www.learningai365.com` and apex from `sgharlow-portfolio`
2. Re-add to `learningai365-training`
3. Optional: rename `learningai365-training` back to `learningai365`
4. Verify in incognito

DNS doesn't change during rollback — only Vercel domain assignments — so propagation isn't a factor.

### Phase 8 — Post-cutover cleanup (after 14 days of stable operation)

- Remove `www.learningai365.com` from Strapi CORS allowlist on EC2 — portfolio doesn't call Strapi, so the entry is dead code
- Drop the `NEXT_PUBLIC_SITE_URL=https://www.learningai365.com` legacy env var from `learningai-training` (only `https://training.learningai365.com` remains)
- Review Vercel Analytics on portfolio for any 404 patterns the Phase 6 catch-all missed; extend the redirect list if needed

### Files in `learningai` repo to update for env-driven domains

`frontend/next-sitemap.config.js:3,16` · `frontend/next.config.ts:17` · `frontend/src/app/page.tsx:40,49,52` · `frontend/src/app/layout.tsx:45` · `frontend/src/app/sitemap.ts:64` · `frontend/.env.production.local:12`

---

## 8. Monetization

### Footer band

Two-row band in `app/layout.tsx`, on every route:

- Row 1: "Books I've written" — entries with `kind: 'book'`
- Row 2: "Other products" — entries with `kind ∈ {'lemonsqueezy', 'gumroad', 'other'}` excluding books
- Cards: cover thumbnail + title + buy CTA → directly to `links.products[0].url`
- "Coming soon" placeholder for products with no `links.products` populated — click goes to `/projects/{slug}`
- Empty rows hidden

### First-class product entries in grid

- Same `<ProjectCard>` component, electric-blue accent
- Hover popup omits irrelevant rows (no GitHub, no deployed-site for books)
- `Products` filter chip on grid

### Spotlight pool exclusion

Products excluded from daily rotation (locked in section 6).

### Initial product entries (populate during implementation)

| slug | name | kind | status |
|---|---|---|---|
| `ender-ai-leadership` | Ender AI Leadership | book | live |
| `ai-leadership-upcoming` | (upcoming AI leadership book) | book | coming-soon |
| `premium-claude-code-recipes` | Premium Claude Code Recipes | lemonsqueezy | live |

User to provide final titles, cover images, purchase URLs at implementation time. Stub URLs `https://example.com/TODO-replace` are acceptable interim values — footer is empty-safe.

### UTM tagging

`appendUtm()` helper in `lib/links.ts` adds `?utm_source=portfolio&utm_medium={location}&utm_campaign={slug}`:

- `medium=footer-band` for footer clicks
- `medium=grid-card` for grid card clicks
- `medium=hover-popup` for popup clicks

Amazon affiliate tags preserved alongside UTM params.

### Deferred to v2

Contextual product mentions inside hover popups (relationship model — `relatedProducts: string[]` per entry). Footer band already gives every page exposure to every product; cramming popup-level mentions hurts the seven primary contract rows.

---

## 9. Hero image strategy

### Build behavior

- `data/projects.json` carries `heroImage: string | null` and `heroImagePrompt: string` per entry
- `<ProjectCard>` renders the file at `public/projects/{slug}.{webp,png}` if present, otherwise programmatic stub
- Stub: 16:9 gradient + project name typography, HSL hue derived from `hashCode(slug) % 360` for cross-render consistency

### Nano-banana prompt template

```
Format: 16:9 hero illustration, dark background, technical-but-warm aesthetic
Style:  editorial flat illustration, subtle gradient lighting, clean geometric forms,
        muted color palette anchored on {ACCENT_COLOR}, NO text, NO logos, NO faces
Composition: central subject on a dark gradient backdrop, soft rim lighting,
             negative space top-right for category badge overlay
Subject: {PROJECT-SPECIFIC SUBJECT LINE}
Mood: {MOOD WORD}
```

`{ACCENT_COLOR}` matches category accent: emerald green (active), warm amber (frozen), magenta (experiment), electric blue (product). Keeps the grid visually unified.

### Sample prompts (full list assembled during implementation)

**`health-pulse` (active, mcp-server):**
> ...muted palette anchored on emerald green... Subject: a stylized heart-rate ECG line transforming into a network of connected nodes, with a translucent shield motif suggesting healthcare data integrity. Mood: vigilant, precise.

**`find-evil` (active, mcp-server):**
> ...emerald green... Subject: a magnifying glass over abstract evidence fragments — broken chains, fingerprints, and binary streams converging into a single forensic seal. Mood: investigative, deliberate.

**`accessbrowse` (frozen, chrome-ext):**
> ...warm amber... Subject: an abstract sound wave guiding a stylized cursor through a layered browser-window stack, suggesting voice-driven navigation. Mood: assistive, calm.

**`comment-conspiracy` (frozen, reddit-game):**
> ...warm amber... Subject: a tangled web of comment-bubble shapes connected by red string like a conspiracy board, with one bubble glowing as the "real" one. Mood: playful, suspicious.

**`orchestra-lite` (experiment, library):**
> ...magenta... Subject: a conductor's baton hovering over a constellation of small glowing agent-shapes arranged in symphonic-section formation. Mood: orchestrating, rhythmic.

**`ender-ai-leadership` (product, book):**
> ...electric blue... Subject: a stylized chess king piece dissolving at the edges into networked light particles, suggesting strategic command transmuted into AI-augmented decision-making. Mood: contemplative, decisive.

For book entries: nano-banana hero is a **scene illustration** that complements the actual book cover (which lives separately in the footer band). Two distinct images per book.

### Generation workflow

1. `npx tsx scripts/list-image-prompts.ts > prompts.txt` — extracts all `heroImagePrompt` values keyed by slug
2. Paste into nano-banana, generate, save to `public/projects/{slug}.webp` (~80kb each)
3. Set `heroImage: "/projects/{slug}.webp"` in `data/projects.json`
4. Rebuild — stubs replaced

---

## 10. Inclusion subset (to be finalized in implementation plan)

Curated AI-learning portfolio subset. Exclude internal tooling (orchestra-lite-as-tool, mdlink-check, ticket-quality, system-docs, steves-minions, env-update). Likely-included projects from research:

| slug candidate | source | category guess |
|---|---|---|
| `health-pulse` | GitHub + Vercel + hackathon | active |
| `find-evil` | GitHub + hackathon | active |
| `ride-check` | GitHub + Vercel | active |
| `distraction` | GitHub + Vercel (`distraction-index`) | active |
| `claude-code-recipes` | GitHub | active |
| `comment-conspiracy` | GitHub + hackathon (Reddit) | frozen |
| `scripture-sleuth` | GitHub + hackathon (Reddit) | frozen |
| `kiro-living-docs-devpost` | GitHub + hackathon | frozen |
| `inspect-iq` | GitHub + hackathon | frozen |
| `adapt-learn` | GitHub + Vercel | experiment |
| `accessbrowse` | GitHub + hackathon | frozen |
| `accessvoice` | GitHub + hackathon | frozen |
| `migrateiq` | GitHub + hackathon ($65K) | active |
| `ai-pr-bot` | GitHub + hackathon | frozen |
| `signbridge` | GitHub + hackathon | frozen |
| `ai-matcher-aws` | GitHub + hackathon | frozen |
| `autospecai-hackathon` | GitHub + hackathon | frozen |
| `ai-control-framework` | GitHub | active |
| `multimodal-learning-enhancer` | GitHub | experiment |
| `trivia60-aws-game-builder` | GitHub | frozen |
| `aicin` | GitHub | experiment |
| `ender-ai-leadership` | (book) | product |
| `ai-leadership-upcoming` | (book) | product |
| `premium-claude-code-recipes` | (LemonSqueezy) | product |

Final inclusion list confirmed during implementation phase.

---

## 11. Open questions for implementation phase

1. Final inclusion list (Q3/B was "curated" — exact set assembled at implementation start with user)
2. Final book/product titles, cover images, purchase URLs
3. YouTube video URLs for projects with relevant videos (`links.youtubeVideo` per entry)
4. Hackathon URL/status fields for entries currently inferred from repo names but not confirmed in MEMORY (AutoSpec, ai-pr-bot, SignBridge, trivia60, AI-matcher-AWS)
5. Whether to include the optional `?spotlight=` manual override URL param

---

## 12. Out of scope

- Migrating Strapi off EC2
- Decommissioning `training.learningai365.com` (separate cutover when "near-term plans" mature)
- Apex eventually serving portfolio directly instead of redirecting to www (separate change)
- Contextual product mentions inside hover popups
- Manual `?spotlight=` override (gate flag — implement only if flagged in v1)
- Newsletter/email capture on portfolio (training site keeps the ConvertKit form; portfolio doesn't duplicate)
