import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  computeActivityScore,
  deriveUpdated,
  formatMonthYear,
  formatRelative,
} from '@/scripts/enrich-projects';

describe('formatRelative', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-26T00:00:00Z'));
  });

  it('formats ages in d/w/mo/y', () => {
    expect(formatRelative('2026-04-23T00:00:00Z')).toBe('3d ago');
    expect(formatRelative('2026-04-12T00:00:00Z')).toBe('2w ago');
    expect(formatRelative('2026-01-26T00:00:00Z')).toBe('3mo ago');
    expect(formatRelative('2024-04-26T00:00:00Z')).toBe('2y ago');
  });
});

describe('formatMonthYear', () => {
  it('renders an ISO date as lowercase "MMM YYYY"', () => {
    expect(formatMonthYear('2026-04-26T00:00:00Z')).toBe('apr 2026');
    expect(formatMonthYear('2025-12-01T00:00:00Z')).toBe('dec 2025');
  });
});

describe('computeActivityScore', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-26T00:00:00Z'));
  });

  it('uses the most recent of github + vercel timestamps', () => {
    expect(
      computeActivityScore({
        github: { lastCommitAt: '2026-04-20T00:00:00Z' },
        vercel: { lastDeploymentAt: '2026-04-25T00:00:00Z' },
      }),
    ).toBe(1);
  });

  it('returns +Infinity-ish for entries with no signals', () => {
    expect(computeActivityScore({})).toBeGreaterThan(99_999);
  });
});

describe('deriveUpdated', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-26T00:00:00Z'));
  });

  it('falls back to the static "updated" string when no enrichment is available', () => {
    expect(deriveUpdated('apr 2026', undefined, undefined)).toBe('apr 2026');
  });

  it('formats recent github lastCommit as "Nd ago"', () => {
    expect(deriveUpdated('apr 2026', { lastCommitAt: '2026-04-23T00:00:00Z' }, undefined)).toBe(
      '3d ago',
    );
  });

  it('formats older github lastCommit as "MMM YYYY"', () => {
    expect(deriveUpdated('apr 2026', { lastCommitAt: '2026-01-26T00:00:00Z' }, undefined)).toBe(
      'jan 2026',
    );
  });
});
