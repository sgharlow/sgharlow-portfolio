import { describe, it, expect } from 'vitest';
import nextConfig from '../../next.config';

const TRAINING = 'https://training.learningai365.com';

async function getRedirects() {
  if (typeof nextConfig.redirects !== 'function') {
    throw new Error('redirects() not defined on next.config');
  }
  return nextConfig.redirects();
}

describe('Phase 6 catch-all redirects → training.learningai365.com', () => {
  it('exposes the 14 source routes from the pivot spec', async () => {
    const redirects = await getRedirects();
    const sources = redirects.map((r) => r.source).sort();
    expect(sources).toEqual([
      '/about',
      '/categories/:slug*',
      '/courses/:slug*',
      '/daily-specials/:slug*',
      '/faq',
      '/paths/:slug*',
      '/privacy',
      '/providers/:slug*',
      '/quiz',
      '/quiz/:path*',
      '/skills/:slug*',
      '/terms',
      '/topics/:slug*',
      '/use-cases/:slug*',
    ]);
  });

  it('points every destination at training.learningai365.com', async () => {
    const redirects = await getRedirects();
    for (const r of redirects) {
      expect(r.destination.startsWith(TRAINING + '/')).toBe(true);
    }
  });

  it('preserves slug/path placeholders end-to-end', async () => {
    const redirects = await getRedirects();
    for (const r of redirects) {
      const slugMatch = r.source.match(/(:[a-zA-Z]+\*?)/g);
      if (slugMatch) {
        for (const placeholder of slugMatch) {
          expect(r.destination).toContain(placeholder);
        }
      }
    }
  });

  it('marks every redirect permanent', async () => {
    const redirects = await getRedirects();
    for (const r of redirects) {
      expect(r.permanent).toBe(true);
    }
  });
});
