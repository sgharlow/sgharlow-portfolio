import type { EnrichedProjectEntry } from './enrichment-types';

export interface StackBucket {
  primitive: string;
  count: number;
  slugs: string[];
  group: 'ai' | 'lang' | 'cloud' | 'framework' | 'other';
}

const GROUPS: Array<{ pattern: RegExp; group: StackBucket['group']; label?: string }> = [
  { pattern: /^(agents?|llm|gpt|claude|openai|gemini|bedrock|anthropic|imagen|nano-banana)$/i, group: 'ai', label: undefined },
  { pattern: /^(mcp)$/i, group: 'ai' },
  { pattern: /^(rag|vector|pinecone|weaviate|qdrant|embedding|embeddings)$/i, group: 'ai' },
  { pattern: /^(typescript|javascript|python|go|rust|java)$/i, group: 'lang' },
  { pattern: /^(aws|gcp|azure|cloudflare|vercel|lambda|s3|dynamodb|rds|firebase|supabase)$/i, group: 'cloud' },
  { pattern: /^(next\.?js|react|vue|svelte|astro|fastapi|express|nest|django|flask)$/i, group: 'framework' },
];

function classify(label: string): StackBucket['group'] {
  for (const g of GROUPS) {
    if (g.pattern.test(label)) return g.group;
  }
  return 'other';
}

const GROUP_ORDER: ReadonlyArray<StackBucket['group']> = ['ai', 'framework', 'lang', 'cloud', 'other'];

export const GROUP_LABELS: Record<StackBucket['group'], string> = {
  ai: 'AI primitives',
  framework: 'Frameworks',
  lang: 'Languages',
  cloud: 'Cloud + infra',
  other: 'Other',
};

export function buildStackHeatmap(entries: EnrichedProjectEntry[]): StackBucket[] {
  const map = new Map<string, StackBucket>();
  for (const entry of entries) {
    const seen = new Set<string>();
    for (const tag of entry.stack) {
      const key = tag.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      const bucket = map.get(key) ?? { primitive: tag, count: 0, slugs: [], group: classify(tag) };
      bucket.count += 1;
      bucket.slugs.push(entry.slug);
      map.set(key, bucket);
    }
  }
  return [...map.values()].sort((a, b) => {
    const ag = GROUP_ORDER.indexOf(a.group);
    const bg = GROUP_ORDER.indexOf(b.group);
    if (ag !== bg) return ag - bg;
    if (b.count !== a.count) return b.count - a.count;
    return a.primitive.localeCompare(b.primitive);
  });
}

export function groupHeatmap(buckets: StackBucket[]): Array<{ group: StackBucket['group']; items: StackBucket[] }> {
  const out: Array<{ group: StackBucket['group']; items: StackBucket[] }> = [];
  for (const g of GROUP_ORDER) {
    const items = buckets.filter((b) => b.group === g);
    if (items.length > 0) out.push({ group: g, items });
  }
  return out;
}
