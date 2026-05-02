'use client';

import type { ReactElement } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

export function TopNav(): ReactElement {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const onLab = pathname === '/';
  const q = onLab ? searchParams.get('q') ?? '' : '';

  return (
    <nav
      className="flex flex-wrap items-center gap-4 pb-3 mb-4"
      style={{ borderBottom: '0.5px solid var(--color-border-tertiary)' }}
    >
      <Link
        href="/"
        className="text-[14px] font-medium shrink-0"
        style={{
          color: 'var(--color-text-primary)',
          fontFamily: 'var(--font-sans)',
          textDecoration: 'none',
        }}
      >
        sgharlow{' '}
        <span className="font-mono text-[11px]" style={{ color: '#D85A30' }}>
          // the lab
        </span>
      </Link>

      <form
        action="/"
        method="get"
        className="flex items-center gap-2 flex-1 min-w-[180px]"
        role="search"
      >
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Search projects, stack, taglines…"
          aria-label="Search projects"
          className="px-3 py-[6px] text-[13px] font-sans flex-1 min-w-0"
          style={{
            borderRadius: 8,
            border: '0.5px solid var(--color-border-tertiary)',
            background: 'var(--color-background-secondary)',
            color: 'var(--color-text-primary)',
            outline: 'none',
          }}
        />
        {onLab && q ? (
          <Link
            href="/"
            className="font-mono text-[11px]"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            clear
          </Link>
        ) : null}
      </form>

      <div
        className="flex items-center gap-4 text-[13px] shrink-0"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        <Link href="/about" className="hover:underline" style={{ textUnderlineOffset: 2 }}>
          about
        </Link>
        <a
          href="https://www.learningai365.com"
          className="hover:underline"
          style={{ textUnderlineOffset: 2 }}
        >
          ai courses
        </a>
        <a
          href="https://github.com/sgharlow"
          target="_blank"
          rel="noreferrer"
          className="hover:underline"
          style={{ textUnderlineOffset: 2 }}
        >
          github
        </a>
      </div>
    </nav>
  );
}
