'use client';

import { useEffect } from 'react';
import type { ReactElement } from 'react';
import type { EnrichedProjectEntry } from '@/lib/enrichment-types';
import { ProjectLinkRows } from './ProjectLinkRows';

interface Props {
  entry: EnrichedProjectEntry | null;
  onClose: () => void;
}

export function ProjectModal({ entry, onClose }: Props): ReactElement | null {
  useEffect(() => {
    if (!entry) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [entry, onClose]);

  if (!entry) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end md:hidden bg-black/70" onClick={onClose}>
      <div className="w-full rounded-t-2xl bg-zinc-950 p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-4">
          <h3 className="font-display text-xl text-white">{entry.name}</h3>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="text-white/60 hover:text-white text-2xl leading-none"
          >
            ✕
          </button>
        </div>
        <p className="text-sm text-white/70 mb-4">{entry.summary}</p>
        <ProjectLinkRows entry={entry} utmMedium="modal" />
      </div>
    </div>
  );
}
