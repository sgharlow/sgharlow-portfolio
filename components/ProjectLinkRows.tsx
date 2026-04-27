import type { ReactElement } from 'react';
import type { EnrichedProjectEntry } from '@/lib/enrichment-types';
import { appendUtm } from '@/lib/links';
import { StatusBadge } from './StatusBadge';

interface Props {
  entry: EnrichedProjectEntry;
  utmMedium: 'hover-popup' | 'modal' | 'spotlight';
}

export function ProjectLinkRows({ entry, utmMedium }: Props): ReactElement {
  const { links, slug } = entry;
  const u = (url: string) => appendUtm(url, { medium: utmMedium, campaign: slug });

  return (
    <div className="space-y-2 text-sm">
      <div className="text-white/80">{entry.enriched.derivedStatus}</div>

      {links.deployedSite && (
        <a className="block hover:underline" href={u(links.deployedSite)} target="_blank" rel="noreferrer">
          🌐 Live site →
        </a>
      )}
      {links.githubRepo && (
        <a className="block hover:underline" href={`https://github.com/${links.githubRepo}`} target="_blank" rel="noreferrer">
          🐙 GitHub →
        </a>
      )}
      {links.youtubeVideo && (
        <a className="block hover:underline" href={u(links.youtubeVideo)} target="_blank" rel="noreferrer">
          ▶ Latest video →
        </a>
      )}

      {links.hackathon?.map((h, i) => (
        <a
          key={i}
          className="block hover:underline"
          href={h.url ? u(h.url) : '#'}
          target="_blank"
          rel="noreferrer"
        >
          🏆 {h.name} ({h.status}{h.prize ? ` · ${h.prize}` : ''})
        </a>
      ))}

      <div className="pt-1"><StatusBadge category={entry.category} /></div>

      {links.products?.map((p, i) => (
        <a key={i} className="block hover:underline" href={u(p.url)} target="_blank" rel="noreferrer">
          📚 {p.label} →
        </a>
      ))}
    </div>
  );
}
