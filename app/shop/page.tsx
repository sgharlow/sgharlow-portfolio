import type { Metadata } from 'next';
import Link from 'next/link';
import { loadEnrichedProjectsFile } from '@/lib/projects';
import { HeroImage } from '@/components/HeroImage';
import { appendUtm } from '@/lib/links';

export const revalidate = 21600;

export const metadata: Metadata = {
  title: 'Shop — sgharlow',
  description: 'Books and products by sgharlow.',
};

export default async function ShopPage() {
  const file = await loadEnrichedProjectsFile();
  const products = file.entries.filter((e) => e.category === 'product');

  return (
    <main className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="font-display text-3xl text-white mb-6">Shop</h1>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((entry) => {
          const p = entry.links.products?.[0];
          const href = p ? appendUtm(p.url, { medium: 'shop', campaign: entry.slug }) : `/projects/${entry.slug}`;
          return (
            <Link
              key={entry.slug}
              href={href}
              target={p ? '_blank' : undefined}
              rel={p ? 'noreferrer' : undefined}
              className="block hover:opacity-90"
            >
              <HeroImage slug={entry.slug} name={entry.name} heroImage={entry.heroImage} />
              <div className="mt-3">
                <h2 className="font-display text-base text-white">{entry.name}</h2>
                <p className="text-sm text-white/70">{entry.tagline}</p>
                <p className="text-xs text-white/50 mt-1">{p?.label ?? 'Coming soon'} →</p>
              </div>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
