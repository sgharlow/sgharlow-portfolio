# sgharlow-portfolio

Personal AI-learning portfolio at https://www.learningai365.com.

See `docs/superpowers/specs/2026-04-26-learningai365-pivot-design.md` for design.

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
