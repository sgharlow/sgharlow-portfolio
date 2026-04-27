interface UtmParams {
  medium: 'hover-popup' | 'modal' | 'spotlight' | 'grid-card' | 'footer-band' | 'shop' | 'top-nav';
  campaign: string;
}

export function appendUtm(url: string, params: UtmParams): string {
  if (!/^https?:\/\//.test(url)) return url;
  const u = new URL(url);
  u.searchParams.set('utm_source', 'portfolio');
  u.searchParams.set('utm_medium', params.medium);
  u.searchParams.set('utm_campaign', params.campaign);
  return u.toString();
}
