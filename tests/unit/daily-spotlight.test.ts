import { describe, it, expect } from 'vitest';
import { selectSpotlightPool, getTodaysSpotlight } from '@/lib/daily-spotlight';
import type { EnrichedProjectEntry, EnrichedProjectsFile } from '@/lib/enrichment-types';

function entry(slug: string, category: EnrichedProjectEntry['category']): EnrichedProjectEntry {
  return {
    slug, name: slug, tagline: 't', summary: 's',
    category, kind: 'web-app', heroImage: null, heroImagePrompt: '',
    links: {},
    enriched: { derivedStatus: 'x', activityScore: 0 },
  };
}

function file(entries: EnrichedProjectEntry[], launch = '2026-04-26'): EnrichedProjectsFile {
  return { version: 1, generatedAt: '2026-04-26T00:00:00Z', spotlightLaunchDate: launch, entries };
}

describe('selectSpotlightPool', () => {
  it('includes only active and frozen entries, sorted by slug', () => {
    const entries = [
      entry('zebra', 'active'),
      entry('apple', 'experiment'),
      entry('mango', 'frozen'),
      entry('banana', 'active'),
      entry('book', 'product'),
    ];
    const pool = selectSpotlightPool(entries);
    expect(pool.map((e) => e.slug)).toEqual(['banana', 'mango', 'zebra']);
  });

  it('returns empty array when no eligible entries', () => {
    expect(selectSpotlightPool([entry('a', 'experiment'), entry('b', 'product')])).toEqual([]);
  });
});

describe('getTodaysSpotlight', () => {
  const pool = [entry('alpha', 'active'), entry('bravo', 'frozen'), entry('charlie', 'active')];

  it('rotates deterministically by day', () => {
    const f = file(pool);
    expect(getTodaysSpotlight(f, new Date('2026-04-26T12:00:00Z')).slug).toBe('alpha');
    expect(getTodaysSpotlight(f, new Date('2026-04-27T12:00:00Z')).slug).toBe('bravo');
    expect(getTodaysSpotlight(f, new Date('2026-04-28T12:00:00Z')).slug).toBe('charlie');
    expect(getTodaysSpotlight(f, new Date('2026-04-29T12:00:00Z')).slug).toBe('alpha');
  });

  it('honors per-day overrides', () => {
    const overridden = [...pool];
    overridden[2] = { ...overridden[2], spotlight: { longDescription: '', overrideDates: ['2026-04-26'] } };
    const f = file(overridden);
    expect(getTodaysSpotlight(f, new Date('2026-04-26T00:00:00Z')).slug).toBe('charlie');
  });

  it('handles dates before launch without crashing', () => {
    const f = file(pool, '2026-04-26');
    const result = getTodaysSpotlight(f, new Date('2026-04-20T12:00:00Z'));
    expect(['alpha', 'bravo', 'charlie']).toContain(result.slug);
  });

  it('throws when pool is empty', () => {
    const f = file([entry('only-experiment', 'experiment')]);
    expect(() => getTodaysSpotlight(f, new Date('2026-04-26'))).toThrow(/empty/i);
  });

  it('returns the single entry consistently when pool size is 1', () => {
    const f = file([entry('lonely', 'active')]);
    for (let d = 0; d < 30; d++) {
      const date = new Date(`2026-04-${String(26 + (d % 4)).padStart(2, '0')}T12:00:00Z`);
      expect(getTodaysSpotlight(f, date).slug).toBe('lonely');
    }
  });

  it('produces a stable 30-day snapshot for a fixture pool', () => {
    const fivePool = [
      entry('aardvark', 'active'),
      entry('beaver', 'frozen'),
      entry('coyote', 'active'),
      entry('dingo', 'frozen'),
      entry('emu', 'active'),
    ];
    const f = file(fivePool, '2026-04-26');
    const slugs: string[] = [];
    for (let d = 0; d < 30; d++) {
      const date = new Date(Date.UTC(2026, 3, 26 + d, 12));
      slugs.push(getTodaysSpotlight(f, date).slug);
    }
    expect(slugs).toEqual([
      'aardvark', 'beaver', 'coyote', 'dingo', 'emu',
      'aardvark', 'beaver', 'coyote', 'dingo', 'emu',
      'aardvark', 'beaver', 'coyote', 'dingo', 'emu',
      'aardvark', 'beaver', 'coyote', 'dingo', 'emu',
      'aardvark', 'beaver', 'coyote', 'dingo', 'emu',
      'aardvark', 'beaver', 'coyote', 'dingo', 'emu',
    ]);
  });
});
