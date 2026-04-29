import type { ReactElement } from 'react';
import Link from 'next/link';
import type { Category, Status } from '@/lib/enrichment-types';
import { ToolbarMobileToggle } from './ToolbarMobileToggle';

export type SortMode = 'id' | 'updated' | 'stars';

interface ToolbarProps {
  q: string;
  filter: 'all' | Category;
  status: 'all' | Status;
  sort: SortMode;
  baseQuery: (overrides: Record<string, string | undefined>) => string;
}

const CATEGORY_DOTS: Record<Category, string> = {
  agents: '#534AB7',
  mcp: '#1D9E75',
  product: '#D85A30',
  research: '#D4537E',
  tooling: '#378ADD',
};

const CATEGORY_FILTERS: Array<{ key: 'all' | Category; label: string }> = [
  { key: 'all', label: 'all' },
  { key: 'agents', label: 'agents' },
  { key: 'mcp', label: 'mcp' },
  { key: 'product', label: 'product' },
  { key: 'research', label: 'research' },
  { key: 'tooling', label: 'tooling' },
];

const STATUS_FILTERS: Array<{ key: 'all' | Status; label: string }> = [
  { key: 'all', label: 'all' },
  { key: 'active', label: 'active' },
  { key: 'shipped', label: 'shipped' },
  { key: 'in progress', label: 'in progress' },
  { key: 'experiment', label: 'experiment' },
  { key: 'archived', label: 'archived' },
];

const SORT_OPTIONS: Array<{ key: SortMode; label: string }> = [
  { key: 'id', label: 'curated' },
  { key: 'updated', label: 'recent' },
  { key: 'stars', label: 'stars' },
];

function chip(active: boolean): React.CSSProperties {
  return {
    borderRadius: 999,
    border: '0.5px solid var(--color-border-tertiary)',
    background: active ? 'var(--color-text-primary)' : 'transparent',
    color: active ? 'var(--color-background-primary)' : 'var(--color-text-secondary)',
    borderColor: active ? 'var(--color-text-primary)' : 'var(--color-border-tertiary)',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '4px 10px',
    fontSize: 12,
    fontFamily: 'var(--font-mono)',
    textDecoration: 'none',
    lineHeight: 1,
  };
}

const dividerStyle: React.CSSProperties = {
  width: 1,
  height: 16,
  background: 'var(--color-border-tertiary)',
  margin: '0 4px',
};

function activeSummary(filter: 'all' | Category, status: 'all' | Status, sort: SortMode): string {
  const parts: string[] = [];
  if (filter !== 'all') parts.push(filter);
  if (status !== 'all') parts.push(status);
  if (sort !== 'id') parts.push(sort);
  if (parts.length === 0) return 'filters';
  return `filters · ${parts.join(' / ')}`;
}

export function Toolbar({ filter, status, sort, baseQuery }: ToolbarProps): ReactElement {
  return (
    <div
      className="flex flex-wrap items-center gap-1.5 mb-4 pb-3"
      style={{ borderBottom: '0.5px dashed var(--color-border-tertiary)' }}
    >
      {/* Category chips — always visible (they double as the legend) */}
      {CATEGORY_FILTERS.map((f) => {
        const active = filter === f.key;
        const dot = f.key !== 'all' ? CATEGORY_DOTS[f.key] : null;
        return (
          <Link
            key={f.key}
            href={baseQuery({ filter: f.key === 'all' ? undefined : f.key })}
            style={chip(active)}
            aria-pressed={active}
          >
            {dot ? (
              <span
                style={{
                  display: 'inline-block',
                  width: 7,
                  height: 7,
                  borderRadius: 999,
                  background: dot,
                }}
              />
            ) : null}
            {f.label}
          </Link>
        );
      })}

      <ToolbarMobileToggle summary={activeSummary(filter, status, sort)}>
        <span style={dividerStyle} aria-hidden />

        {STATUS_FILTERS.map((s) => {
          const active = status === s.key;
          return (
            <Link
              key={s.key}
              href={baseQuery({ status: s.key === 'all' ? undefined : s.key })}
              style={chip(active)}
              aria-pressed={active}
            >
              {s.label}
            </Link>
          );
        })}

        <span style={dividerStyle} aria-hidden />

        <span
          className="font-mono text-[10px]"
          style={{ color: 'var(--color-text-tertiary)', marginRight: 2 }}
        >
          sort:
        </span>
        {SORT_OPTIONS.map((s) => {
          const active = sort === s.key;
          return (
            <Link
              key={s.key}
              href={baseQuery({ sort: s.key === 'id' ? undefined : s.key })}
              style={chip(active)}
              aria-pressed={active}
            >
              {s.label}
            </Link>
          );
        })}
      </ToolbarMobileToggle>
    </div>
  );
}
