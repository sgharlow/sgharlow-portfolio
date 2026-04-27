# Spectrum lab — design specification

A design system for a personal AI learning site organized as a project lab, where color encodes **what kind of work each project is** rather than its current state. Status is present but visually subordinate.

This document is the source of truth for implementation. When in doubt, follow the explicit values here; do not improvise colors, sizes, or radii.

---

## 1. Design intent

- **Color is taxonomy, not decoration.** Each project belongs to exactly one category (agents, MCP, product, research, tooling). The category drives the dominant color treatment of its card.
- **Status is a secondary signal.** A small dot + label in a neutral pill — never a colored card or stripe. Promoting status to color level competes with the taxonomy.
- **Mono for metadata, sans for content.** All dates, IDs, status text, tech stack chips, and category labels are monospace. Titles, descriptions, and nav are sans-serif.
- **Cards over chrome.** No shadows, no gradients, no glow. Color comes from solid fills and a vertical rail; structure comes from 0.5px borders.
- **The grid should read like a paint-chip library.** A visitor scanning the page should sort projects by category before reading any titles.

---

## 2. Color system

### 2.1 Category palette (closed enumeration)

Every project must be assigned exactly one of these. Do not invent new categories without updating this spec.

| Category   | Rail bg    | Rail label text | Tag bg     | Tag text   |
|------------|------------|-----------------|------------|------------|
| `agents`   | `#534AB7`  | `#EEEDFE`       | `#EEEDFE`  | `#26215C`  |
| `mcp`      | `#1D9E75`  | `#E1F5EE`       | `#E1F5EE`  | `#04342C`  |
| `product`  | `#D85A30`  | `#FAECE7`       | `#FAECE7`  | `#4A1B0C`  |
| `research` | `#D4537E`  | `#FBEAF0`       | `#FBEAF0`  | `#4B1528`  |
| `tooling`  | `#378ADD`  | `#E6F1FB`       | `#E6F1FB`  | `#042C53`  |

**Rule:** Tag background uses the lightest stop of the same color family as the rail. Tag text uses the darkest stop. This visually links the tech-stack tags to the category without repeating the saturated rail color.

### 2.2 Status palette (closed enumeration)

Status uses a colored dot inside a neutral mono pill. The pill background and border are always neutral; only the dot carries color.

| Status        | Dot color  |
|---------------|------------|
| `active`      | `#1D9E75`  |
| `in progress` | `#BA7517`  |
| `shipped`     | `#534AB7`  |
| `experiment`  | `#D4537E`  |
| `archived`    | `#888780`  |

**Rule:** When a project is `archived`, set the entire status pill to `opacity: 0.7` so it visibly recedes.

### 2.3 Neutrals

Use CSS variables, not hardcoded hex, for any neutral surface or text. This is what makes light/dark mode work without forking the palette.

| Token                          | Use                                                  |
|--------------------------------|------------------------------------------------------|
| `--color-background-primary`   | Card body                                            |
| `--color-background-secondary` | Legend bar, page surfaces                            |
| `--color-text-primary`         | Titles, brand name                                   |
| `--color-text-secondary`       | Descriptions, nav links, status pill text            |
| `--color-text-tertiary`        | Mono metadata (dates, IDs, foot meta)                |
| `--color-border-tertiary`      | All 0.5px borders                                    |

### 2.4 Brand accent

A single saturated accent appears on the brand `// the lab` mono subtitle. Default to `#D85A30` (the product/coral color). This is the only place the page itself takes on a saturated color outside the cards. Change it per page or season if desired, but pick one.

---

## 3. Typography

```
--font-sans:  "Inter", system-ui, -apple-system, sans-serif
--font-mono:  "JetBrains Mono", "SF Mono", Menlo, monospace
```

