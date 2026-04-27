import type { ReactElement } from 'react';
import type { EnrichedProjectEntry } from '@/lib/enrichment-types';
import { ProjectLinkRows } from './ProjectLinkRows';

export function ProjectHoverPopup({ entry }: { entry: EnrichedProjectEntry }): ReactElement {
  return (
    <div className="absolute inset-0 hidden md:flex flex-col justify-end rounded-xl bg-black/85 p-5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 backdrop-blur-sm">
      <h3 className="font-display text-lg text-white mb-2">{entry.name}</h3>
      <ProjectLinkRows entry={entry} utmMedium="hover-popup" />
    </div>
  );
}
