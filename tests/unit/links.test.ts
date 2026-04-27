import { describe, it, expect } from 'vitest';
import { appendUtm } from '@/lib/links';

describe('appendUtm', () => {
  it('appends utm params to a clean URL', () => {
    const out = appendUtm('https://example.com/page', { medium: 'hover-popup', campaign: 'health-pulse' });
    expect(out).toBe('https://example.com/page?utm_source=portfolio&utm_medium=hover-popup&utm_campaign=health-pulse');
  });

  it('preserves existing query params (Amazon affiliate tag)', () => {
    const out = appendUtm('https://amazon.com/dp/B0XXX?tag=sgharlow-20', {
      medium: 'footer-band', campaign: 'ender',
    });
    expect(out).toContain('tag=sgharlow-20');
    expect(out).toContain('utm_source=portfolio');
    expect(out).toContain('utm_medium=footer-band');
    expect(out).toContain('utm_campaign=ender');
  });

  it('returns the input unchanged for non-http URLs', () => {
    expect(appendUtm('mailto:x@y.com', { medium: 'hover-popup', campaign: 'x' })).toBe('mailto:x@y.com');
  });
});
