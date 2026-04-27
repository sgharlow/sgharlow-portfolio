import type { ReactElement } from 'react';
import type { Status } from '@/lib/enrichment-types';

const DOT: Record<Status, string> = {
  active: '#1D9E75',
  'in progress': '#BA7517',
  shipped: '#534AB7',
  experiment: '#D4537E',
  archived: '#888780',
};

export function StatusPill({ status }: { status: Status }): ReactElement {
  return (
    <span
      className="inline-flex items-center gap-[5px] font-mono text-[10px] py-[3px] px-[7px] rounded-md border"
      style={{
        opacity: status === 'archived' ? 0.7 : 1,
        borderWidth: '0.5px',
        borderColor: 'var(--color-border-tertiary)',
        color: 'var(--color-text-secondary)',
        letterSpacing: '0.04em',
      }}
    >
      <span
        className="inline-block w-[6px] h-[6px] rounded-full"
        style={{ background: DOT[status] }}
      />
      {status}
    </span>
  );
}
