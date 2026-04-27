import type { Metadata } from 'next';
import { loadEnrichedProjectsFile } from '@/lib/projects';
import { ProjectCard } from '@/components/ProjectCard';
import type { Category, EnrichedProjectEntry } from '@/lib/enrichment-types';
import Link from 'next/link';

export const revalidate = 21600;

export const metadata: Metadata = {
  title: 'All projects — sgharlow',
};

const FILTERS: Array<{ key: 'all' | Category; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'frozen', label: 'Frozen' },
  { key: 'experiment', label: 'Experiments' },
  { key: 'product', label: 'Products' },
];

interface PageProps {
  searchParams: Promise<{ filter?: string }>;
}

export default async function GridPage({ searchParams }: PageProps) {
  const file = await loadEnrichedProjectsFile();
  const { filter = 'all' } = await searchParams;

  const entries: EnrichedProjectEntry[] = [...file.entries].sort((a, b) => {
    if (a.order !== undefined && b.order !== undefined) return a.order - b.order;
    if (a.order !== undefined) return -1;
    if (b.order !== undefined) return 1;
    return a.enriched.activityScore - b.enriched.activityScore;
  });

  const filtered = filter === 'all' ? entries : entries.filter((e) => e.category === filter);

  return (
    <main className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="font-display text-3xl text-white mb-6">All projects</h1>

      <div className="flex flex-wrap gap-2 mb-8">
        {FILTERS.map((f) => (
          <Link
            key={f.key}
            href={f.key === 'all' ? '/grid' : `/grid?filter=${f.key}`}
            className={`px-3 py-1 rounded-full text-sm border ${
              filter === f.key
                ? 'bg-white/10 border-white/40 text-white'
                : 'border-white/15 text-white/60 hover:text-white'
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map((entry) => <ProjectCard key={entry.slug} entry={entry} />)}
      </div>
    </main>
  );
}
