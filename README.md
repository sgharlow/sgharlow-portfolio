# sgharlow-portfolio

Personal portfolio at https://portfolio.learningai365.com — deployed standalone via Vercel,
reachable from the affiliate site at https://www.learningai365.com via a top-nav "Portfolio"
link. The two sites are independent at the edge; the subdomain is a same-property bridge for
discovery, not a path-mount.

See `/spectrum-lab-design.md` for the v1 layout spec. The 2026-04-26 cutover spec at
`docs/superpowers/specs/2026-04-26-learningai365-pivot-design.md` was abandoned 2026-05-01
in favor of the subdomain plan; that file's top-of-doc addendum has the full context.

## Local dev

```bash
cp .env.example .env.local
# fill in GH_TOKEN, VERCEL_TOKEN, VERCEL_TEAM_ID
npm install
npm run dev
```

## Build

```bash
npm run build  # runs prebuild enrichment first
```

## Test

```bash
npm test          # unit
npm run test:e2e  # playwright
```
