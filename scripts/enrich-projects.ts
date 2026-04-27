// Stub for the build-time enrichment pipeline.
// Plan task T14 replaces the body with the real GitHub + Vercel API enrichment.
// Until then this stub keeps `npm run build` working: it mirrors data/projects.json
// to data/projects.enriched.json with placeholder enriched blocks, or no-ops if
// data/projects.json doesn't exist yet (created in plan T9).

import fs from 'node:fs/promises';
import path from 'node:path';

async function main(): Promise<void> {
  const inPath = path.join(process.cwd(), 'data', 'projects.json');
  const outPath = path.join(process.cwd(), 'data', 'projects.enriched.json');

  let raw: string;
  try {
    raw = await fs.readFile(inPath, 'utf-8');
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
      console.warn('[enrich:stub] data/projects.json not found; skipping (created in plan T9)');
      return;
    }
    throw err;
  }

  const data = JSON.parse(raw) as { entries: Array<Record<string, unknown>> };
  const enriched = {
    ...data,
    generatedAt: new Date().toISOString(),
    entries: data.entries.map((e) => ({
      ...e,
      enriched: { derivedStatus: 'pending', activityScore: Number.MAX_SAFE_INTEGER },
    })),
  };

  await fs.mkdir(path.dirname(outPath), { recursive: true });
  await fs.writeFile(outPath, JSON.stringify(enriched, null, 2), 'utf-8');
  console.log(`[enrich:stub] wrote ${enriched.entries.length} entries to ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
