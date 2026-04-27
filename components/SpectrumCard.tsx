import type { ReactElement } from 'react';
import Link from 'next/link';
import type { EnrichedProjectEntry } from '@/lib/enrichment-types';
import { Rail } from './Rail';
import { StatusPill } from './StatusPill';
import { TechStackTag } from './TechStackTag';
import { appendUtm } from '@/lib/links';

export function SpectrumCard({ entry }: { entry: EnrichedProjectEntry }): ReactElement {
  const updatedDisplay = entry.enriched.derivedUpdated || entry.updated;
  const stack = entry.stack.slice(0, 4);
  const footerLinks = collectFooterLinks(entry);

  return (
    <article
      className="grid grid-cols-[36px_1fr] overflow-hidden rounded-xl"
      style={{
        background: 'var(--color-background-primary)',
        border: '0.5px solid var(--color-border-tertiary)',
      }}
    >
      <Rail category={entry.category} />
      <div className="flex flex-col px-4 py-[14px] min-w-0">
        <header className="flex items-center justify-between mb-2">
          <StatusPill status={entry.status} />
          <span className="font-mono text-[10px]" style={{ color: 'var(--color-text-tertiary)' }}>
            {entry.id}
          </span>
        </header>

        <Link
          href={`/projects/${entry.slug}`}
          className="hover:underline"
          style={{ textUnderlineOffset: 2 }}
        >
          <h3 className="text-[15px] font-medium leading-[1.3] m-0">{entry.name}</h3>
        </Link>
        <p
          className="text-[13px] m-0 mt-1 mb-3 leading-[1.5] flex-1"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          {entry.tagline}
        </p>

        <div className="flex flex-wrap gap-[6px] mb-3">
          {stack.map((tag) => (
            <TechStackTag key={tag} label={tag} category={entry.category} />
          ))}
        </div>

        <footer
          className="flex items-center justify-between pt-[10px] font-mono text-[10px]"
          style={{
            borderTop: '0.5px solid var(--color-border-tertiary)',
            color: 'var(--color-text-tertiary)',
          }}
        >
          <span>updated {updatedDisplay}</span>
          <span>
            {footerLinks.map((l) => (
              <a
                key={l.url}
                href={l.url}
                target="_blank"
                rel="noreferrer"
                className="ml-[10px] text-[12px]"
                style={{
                  color: 'var(--color-text-secondary)',
                  fontFamily: 'var(--font-sans)',
                }}
              >
                {l.label} ↗
              </a>
            ))}
          </span>
        </footer>
      </div>
    </article>
  );
}

function collectFooterLinks(entry: EnrichedProjectEntry): { label: string; url: string }[] {
  const out: { label: string; url: string }[] = [];
  if (entry.links.deployedSite) {
    out.push({
      label: 'live',
      url: appendUtm(entry.links.deployedSite, { medium: 'grid-card', campaign: entry.slug }),
    });
  }
  if (entry.links.githubRepo) {
    out.push({ label: 'repo', url: `https://github.com/${entry.links.githubRepo}` });
  }
  // For products, include the first product purchase link
  const product = entry.links.products?.[0];
  if (product) {
    out.push({
      label: 'buy',
      url: appendUtm(product.url, { medium: 'grid-card', campaign: entry.slug }),
    });
  }
  return out.slice(0, 3); // cap at 3 per spec
}
