import type { Metadata } from 'next';
import Link from 'next/link';
import { loadEnrichedProjectsFile } from '@/lib/projects';
import { SpectrumCard } from '@/components/SpectrumCard';
import { CategoryLegend } from '@/components/CategoryLegend';
import { HeroBlock } from '@/components/HeroBlock';
import type { Category, EnrichedProjectEntry } from '@/lib/enrichment-types';

export const revalidate = 21600;

export const metadata: Metadata = {
  title: 'the lab — sgharlow',
};

const FILTERS: Array<{ key: 'all' | Category; label: string }> = [
  { key: 'all', label: 'all' },
  { key: 'agents', label: 'agents' },
  { key: 'mcp', label: 'mcp' },
  { key: 'product', label: 'product' },
  { key: 'research', label: 'research' },
  { key: 'tooling', label: 'tooling' },
];

interface PageProps {
  searchParams: Promise<{ filter?: string }>;
}

export default async function HomePage({ searchParams }: PageProps) {
  const file = await loadEnrichedProjectsFile();
  const { filter = 'all' } = await searchParams;

  const sorted: EnrichedProjectEntry[] = [...file.entries].sort((a, b) => {
    if (a.order !== undefined && b.order !== undefined) return a.order - b.order;
    if (a.order !== undefined) return -1;
    if (b.order !== undefined) return 1;
    // default: by id (which is sequential by category-then-slug)
    const aNum = parseInt(a.id.replace('#', ''), 10);
    const bNum = parseInt(b.id.replace('#', ''), 10);
    return aNum - bNum;
  });

  const filtered = filter === 'all' ? sorted : sorted.filter((e) => e.category === filter);

  return (
    <main>
      <HeroBlock />
      <CategoryLegend />

      <div className="flex flex-wrap gap-2 mb-5">
        {FILTERS.map((f) => {
          const active = filter === f.key;
          return (
            <Link
              key={f.key}
              href={f.key === 'all' ? '/' : `/?filter=${f.key}`}
              className="px-3 py-1 text-[12px] font-mono"
              style={{
                borderRadius: 999,
                border: '0.5px solid var(--color-border-tertiary)',
                background: active ? 'var(--color-text-primary)' : 'transparent',
                color: active ? 'var(--color-background-primary)' : 'var(--color-text-secondary)',
                borderColor: active ? 'var(--color-text-primary)' : 'var(--color-border-tertiary)',
              }}
            >
              {f.label}
            </Link>
          );
        })}
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        {filtered.map((entry) => (
          <SpectrumCard key={entry.slug} entry={entry} />
        ))}
      </div>
    </main>
  );
}
