import Link from 'next/link';
import type { ReactElement } from 'react';
import type { EnrichedProjectEntry } from '@/lib/enrichment-types';
import { HeroImage } from './HeroImage';
import { ProjectLinkRows } from './ProjectLinkRows';

interface Props {
  entry: EnrichedProjectEntry;
  date: Date;
}

export function SpotlightInterstitial({ entry, date }: Props): ReactElement {
  const dateLabel = date.toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  });

  return (
    <main className="min-h-[80vh] max-w-5xl mx-auto px-6 py-12">
      <div className="text-xs font-mono uppercase text-white/50 mb-2">
        Today's Spotlight · {dateLabel}
      </div>
      <hr className="border-white/10 mb-8" />

      <div className="grid md:grid-cols-2 gap-8 items-start">
        <HeroImage slug={entry.slug} name={entry.name} heroImage={entry.heroImage} priority />

        <div>
          <h1 className="font-display text-4xl text-white mb-2">{entry.name}</h1>
          <p className="text-white/70 mb-6">{entry.tagline}</p>

          <div className="prose prose-invert max-w-none mb-6">
            {(entry.spotlight?.longDescription ?? entry.summary)
              .split('\n\n')
              .map((p, i) => <p key={i}>{p}</p>)}
          </div>

          <ProjectLinkRows entry={entry} utmMedium="spotlight" />
        </div>
      </div>

      <hr className="border-white/10 my-12" />

      <div className="flex justify-center">
        <Link
          href="/grid"
          prefetch
          className="rounded-full border border-white/20 px-6 py-2 text-white hover:bg-white/10"
        >
          ✕ Close — Browse all projects
        </Link>
      </div>
    </main>
  );
}