| Element             | Family | Size | Weight | Notes                                |
|---------------------|--------|------|--------|--------------------------------------|
| Brand name          | sans   | 14   | 500    | `sgharlow`                           |
| Brand subtitle      | mono   | 11   | 400    | `// the lab`, accent color           |
| Nav links           | sans   | 13   | 400    | secondary text color                 |
| H1 (page title)     | sans   | 26   | 500    | letter-spacing -0.01em               |
| Hero description    | sans   | 14   | 400    | secondary text, line-height 1.5      |
| Card title          | sans   | 15   | 500    | line-height 1.3                      |
| Card description    | sans   | 13   | 400    | secondary text, line-height 1.5      |
| Rail label          | mono   | 10   | 500    | uppercase via content, vertical text, letter-spacing 0.12em |
| Status pill text    | mono   | 10   | 400    | letter-spacing 0.04em                |
| Tech stack tag      | mono   | 10   | 400    | uses category palette                |
| Card ID             | mono   | 10   | 400    | tertiary text, e.g. `#01`            |
| Foot meta           | mono   | 10   | 400    | tertiary text, e.g. `updated 2d ago` |
| Legend item         | mono   | 11   | 400    | secondary text                       |

**Rules:**
- Sentence case everywhere. Never Title Case, never ALL CAPS.
- Two weights only: 400 and 500. Never 600 or 700.
- No mid-sentence bolding.

---

## 4. Layout

### 4.1 Page structure

```
┌─────────────────────────────────────────────────┐
│ Top bar:  brand · nav                           │  ← border-bottom 0.5px
├─────────────────────────────────────────────────┤
│ Hero:     h1 + description                      │
├─────────────────────────────────────────────────┤
│ Legend:   5 swatches with category names        │  ← bg secondary, rounded
├─────────────────────────────────────────────────┤
│ Project grid (2 columns, 12px gap)              │
│   ┌──────────────┐  ┌──────────────┐            │
│   │ rail │ body  │  │ rail │ body  │            │
│   └──────────────┘  └──────────────┘            │
│   ┌──────────────┐  ┌──────────────┐            │
│   │ rail │ body  │  │ rail │ body  │            │
│   └──────────────┘  └──────────────┘            │
└─────────────────────────────────────────────────┘
```

### 4.2 Spacing scale

Use these values everywhere. Do not introduce new spacings.

| Token | Value | Use                                  |
|-------|-------|--------------------------------------|
| xs    | 4px   | Inline gaps inside pills             |
| sm    | 6px   | Tag gaps, dot-to-text gaps           |
| md    | 8px   | Component-internal vertical gaps     |
| lg    | 12px  | Grid gap, padding inside small areas |
| xl    | 16px  | Card body horizontal padding         |
| 2xl   | 1.25rem (20px) | Section vertical rhythm     |
| 3xl   | 1.5rem (24px)  | Major section spacing       |

### 4.3 Border radius

| Token                    | Value | Use                              |
|--------------------------|-------|----------------------------------|
| `--border-radius-md`     | 8px   | Legend bar, status pills, tags   |
| `--border-radius-lg`     | 12px  | Project cards                    |
| `999px`                  | —     | Filter pills (full pill shape)   |
| `2px` / `3px`            | —     | Color swatches in legend         |

### 4.4 Borders

- Default: `0.5px solid var(--color-border-tertiary)`
- Hover (cards): `0.5px solid var(--color-border-secondary)` — a slightly darker neutral
- Featured/recommended cards (rare): `2px solid var(--color-border-info)` — only if you're highlighting one card. Do not use for normal states.

### 4.5 Responsive

- ≥ 720px: 2-column card grid
- < 720px: 1-column card grid; rail width can drop to 28px; hero stacks naturally

---

## 5. Components

### 5.1 Top bar

Brand on the left, nav on the right. Border-bottom on the wrapper, not the elements.

- `padding-bottom: 1.25rem`
- `border-bottom: 0.5px solid var(--color-border-tertiary)`
- `margin-bottom: 1.25rem`
- Brand: name + mono subtitle inline, gap 10px, `align-items: baseline`
- Nav: 4 links, gap 20px, secondary text color

### 5.2 Hero

A single block with H1 and a one-line description below it. Description max-width 460px; do not let it span the full grid.

```
The lab
Things I've shipped, broken, and learned from while teaching myself AI.
Color-coded by category — status is the small pill on the right.
```

