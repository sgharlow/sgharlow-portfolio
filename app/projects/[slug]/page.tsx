import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { loadEnrichedProjectsFile } from '@/lib/projects';
import { DetailHero } from '@/components/DetailHero';
import { Rail } from '@/components/Rail';
import { StatusPill } from '@/components/StatusPill';
import { TechStackTag } from '@/components/TechStackTag';
import { HackathonBadges } from '@/components/HackathonBadge';
import type { EnrichedProjectEntry } from '@/lib/enrichment-types';
import { appendUtm } from '@/lib/links';

export const revalidate = 21600;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.learningai365.com';

function buildCreativeWorkJsonLd(entry: EnrichedProjectEntry) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: entry.name,
    description: entry.tagline,
    abstract: entry.summary,
    url: `${SITE_URL}/projects/${entry.slug}`,
    image: entry.heroImage ? `${SITE_URL}${entry.heroImage}` : undefined,
    keywords: [entry.category, entry.status, ...entry.stack].join(', '),
    dateModified: entry.enriched.github?.lastCommitAt,
    author: { '@type': 'Person', name: 'Steve Gharlow' },
    codeRepository: entry.links.githubRepo
      ? `https://github.com/${entry.links.githubRepo}`
      : undefined,
  };
}

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

interface DetailLink {
  label: string;
  url: string;
}

function collectDetailLinks(entry: EnrichedProjectEntry): DetailLink[] {
  const out: DetailLink[] = [];
  if (entry.links.deployedSite) {
    out.push({
      label: 'live',
      url: appendUtm(entry.links.deployedSite, { medium: 'modal', campaign: entry.slug }),
    });
  }
  if (entry.links.githubRepo) {
    out.push({ label: 'repo', url: `https://github.com/${entry.links.githubRepo}` });
  }
  if (entry.links.youtubeVideo) {
    out.push({
      label: 'video',
      url: appendUtm(entry.links.youtubeVideo, { medium: 'modal', campaign: entry.slug }),
    });
  }
  if (entry.links.spec) {
    out.push({ label: 'spec', url: entry.links.spec });
  }
  for (const p of entry.links.products ?? []) {
    out.push({
      label: p.label,
      url: appendUtm(p.url, { medium: 'modal', campaign: entry.slug }),
    });
  }
  return out;
}

export default async function ProjectPage({ params }: PageProps) {
  const { slug } = await params;
  const file = await loadEnrichedProjectsFile();
  const entry = file.entries.find((e) => e.slug === slug);
  if (!entry) notFound();

  const jsonLd = buildCreativeWorkJsonLd(entry);
  const links = collectDetailLinks(entry);

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Link
        href="/"
        className="font-mono text-[11px]"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        ← back to the lab
      </Link>

      <article
        className="mt-3 grid grid-cols-[36px_1fr] overflow-hidden rounded-xl"
        style={{
          background: 'var(--color-background-primary)',
          border: '0.5px solid var(--color-border-tertiary)',
        }}
      >
        <Rail category={entry.category} />
        <div className="px-5 py-4 sm:px-6 sm:py-5">
          <header className="flex items-center gap-3 mb-2 flex-wrap">
            <StatusPill status={entry.status} />
            <span
              className="font-mono text-[10px]"
              style={{ color: 'var(--color-text-tertiary)' }}
            >
              {entry.id}
            </span>
            <span
              className="font-mono text-[10px]"
              style={{ color: 'var(--color-text-tertiary)' }}
              aria-hidden
            >
              ·
            </span>
            <span
              className="font-mono text-[10px]"
              style={{ color: 'var(--color-text-tertiary)' }}
            >
              updated {entry.enriched.derivedUpdated || entry.updated}
            </span>
            {links.length > 0 ? (
              <>
                <span
                  className="font-mono text-[10px]"
                  style={{ color: 'var(--color-text-tertiary)' }}
                  aria-hidden
                >
                  ·
                </span>
                <span className="flex flex-wrap items-center gap-3">
                  {links.map((l) => (
                    <a
                      key={l.url}
                      href={l.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[12px] hover:underline"
                      style={{
                        color: 'var(--color-text-secondary)',
                        fontFamily: 'var(--font-sans)',
                      }}
                    >
                      {l.label} ↗
                    </a>
                  ))}
                </span>
              </>
            ) : null}
          </header>

          <h1
            className="text-[24px] font-medium m-0 mb-1"
            style={{ letterSpacing: '-0.01em' }}
          >
            {entry.name}
          </h1>
          <p
            className="text-[14px] m-0 mb-4"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            {entry.tagline}
          </p>

          <div className="flex flex-col md:flex-row gap-5 mb-4">
            <DetailHero slug={entry.slug} name={entry.name} heroImage={entry.heroImage} />
            <div
              className="text-[14px] flex-1 min-w-0"
              style={{ color: 'var(--color-text-secondary)', lineHeight: 1.55 }}
            >
              {entry.summary.split('\n\n').map((p, i) => (
                <p key={i} className="mb-3 last:mb-0">
                  {p}
                </p>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-[6px] mb-3">
            {entry.stack.map((t) => (
              <TechStackTag key={t} label={t} category={entry.category} />
            ))}
          </div>

          <HackathonBadges items={entry.links.hackathon} />
        </div>
      </article>
    </main>
  );
}
