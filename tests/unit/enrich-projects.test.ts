import { describe, it, expect, vi, beforeEach } from 'vitest';
import { deriveStatus, computeActivityScore, formatRelative } from '@/scripts/enrich-projects';

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

describe('deriveStatus', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-26T00:00:00Z'));
  });

  it('honors statusOverride first', () => {
    expect(deriveStatus('active', 'Custom override', undefined, undefined)).toBe('Custom override');
  });

  it('formats from github lastCommit when no override', () => {
    expect(
      deriveStatus('active', undefined, { lastCommitAt: '2026-04-23T00:00:00Z' }, undefined),
    ).toBe('Active — last commit 3d ago');
  });

  it('falls back to category-only string when no enrichment', () => {
    expect(deriveStatus('frozen', undefined, undefined, undefined)).toBe('Frozen / archived');
    expect(deriveStatus('experiment', undefined, undefined, undefined)).toBe('Experiment');
    expect(deriveStatus('product', undefined, undefined, undefined)).toBe('Product');
  });
});