### 5.3 Category legend

A horizontal bar that names the 5 categories with their swatches. This is the visual key to the entire page; do not omit it.

- `padding: 10px 12px`
- `background: var(--color-background-secondary)`
- `border-radius: var(--border-radius-md)`
- `margin-bottom: 1.25rem`
- Items: swatch (10×10, 2px radius) + mono label, gap 6px between swatch and label, gap 14px between items

### 5.4 Project card

The reusable unit. Two-column grid: a 36px colored rail on the left, the body on the right. The card itself has a 0.5px border and 12px radius; `overflow: hidden` so the rail clips cleanly.

Required fields per card:
- `category` (one of the 5 enum values) → drives rail color and tag colors
- `status` (one of the 5 enum values) → drives status dot color
- `id` (string, e.g. `#01`) → mono, tertiary, top right
- `title` (string)
- `description` (string, ~1–2 sentences)
- `stack` (array of strings, 2–4 items recommended)
- `updated` (string, e.g. `updated 2d ago` or `apr 2026`)
- `links` (array of `{label, url}`, 1–3 items, label includes `↗`)

### 5.5 Rail

A vertical colored strip running the full height of the card with the category name in vertical mono text.

- `width: 36px`
- Background: category rail color
- Inside: span with `writing-mode: vertical-rl; transform: rotate(180deg)`
- Label color: category rail-label color (light tint of same family)
- Letter-spacing: 0.12em
- Centered both axes

The rotation produces a label that reads bottom-to-top. This is intentional — it matches the way magazine spine labels are read and reinforces the "library card" feeling.

### 5.6 Status pill

```
[ • active ]
```

- `display: inline-flex; align-items: center; gap: 5px`
- `padding: 3px 7px`
- `border-radius: var(--border-radius-md)`
- `border: 0.5px solid var(--color-border-tertiary)`
- `color: var(--color-text-secondary)`
- `font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.04em`
- Dot: 6×6 circle, 50% radius, color from status palette
- For `archived` status: wrap the entire pill in `opacity: 0.7`

### 5.7 Tech stack tag

```
[ MCP ]
```

- Background: category tag bg
- Color: category tag text
- `padding: 2px 7px`
- `border-radius: 3px`
- `font-family: var(--font-mono); font-size: 10px`
- Gap between tags: 6px
- Wrap freely; do not truncate

The tags inherit category color so each card reads as a single chromatic family.

### 5.8 Card footer

A horizontal row separated from the body by a 0.5px top border, padding-top 10px.

- Left: `updated 2d ago` or `apr 2026` — mono 10px, tertiary
- Right: 1–3 links with sans 12px, secondary color, gap 10px between links, each ending in `↗`

---

## 6. State and interaction

### 6.1 Hover

- Card: border becomes `var(--color-border-secondary)`. No transform, no shadow.
- Link: underline appears (`text-decoration: underline; text-underline-offset: 2px`)
- Filter pill: background becomes `var(--color-background-secondary)`

### 6.2 Active filter pill

The currently-selected pill flips to a saturated state:
- `background: var(--color-text-primary)` (or the brand accent if you prefer color)
- `color: var(--color-background-primary)`
- `border-color: var(--color-text-primary)`

### 6.3 Focus

Inputs and interactive elements: `box-shadow: 0 0 0 2px var(--color-border-info)` on focus-visible. This is the only place box-shadow is permitted.

---

## 7. Dark mode

The system inherits dark mode automatically through CSS variables for neutrals. The category and status palettes are the same hex values in both modes — saturated colors read fine on either light or dark page backgrounds because they sit inside their own self-contained chips and rails.

Mental check before merging any new component: if the page background were near-black, would every text element still be readable? If you've added a hardcoded color outside the documented palette, the answer is probably no.

---

## 8. Reference implementation

Drop-in HTML for one project card. Adapt to your component library — the values matter, the markup structure is illustrative.

