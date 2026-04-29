import type { ReactElement } from 'react';
import type { HackathonLink } from '@/lib/enrichment-types';

const STATUS_DOT: Record<HackathonLink['status'], string> = {
  submitted: '#888780',
  finalist: '#BA7517',
  won: '#1D9E75',
  active: '#378ADD',
};

function shorten(name: string): string {
  return name
    .replace(/\s+\d{4}$/, '')
    .replace(/\bGlobal Hackathon\b/i, '')
    .replace(/\bHackathon\b/i, '')
    .trim();
}

export function HackathonBadges({ items }: { items: HackathonLink[] | undefined }): ReactElement | null {
  if (!items || items.length === 0) return null;
  const visible = items.slice(0, 2);
  const overflow = items.length - visible.length;

  return (
    <div className="flex flex-wrap items-center gap-[5px] mb-3">
      {visible.map((h) => {
        const label = shorten(h.name);
        const prizeSuffix = h.prize ? ` · ${h.prize}` : '';
        return (
          <span
            key={`${h.name}-${h.status}`}
            className="inline-flex items-center gap-[5px] font-mono text-[10px] py-[2px] px-[7px] rounded-md border"
            style={{
              borderWidth: '0.5px',
              borderColor: 'var(--color-border-tertiary)',
              color: 'var(--color-text-secondary)',
              letterSpacing: '0.02em',
              maxWidth: '100%',
            }}
            title={`${h.name} — ${h.status}${prizeSuffix}`}
          >
            <span
              className="inline-block w-[5px] h-[5px] rounded-full shrink-0"
              style={{ background: STATUS_DOT[h.status] }}
            />
            <span className="truncate">{label}{prizeSuffix}</span>
          </span>
        );
      })}
      {overflow > 0 ? (
        <span
          className="font-mono text-[10px]"
          style={{ color: 'var(--color-text-tertiary)' }}
        >
          +{overflow}
        </span>
      ) : null}
    </div>
  );
}
