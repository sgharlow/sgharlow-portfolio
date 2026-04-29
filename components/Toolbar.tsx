import type { ReactElement } from 'react';
import Link from 'next/link';
import type { Category, Status } from '@/lib/enrichment-types';

export type SortMode = 'id' | 'updated' | 'stars';

interface ToolbarProps {
  q: string;
  filter: 'all' | Category;
  status: 'all' | Status;
  sort: SortMode;
  baseQuery: (overrides: Record<string, string | undefined>) => string;
}

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
  };
}

export function Toolbar({ q, filter, status, sort, baseQuery }: ToolbarProps): ReactElement {
  return (
    <div className="mb-5 flex flex-col gap-3">
      <form action="/" method="get" className="flex flex-wrap items-center gap-2">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Search projects, stack, taglines…"
          aria-label="Search projects"
          className="px-3 py-[7px] text-[13px] font-sans flex-1 min-w-[200px] max-w-[420px]"
          style={{
            borderRadius: 8,
            border: '0.5px solid var(--color-border-tertiary)',
            background: 'var(--color-background-secondary)',
            color: 'var(--color-text-primary)',
            outline: 'none',
          }}
        />
        {filter !== 'all' && <input type="hidden" name="filter" value={filter} />}
        {status !== 'all' && <input type="hidden" name="status" value={status} />}
        {sort !== 'id' && <input type="hidden" name="sort" value={sort} />}
        <button
          type="submit"
          className="px-3 py-[7px] text-[12px] font-mono"
          style={{
            borderRadius: 8,
            border: '0.5px solid var(--color-border-tertiary)',
            background: 'var(--color-text-primary)',
            color: 'var(--color-background-primary)',
            cursor: 'pointer',
          }}
        >
          search
        </button>
        {q && (
          <Link
            href={baseQuery({ q: undefined })}
            className="px-2 py-[5px] text-[11px] font-mono"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            clear
          </Link>
        )}
      </form>

      <div className="flex flex-wrap items-center gap-2">
        <span
          className="font-mono text-[10px] mr-1"
          style={{ color: 'var(--color-text-tertiary)' }}
        >
          category:
        </span>
        {CATEGORY_FILTERS.map((f) => {
          const active = filter === f.key;
          return (
            <Link
              key={f.key}
              href={baseQuery({ filter: f.key === 'all' ? undefined : f.key })}
              className="px-3 py-1 text-[12px] font-mono"
              style={chip(active)}
            >
              {f.label}
            </Link>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span
          className="font-mono text-[10px] mr-1"
          style={{ color: 'var(--color-text-tertiary)' }}
        >
          status:
        </span>
        {STATUS_FILTERS.map((s) => {
          const active = status === s.key;
          return (
            <Link
              key={s.key}
              href={baseQuery({ status: s.key === 'all' ? undefined : s.key })}
              className="px-3 py-1 text-[12px] font-mono"
              style={chip(active)}
            >
              {s.label}
            </Link>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span
          className="font-mono text-[10px] mr-1"
          style={{ color: 'var(--color-text-tertiary)' }}
        >
          sort:
        </span>
        {SORT_OPTIONS.map((s) => {
          const active = sort === s.key;
          return (
            <Link
              key={s.key}
              href={baseQuery({ sort: s.key === 'id' ? undefined : s.key })}
              className="px-3 py-1 text-[12px] font-mono"
              style={chip(active)}
            >
              {s.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
