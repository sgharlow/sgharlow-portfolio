import { describe, it, expect } from 'vitest';
import { buildStackHeatmap, groupHeatmap } from '../../lib/stack-heatmap';
import type { EnrichedProjectEntry } from '../../lib/enrichment-types';

function entry(slug: string, stack: string[]): EnrichedProjectEntry {
  return {
    slug,
    id: '#01',
    name: slug,
    tagline: '',
    summary: '',
    category: 'tooling',
    status: 'shipped',
    stack,
    updated: 'apr 2026',
    heroImage: null,
    heroImagePrompt: '',
    links: {},
    enriched: { derivedUpdated: '', activityScore: 0 },
  } as EnrichedProjectEntry;
}

describe('buildStackHeatmap', () => {
  it('aggregates counts and groups by AI/lang/cloud/framework/other', () => {
    const data = [
      entry('a', ['typescript', 'mcp', 'next.js']),
      entry('b', ['python', 'aws', 'agents']),
      entry('c', ['mcp', 'typescript']),
    ];
    const buckets = buildStackHeatmap(data);
    const byKey = Object.fromEntries(buckets.map((b) => [b.primitive, b]));

    expect(byKey['mcp'].count).toBe(2);
    expect(byKey['mcp'].group).toBe('ai');
    expect(byKey['agents'].group).toBe('ai');
    expect(byKey['typescript'].count).toBe(2);
    expect(byKey['typescript'].group).toBe('lang');
    expect(byKey['aws'].group).toBe('cloud');
    expect(byKey['next.js'].group).toBe('framework');
  });

  it('ignores duplicates within the same entry', () => {
    const data = [entry('a', ['mcp', 'mcp', 'MCP'])];
    const buckets = buildStackHeatmap(data);
    expect(buckets.find((b) => b.primitive.toLowerCase() === 'mcp')?.count).toBe(1);
  });

  it('orders AI primitives before everything else', () => {
    const data = [
      entry('a', ['mcp']),
      entry('b', ['typescript']),
      entry('c', ['next.js']),
      entry('d', ['aws']),
      entry('e', ['random-tag']),
    ];
    const buckets = buildStackHeatmap(data);
    expect(buckets[0].group).toBe('ai');
  });
});

describe('groupHeatmap', () => {
  it('returns groups in canonical order, skipping empty', () => {
    const data = [entry('a', ['typescript'])];
    const groups = groupHeatmap(buildStackHeatmap(data));
    expect(groups.map((g) => g.group)).toEqual(['lang']);
  });
});
