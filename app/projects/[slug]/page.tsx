import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { loadEnrichedProjectsFile } from '@/lib/projects';
import { DetailHero } from '@/components/DetailHero';
import { Rail } from '@/components/Rail';
import { StatusPill } from '@/components/StatusPill';
import { TechStackTag } from '@/components/TechStackTag';
import { appendUtm } from '@/lib/links';

export const revalidate = 21600;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const file = await loadEnrichedProjectsFile();
  return file.entries.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const file = await loadEnrichedProjectsFile();
  const entry = file.entries.find((e) => e.slug === slug);
  if (!entry) return { title: 'Not found' };
  return { title: `${entry.name} — sgharlow`, description: entry.tagline };
}

export default async function ProjectPage({ params }: PageProps) {
  const { slug } = await params;
  const file = await loadEnrichedProjectsFile();
  const entry = file.entries.find((e) => e.slug === slug);
  if (!entry) notFound();

  return (
    <main>
      <Link
        href="/"
        className="font-mono text-[11px]"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        ← back to the lab
      </Link>

      <article
        className="mt-5 grid grid-cols-[36px_1fr] overflow-hidden rounded-xl"
        style={{
          background: 'var(--color-background-primary)',
          border: '0.5px solid var(--color-border-tertiary)',
        }}
      >
        <Rail category={entry.category} />
        <div className="px-6 py-6">
          <header className="flex items-center justify-between mb-3">
            <StatusPill status={entry.status} />
            <span
              className="font-mono text-[10px]"
              style={{ color: 'var(--color-text-tertiary)' }}
            >
              {entry.id}
            </span>
          </header>

          <h1
            className="text-[26px] font-medium m-0 mb-2"
            style={{ letterSpacing: '-0.01em' }}
          >
            {entry.name}
          </h1>
          <p
            className="text-[14px] m-0 mb-6"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            {entry.tagline}
          </p>

          <div className="flex flex-col md:flex-row gap-6 mb-6">
            <DetailHero slug={entry.slug} name={entry.name} heroImage={entry.heroImage} />
            <div
              className="text-[14px] flex-1"
              style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6 }}
            >
              {entry.summary.split('\n\n').map((p, i) => (
                <p key={i} className="mb-4">
                  {p}
                </p>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-[6px] mb-6">
            {entry.stack.map((t) => (
              <TechStackTag key={t} label={t} category={entry.category} />
            ))}
          </div>

          <footer
            className="flex items-center justify-between pt-3 mt-3"
            style={{
              borderTop: '0.5px solid var(--color-border-tertiary)',
              color: 'var(--color-text-tertiary)',
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
            }}
          >
            <span>updated {entry.enriched.derivedUpdated || entry.updated}</span>
            <span>
              {entry.links.deployedSite && (
                <a
                  href={appendUtm(entry.links.deployedSite, {
                    medium: 'modal',
                    campaign: entry.slug,
                  })}
                  target="_blank"
                  rel="noreferrer"
                  className="ml-3 text-[12px]"
                  style={{
                    color: 'var(--color-text-secondary)',
                    fontFamily: 'var(--font-sans)',
                  }}
                >
                  live ↗
                </a>
              )}
              {entry.links.githubRepo && (
                <a
                  href={`https://github.com/${entry.links.githubRepo}`}
                  target="_blank"
                  rel="noreferrer"
                  className="ml-3 text-[12px]"
                  style={{
                    color: 'var(--color-text-secondary)',
                    fontFamily: 'var(--font-sans)',
                  }}
                >
                  repo ↗
                </a>
              )}
              {entry.links.youtubeVideo && (
                <a
                  href={appendUtm(entry.links.youtubeVideo, {
                    medium: 'modal',
                    campaign: entry.slug,
                  })}
                  target="_blank"
                  rel="noreferrer"
                  className="ml-3 text-[12px]"
                  style={{
                    color: 'var(--color-text-secondary)',
                    fontFamily: 'var(--font-sans)',
                  }}
                >
                  video ↗
                </a>
              )}
              {entry.links.products?.map((p, i) => (
                <a
                  key={i}
                  href={appendUtm(p.url, { medium: 'modal', campaign: entry.slug })}
                  target="_blank"
                  rel="noreferrer"
                  className="ml-3 text-[12px]"
                  style={{
                    color: 'var(--color-text-secondary)',
                    fontFamily: 'var(--font-sans)',
                  }}
                >
                  {p.label} ↗
                </a>
              ))}
            </span>
          </footer>

          {entry.links.hackathon?.length ? (
            <div
              className="mt-3 font-mono text-[10px]"
              style={{ color: 'var(--color-text-tertiary)' }}
            >
              {entry.links.hackathon.map((h, i) => (
                <span key={i} className="mr-3">
                  hackathon: {h.name} ({h.status}
                  {h.prize ? ` · ${h.prize}` : ''})
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </article>
    </main>
  );
}
