import { describe, it, expect } from 'vitest';
import {
  buildQuery,
  parseFilter,
  parseSort,
  parseStatus,
  searchEntries,
  sortEntries,
} from '../../lib/grid-filters';
import type { EnrichedProjectEntry } from '../../lib/enrichment-types';

function entry(overrides: Partial<EnrichedProjectEntry>): EnrichedProjectEntry {
  return {
    slug: 'x',
    id: '#01',
    name: 'X',
    tagline: '',
    summary: '',
    category: 'tooling',
    status: 'shipped',
    stack: [],
    updated: 'apr 2026',
    heroImage: null,
    heroImagePrompt: '',
    links: {},
    enriched: { derivedUpdated: 'apr 2026', activityScore: Number.MAX_SAFE_INTEGER },
    ...overrides,
  } as EnrichedProjectEntry;
}

describe('parseFilter / parseStatus / parseSort', () => {
  it('accepts known categories', () => {
    expect(parseFilter('agents')).toBe('agents');
    expect(parseFilter('mcp')).toBe('mcp');
  });
  it('rejects unknowns to "all"', () => {
    expect(parseFilter('nope')).toBe('all');
    expect(parseFilter(undefined)).toBe('all');
  });
  it('accepts known statuses incl. "in progress"', () => {
    expect(parseStatus('in progress')).toBe('in progress');
    expect(parseStatus('archived')).toBe('archived');
  });
  it('parseSort defaults to id', () => {
    expect(parseSort(undefined)).toBe('id');
    expect(parseSort('updated')).toBe('updated');
    expect(parseSort('stars')).toBe('stars');
    expect(parseSort('garbage')).toBe('id');
  });
});

describe('searchEntries', () => {
  const data: EnrichedProjectEntry[] = [
    entry({ slug: 'a', name: 'Health Pulse', tagline: 'incident triage', stack: ['mcp', 'typescript'] }),
    entry({ slug: 'b', name: 'AI PR Bot', tagline: 'auto-fix vulns', stack: ['python'] }),
    entry({
      slug: 'c',
      name: 'MigrateIQ',
      tagline: 'gitlab migration',
      links: { hackathon: [{ name: 'GitLab AI Hackathon', status: 'won', prize: '$65K' }] },
    } as Partial<EnrichedProjectEntry>),
  ];

  it('returns all when query is empty', () => {
    expect(searchEntries(data, '').length).toBe(3);
    expect(searchEntries(data, '   ').length).toBe(3);
  });
  it('matches by name', () => {
    expect(searchEntries(data, 'pulse').map((e) => e.slug)).toEqual(['a']);
  });
  it('matches by stack', () => {
    expect(searchEntries(data, 'python').map((e) => e.slug)).toEqual(['b']);
  });
  it('matches by hackathon name and prize text', () => {
    expect(searchEntries(data, 'gitlab').map((e) => e.slug)).toEqual(['c']);
  });
  it('multi-token AND-matching', () => {
    expect(searchEntries(data, 'auto vulns').map((e) => e.slug)).toEqual(['b']);
    expect(searchEntries(data, 'mcp python').length).toBe(0);
  });
});

describe('sortEntries', () => {
  const data: EnrichedProjectEntry[] = [
    entry({ slug: 'a', id: '#03', enriched: { derivedUpdated: '', activityScore: 5 } as never }),
    entry({ slug: 'b', id: '#01', enriched: { derivedUpdated: '', activityScore: 30 } as never }),
    entry({ slug: 'c', id: '#02', enriched: { derivedUpdated: '', activityScore: 1, github: { stars: 50 } } as never }),
  ];

  it('id mode = sequential by id number', () => {
    expect(sortEntries(data, 'id').map((e) => e.slug)).toEqual(['b', 'c', 'a']);
  });
  it('updated mode = lower activityScore first (fresher)', () => {
    expect(sortEntries(data, 'updated').map((e) => e.slug)).toEqual(['c', 'a', 'b']);
  });
  it('stars mode = higher star count first', () => {
    expect(sortEntries(data, 'stars').map((e) => e.slug)[0]).toBe('c');
  });
});

describe('buildQuery', () => {
  const base = { q: '', filter: 'all' as const, status: 'all' as const, sort: 'id' as const };
  it('returns / when nothing set', () => {
    expect(buildQuery(base, {})).toBe('/');
  });
  it('emits selected filter only', () => {
    expect(buildQuery(base, { filter: 'agents' })).toBe('/?filter=agents');
  });
  it('clears via undefined', () => {
    const cur = { ...base, filter: 'agents' as const };
    expect(buildQuery(cur, { filter: undefined })).toBe('/');
  });
  it('preserves untouched fields when overriding one', () => {
    const cur = { q: 'pulse', filter: 'mcp' as const, status: 'all' as const, sort: 'updated' as const };
    const got = buildQuery(cur, { filter: 'agents' });
    expect(got).toContain('q=pulse');
    expect(got).toContain('filter=agents');
    expect(got).toContain('sort=updated');
  });
});
