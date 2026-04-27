import type { ReactElement } from 'react';
import type { Category } from '@/lib/enrichment-types';
import { TAG_PALETTE } from './Rail';

export function TechStackTag({
  label,
  category,
}: {
  label: string;
  category: Category;
}): ReactElement {
  const { bg, fg } = TAG_PALETTE[category];
  return (
    <span
      className="font-mono text-[10px] py-[2px] px-[7px] rounded-[3px]"
      style={{ background: bg, color: fg }}
    >
      {label}
    </span>
  );
}