```html
<style>
.lab-card { background: var(--color-background-primary); border: 0.5px solid var(--color-border-tertiary); border-radius: var(--border-radius-lg); display: grid; grid-template-columns: 36px 1fr; overflow: hidden; }
.lab-rail { display: flex; align-items: center; justify-content: center; padding: 8px 0; }
.lab-rail-label { font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.12em; writing-mode: vertical-rl; transform: rotate(180deg); font-weight: 500; }
.lab-body { padding: 14px 16px; display: flex; flex-direction: column; min-width: 0; }
.lab-head { margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center; }
.lab-status { font-family: var(--font-mono); font-size: 10px; padding: 3px 7px; border-radius: var(--border-radius-md); letter-spacing: 0.04em; color: var(--color-text-secondary); border: 0.5px solid var(--color-border-tertiary); display: inline-flex; align-items: center; gap: 5px; }
.lab-pulse { display: inline-block; width: 6px; height: 6px; border-radius: 50%; }
.lab-id { font-family: var(--font-mono); font-size: 10px; color: var(--color-text-tertiary); }
.lab-title { font-size: 15px; font-weight: 500; margin: 0 0 4px; line-height: 1.3; }
.lab-dek { font-size: 13px; color: var(--color-text-secondary); margin: 0 0 12px; line-height: 1.5; flex: 1; }
.lab-stack { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 12px; }
.lab-tag { font-family: var(--font-mono); font-size: 10px; padding: 2px 7px; border-radius: 3px; }
.lab-foot { display: flex; justify-content: space-between; align-items: center; padding-top: 10px; border-top: 0.5px solid var(--color-border-tertiary); font-family: var(--font-mono); font-size: 10px; color: var(--color-text-tertiary); }
.lab-link { color: var(--color-text-secondary); margin-left: 10px; font-size: 12px; font-family: var(--font-sans); }
</style>

<article class="lab-card">
  <div class="lab-rail" style="background: #1D9E75;">
    <span class="lab-rail-label" style="color: #E1F5EE;">MCP</span>
  </div>
  <div class="lab-body">
    <header class="lab-head">
      <span class="lab-status">
        <span class="lab-pulse" style="background: #1D9E75;"></span>active
      </span>
      <span class="lab-id">#01</span>
    </header>
    <h3 class="lab-title">HealthPulse AI</h3>
    <p class="lab-dek">Healthcare performance MCP server. Hackathon entry, now an ongoing build.</p>
    <div class="lab-stack">
      <span class="lab-tag" style="background: #E1F5EE; color: #04342C;">MCP</span>
      <span class="lab-tag" style="background: #E1F5EE; color: #04342C;">node</span>
      <span class="lab-tag" style="background: #E1F5EE; color: #04342C;">claude</span>
    </div>
    <footer class="lab-foot">
      <span>updated 2d ago</span>
      <span>
        <a class="lab-link" href="...">live ↗</a>
        <a class="lab-link" href="...">repo ↗</a>
      </span>
    </footer>
  </div>
</article>
```

---

## 9. Suggested data shape

For when you wire this up to a CMS or markdown frontmatter:

```ts
type Category = "agents" | "mcp" | "product" | "research" | "tooling";
type Status = "active" | "in progress" | "shipped" | "experiment" | "archived";

interface Project {
  id: string;            // "#01"
  title: string;
  description: string;
  category: Category;
  status: Status;
  stack: string[];       // ["MCP", "node", "claude"]
  updated: string;       // "2d ago" or "apr 2026"
  links: { label: string; url: string }[];
}
```

Derive rail color, tag color, and status dot color from the category and status enum values via a lookup table. Do not let editors pass raw hex — that's how palettes drift.

---

## 10. Things to avoid

- Cycling through colors as decoration. Color must encode either the category enum or the status dot. Nothing else gets a saturated color.
- Multiple status pills per card. One status, period.
- Adding a card without a category. The grid is meaningless without it.
- Title Case, ALL CAPS, or 600/700 weights anywhere.
- Drop shadows, gradients, glows, blur effects.
- Rounded corners on single-sided borders. If you ever use `border-left` for an accent, set `border-radius: 0` on that side.
- Letting tag count grow past 4 per card. If a project genuinely uses more, pick the 3–4 most distinctive.
