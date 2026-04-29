import type {
  Category,
  EnrichedProjectEntry,
  Status,
} from './enrichment-types';

export type SortMode = 'id' | 'updated' | 'stars';

export const CATEGORY_KEYS: ReadonlyArray<Category> = [
  'agents',
  'mcp',
  'product',
  'research',
  'tooling',
];

export const STATUS_KEYS: ReadonlyArray<Status> = [
  'active',
  'in progress',
  'shipped',
  'experiment',
  'archived',
];

export function parseFilter(raw: string | undefined): 'all' | Category {
  if (raw && (CATEGORY_KEYS as ReadonlyArray<string>).includes(raw)) return raw as Category;
  return 'all';
}

export function parseStatus(raw: string | undefined): 'all' | Status {
  if (raw && (STATUS_KEYS as ReadonlyArray<string>).includes(raw)) return raw as Status;
  return 'all';
}

export function parseSort(raw: string | undefined): SortMode {
  if (raw === 'updated' || raw === 'stars') return raw;
  return 'id';
}

const TOKEN_SPLIT = /[\s,]+/;

export function searchEntries(
  entries: EnrichedProjectEntry[],
  q: string,
): EnrichedProjectEntry[] {
  const tokens = q.trim().toLowerCase().split(TOKEN_SPLIT).filter(Boolean);
  if (tokens.length === 0) return entries;

  return entries.filter((e) => {
    const haystack = [
      e.name,
      e.tagline,
      e.summary,
      e.category,
      e.status,
      ...e.stack,
      ...(e.links.hackathon?.map((h) => h.name) ?? []),
    ]
      .join(' ')
      .toLowerCase();
    return tokens.every((t) => haystack.includes(t));
  });
}

export function sortEntries(
  entries: EnrichedProjectEntry[],
  mode: SortMode,
): EnrichedProjectEntry[] {
  const out = [...entries];
  if (mode === 'updated') {
    return out.sort((a, b) => a.enriched.activityScore - b.enriched.activityScore);
  }
  if (mode === 'stars') {
    return out.sort(
      (a, b) => (b.enriched.github?.stars ?? 0) - (a.enriched.github?.stars ?? 0),
    );
  }
  // 'id' — manual order field wins; otherwise sequential id
  return out.sort((a, b) => {
    if (a.order !== undefined && b.order !== undefined) return a.order - b.order;
    if (a.order !== undefined) return -1;
    if (b.order !== undefined) return 1;
    const aNum = parseInt(a.id.replace('#', ''), 10);
    const bNum = parseInt(b.id.replace('#', ''), 10);
    return aNum - bNum;
  });
}

export function buildQuery(
  current: { q: string; filter: 'all' | Category; status: 'all' | Status; sort: SortMode },
  overrides: Record<string, string | undefined>,
): string {
  const params = new URLSearchParams();
  const next = {
    q: 'q' in overrides ? overrides.q : current.q,
    filter: 'filter' in overrides ? overrides.filter : current.filter !== 'all' ? current.filter : undefined,
    status: 'status' in overrides ? overrides.status : current.status !== 'all' ? current.status : undefined,
    sort: 'sort' in overrides ? overrides.sort : current.sort !== 'id' ? current.sort : undefined,
  };
  for (const [k, v] of Object.entries(next)) {
    if (v) params.set(k, v);
  }
  const qs = params.toString();
  return qs ? `/?${qs}` : '/';
}
