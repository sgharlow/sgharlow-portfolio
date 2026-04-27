'use client';

import { useState } from 'react';
import type { ReactElement } from 'react';
import Link from 'next/link';
import type { EnrichedProjectEntry } from '@/lib/enrichment-types';
import { HeroImage } from './HeroImage';
import { StatusBadge } from './StatusBadge';
import { ProjectHoverPopup } from './ProjectHoverPopup';
import { ProjectModal } from './ProjectModal';

interface Props {
  entry: EnrichedProjectEntry;
}

export function ProjectCard({ entry }: Props): ReactElement {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <article className="group relative">
        <Link
          href={`/projects/${entry.slug}`}
          className="hidden md:block"
          aria-label={entry.name}
        >
          <div className="relative">
            <HeroImage slug={entry.slug} name={entry.name} heroImage={entry.heroImage} />
            <ProjectHoverPopup entry={entry} />
          </div>
        </Link>

        <button
          type="button"
          className="block md:hidden w-full text-left"
          onClick={() => setModalOpen(true)}
          aria-label={`Open ${entry.name} details`}
        >
          <HeroImage slug={entry.slug} name={entry.name} heroImage={entry.heroImage} />
        </button>

        <div className="mt-3">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-display text-base text-white">{entry.name}</h3>
            <StatusBadge category={entry.category} />
          </div>
          <p className="text-sm text-white/70">{entry.tagline}</p>
        </div>
      </article>

      <ProjectModal entry={modalOpen ? entry : null} onClose={() => setModalOpen(false)} />
    </>
  );
}
