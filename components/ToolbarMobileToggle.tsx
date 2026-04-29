'use client';

import type { ReactElement, ReactNode } from 'react';
import { useState } from 'react';

interface Props {
  children: ReactNode;
  defaultOpen?: boolean;
  summary: string; // shown when collapsed, e.g. "filters"
}

/**
 * Wraps secondary toolbar content (status chips, sort) so that on mobile (<sm)
 * it collapses behind a "filters" toggle. On sm+ screens it's always visible.
 */
export function ToolbarMobileToggle({
  children,
  defaultOpen = false,
  summary,
}: Props): ReactElement {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <>
      <button
        type="button"
        aria-expanded={open}
        aria-controls="toolbar-mobile-content"
        onClick={() => setOpen((v) => !v)}
        className="sm:hidden inline-flex items-center gap-1.5 font-mono text-[11px]"
        style={{
          padding: '4px 10px',
          borderRadius: 999,
          border: '0.5px solid var(--color-border-tertiary)',
          color: 'var(--color-text-secondary)',
          background: 'transparent',
          cursor: 'pointer',
          lineHeight: 1,
        }}
      >
        {summary}
        <span aria-hidden style={{ fontSize: 10 }}>{open ? '▴' : '▾'}</span>
      </button>
      <div
        id="toolbar-mobile-content"
        className={`${open ? 'flex' : 'hidden'} sm:flex flex-wrap items-center gap-1.5`}
      >
        {children}
      </div>
    </>
  );
}
