import type { Metadata } from 'next';
import Link from 'next/link';
import { loadEnrichedProjectsFile } from '@/lib/projects';
import { buildStackHeatmap, GROUP_LABELS, groupHeatmap } from '@/lib/stack-heatmap';
import type { Category } from '@/lib/enrichment-types';

export const revalidate = 21600;

export const metadata: Metadata = {
  title: 'about — sgharlow',
  description: 'About this portfolio and the AI primitives + stack behind it.',
};

const ACCENT: Record<Category, string> = {
  agents: '#534AB7',
  mcp: '#1D9E75',
  product: '#D85A30',
  research: '#D4537E',
  tooling: '#378ADD',
};

export default async function AboutPage() {
  const file = await loadEnrichedProjectsFile();
  const buckets = buildStackHeatmap(file.entries);
  const grouped = groupHeatmap(buckets);
  const totalProjects = file.entries.length;
  const byCategory = file.entries.reduce<Record<Category, number>>(
    (acc, e) => ({ ...acc, [e.category]: (acc[e.category] ?? 0) + 1 }),
    { agents: 0, mcp: 0, product: 0, research: 0, tooling: 0 },
  );
  const shipped = file.entries.filter((e) => e.status === 'shipped').length;
  const active = file.entries.filter((e) => e.status === 'active' || e.status === 'in progress').length;
  const hackathons = file.entries.flatMap((e) => e.links.hackathon ?? []).length;

  const maxCount = Math.max(...buckets.map((b) => b.count), 1);

  return (
    <main className="max-w-3xl">
      <Link
        href="/"
        className="font-mono text-[11px]"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        ← back to the lab
      </Link>

      <section className="mt-6 mb-10">
        <h1
          className="text-[28px] font-medium m-0"
          style={{ letterSpacing: '-0.01em' }}
        >
          About this lab
        </h1>
        <p
          className="text-[15px] m-0 mt-3 leading-[1.6]"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          I&apos;m sgharlow. This site is my open notebook of AI work — agents, MCP
          servers, products, research, and the tooling that makes the rest of it
          possible. Every card links to a real repo or a deployed surface, not a
          slide deck.
        </p>
        <p
          className="text-[15px] m-0 mt-4 leading-[1.6]"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          The category color is what kind of work it is; the small status pill is
          where it sits in its lifecycle. I sort by activity, so the front of the
          grid is whatever I touched most recently.
        </p>
      </section>

      <section className="mb-10">
        <h2
          className="text-[18px] font-medium m-0 mb-4"
          style={{ letterSpacing: '-0.005em' }}
        >
          By the numbers
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Stat label="projects" value={totalProjects} />
          <Stat label="shipped" value={shipped} />
          <Stat label="active" value={active} />
          <Stat label="hackathons" value={hackathons} />
        </div>
      </section>

      <section className="mb-10">
        <h2
          className="text-[18px] font-medium m-0 mb-4"
          style={{ letterSpacing: '-0.005em' }}
        >
          By category
        </h2>
        <div
          className="rounded-xl p-4"
          style={{
            background: 'var(--color-background-secondary)',
            border: '0.5px solid var(--color-border-tertiary)',
          }}
        >
          {(Object.entries(byCategory) as Array<[Category, number]>).map(([cat, count]) => {
            const pct = (count / totalProjects) * 100;
            return (
              <div key={cat} className="flex items-center gap-3 mb-2 last:mb-0">
                <Link
                  href={`/?filter=${cat}`}
                  className="font-mono text-[12px] hover:underline w-[70px] shrink-0"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  {cat}
                </Link>
                <div
                  className="flex-1 h-[8px] rounded-full overflow-hidden"
                  style={{ background: 'var(--color-background-primary)' }}
                >
                  <div
                    style={{
                      width: `${pct}%`,
                      height: '100%',
                      background: ACCENT[cat],
                    }}
                  />
                </div>
                <span
                  className="font-mono text-[11px] tabular-nums w-[28px] text-right"
                  style={{ color: 'var(--color-text-tertiary)' }}
                >
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mb-10">
        <h2
          className="text-[18px] font-medium m-0 mb-2"
          style={{ letterSpacing: '-0.005em' }}
        >
          Stack heat-map
        </h2>
        <p
          className="text-[13px] m-0 mb-5"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          Every tech tag aggregated across {totalProjects} projects. Bar length =
          count of projects using it. Click a primitive to filter the lab to
          projects that ship it.
        </p>

        {grouped.map(({ group, items }) => (
          <div key={group} className="mb-6">
            <h3
              className="font-mono text-[10px] mb-2 uppercase"
              style={{ color: 'var(--color-text-tertiary)', letterSpacing: '0.08em' }}
            >
              {GROUP_LABELS[group]}
            </h3>
            <div className="flex flex-col gap-1">
              {items.map((b) => {
                const pct = (b.count / maxCount) * 100;
                return (
                  <Link
                    key={b.primitive}
                    href={`/?q=${encodeURIComponent(b.primitive)}`}
                    className="flex items-center gap-3 py-1 hover:underline"
                    title={`${b.count} project${b.count === 1 ? '' : 's'} use ${b.primitive}`}
                  >
                    <span
                      className="font-mono text-[12px] w-[140px] shrink-0 truncate"
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
                      {b.primitive}
                    </span>
                    <div
                      className="flex-1 h-[6px] rounded-full overflow-hidden"
                      style={{ background: 'var(--color-background-secondary)' }}
                    >
                      <div
                        style={{
                          width: `${pct}%`,
                          height: '100%',
                          background:
                            group === 'ai'
                              ? '#534AB7'
                              : group === 'framework'
                                ? '#1D9E75'
                                : group === 'lang'
                                  ? '#D85A30'
                                  : group === 'cloud'
                                    ? '#378ADD'
                                    : '#888780',
                          opacity: 0.85,
                        }}
                      />
                    </div>
                    <span
                      className="font-mono text-[11px] tabular-nums w-[24px] text-right"
                      style={{ color: 'var(--color-text-tertiary)' }}
                    >
                      {b.count}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </section>

      <section className="mb-10">
        <h2
          className="text-[18px] font-medium m-0 mb-4"
          style={{ letterSpacing: '-0.005em' }}
        >
          Find me
        </h2>
        <ul
          className="text-[14px] m-0 p-0 list-none flex flex-col gap-1"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          <li>
            <a
              href="https://github.com/sgharlow"
              target="_blank"
              rel="noreferrer"
              className="hover:underline"
            >
              github.com/sgharlow ↗
            </a>
          </li>
          <li>
            <a
              href="https://www.linkedin.com/in/sgharlow/"
              target="_blank"
              rel="noreferrer"
              className="hover:underline"
            >
              linkedin.com/in/sgharlow ↗
            </a>
          </li>
        </ul>
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div
      className="rounded-xl p-4 flex flex-col gap-1"
      style={{
        background: 'var(--color-background-secondary)',
        border: '0.5px solid var(--color-border-tertiary)',
      }}
    >
      <span
        className="text-[28px] font-medium tabular-nums"
        style={{ letterSpacing: '-0.02em' }}
      >
        {value}
      </span>
      <span
        className="font-mono text-[10px] uppercase"
        style={{ color: 'var(--color-text-tertiary)', letterSpacing: '0.08em' }}
      >
        {label}
      </span>
    </div>
  );
}
