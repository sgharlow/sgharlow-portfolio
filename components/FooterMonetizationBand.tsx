import type { ReactElement } from 'react';
import Link from 'next/link';
import type { EnrichedProjectEntry } from '@/lib/enrichment-types';
import { HeroImage } from './HeroImage';
import { appendUtm } from '@/lib/links';

interface Props {
  entries: EnrichedProjectEntry[];
}

function ProductRow({ title, items }: { title: string; items: EnrichedProjectEntry[] }): ReactElement | null {
  if (items.length === 0) return null;
  return (
    <div className="mb-6">
      <h2 className="font-mono text-xs uppercase text-white/50 mb-3">{title}</h2>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {items.map((entry) => {
          const product = entry.links.products?.[0];
          const href = product
            ? appendUtm(product.url, { medium: 'footer-band', campaign: entry.slug })
            : `/projects/${entry.slug}`;
          const label = product?.label ?? 'Coming soon';
          return (
            <Link
              key={entry.slug}
              href={href}
              target={product ? '_blank' : undefined}
              rel={product ? 'noreferrer' : undefined}
              className="block w-40 flex-shrink-0 hover:opacity-80"
            >
              <div className="w-40">
                <HeroImage slug={entry.slug} name={entry.name} heroImage={entry.heroImage} />
              </div>
              <div className="text-sm text-white mt-2">{entry.name}</div>
              <div className="text-xs text-white/60">{label} →</div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function FooterMonetizationBand({ entries }: Props): ReactElement {
  const products = entries.filter((e) => e.category === 'product');
  const books = products.filter((e) => e.kind === 'book');
  const others = products.filter((e) => e.kind !== 'book');

  return (
    <footer className="border-t border-white/10 bg-black/30 mt-16">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <ProductRow title="Books I've written" items={books} />
        <ProductRow title="Other products" items={others} />
        <div className="pt-6 border-t border-white/10 text-xs text-white/40 flex gap-4">
          <span>© {new Date().getFullYear()} sgharlow</span>
          <Link href="/sitemap.xml" className="hover:text-white/70">Sitemap</Link>
        </div>
      </div>
    </footer>
  );
}
