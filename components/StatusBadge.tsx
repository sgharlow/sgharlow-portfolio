import type { ReactElement } from 'react';
import type { Category } from '@/lib/enrichment-types';

const STYLES: Record<Category, { label: string; className: string }> = {
  active:     { label: 'Active',      className: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
  frozen:     { label: 'Frozen',      className: 'bg-amber-500/15 text-amber-300 border-amber-500/30' },
  experiment: { label: 'Experiment',  className: 'bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/30' },
  product:    { label: 'Product',     className: 'bg-sky-500/15 text-sky-300 border-sky-500/30' },
};

export function StatusBadge({ category }: { category: Category }): ReactElement {
  const { label, className } = STYLES[category];
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-mono ${className}`}>
      {label}
    </span>
  );
}
