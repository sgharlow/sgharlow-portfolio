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
