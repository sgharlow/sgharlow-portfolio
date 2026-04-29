import type { Metadata } from 'next';
import { loadEnrichedProjectsFile } from '@/lib/projects';
import { SpectrumCard } from '@/components/SpectrumCard';
import { CategoryLegend } from '@/components/CategoryLegend';
import { HeroBlock } from '@/components/HeroBlock';
import { Toolbar } from '@/components/Toolbar';
import {
  buildQuery,
  parseFilter,
  parseSort,
  parseStatus,
  searchEntries,
  sortEntries,
} from '@/lib/grid-filters';

export const revalidate = 21600;

export const metadata: Metadata = {
  title: 'the lab — sgharlow',
};

interface PageProps {
  searchParams: Promise<{ q?: string; filter?: string; status?: string; sort?: string }>;
}

export default async function HomePage({ searchParams }: PageProps) {
  const file = await loadEnrichedProjectsFile();
  const params = await searchParams;

  const q = (params.q ?? '').trim();
  const filter = parseFilter(params.filter);
  const status = parseStatus(params.status);
  const sort = parseSort(params.sort);

  const sorted = sortEntries(file.entries, sort);
  const byCategory = filter === 'all' ? sorted : sorted.filter((e) => e.category === filter);
  const byStatus = status === 'all' ? byCategory : byCategory.filter((e) => e.status === status);
  const filtered = searchEntries(byStatus, q);

  const baseQuery = (overrides: Record<string, string | undefined>) =>
    buildQuery({ q, filter, status, sort }, overrides);

  return (
    <main>
      <HeroBlock />
      <CategoryLegend />
      <Toolbar q={q} filter={filter} status={status} sort={sort} baseQuery={baseQuery} />

      {filtered.length === 0 ? (
        <p
          className="text-[13px] py-8 text-center font-mono"
          style={{ color: 'var(--color-text-tertiary)' }}
        >
          No projects match. {q && <>Try a different search.</>}
        </p>
      ) : (
        <>
          <div
            className="font-mono text-[10px] mb-3"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            {filtered.length} of {file.entries.length} projects
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {filtered.map((entry) => (
              <SpectrumCard key={entry.slug} entry={entry} />
            ))}
          </div>
        </>
      )}
    </main>
  );
}
