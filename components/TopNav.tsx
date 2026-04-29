import type { ReactElement } from 'react';
import Link from 'next/link';

export function TopNav(): ReactElement {
  return (
    <nav
      className="flex items-center justify-between pb-5 mb-5"
      style={{ borderBottom: '0.5px solid var(--color-border-tertiary)' }}
    >
      <div className="flex items-baseline gap-[10px]">
        <Link
          href="/"
          className="text-[14px] font-medium"
          style={{
            color: 'var(--color-text-primary)',
            fontFamily: 'var(--font-sans)',
          }}
        >
          sgharlow
        </Link>
        <span className="font-mono text-[11px]" style={{ color: '#D85A30' }}>
          // the lab
        </span>
      </div>
      <div
        className="flex items-center gap-5 text-[13px]"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        <Link href="/" className="hover:underline" style={{ textUnderlineOffset: 2 }}>
          projects
        </Link>
        <Link href="/about" className="hover:underline" style={{ textUnderlineOffset: 2 }}>
          about
        </Link>
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
