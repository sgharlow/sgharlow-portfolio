import type { ReactElement } from 'react';
import Link from 'next/link';

export function TopNav(): ReactElement {
  return (
    <nav className="border-b border-white/10 bg-black/30">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="font-display text-white">sgharlow</Link>
        <div className="flex items-center gap-6 text-sm text-white/70">
          <Link href="/" className="hover:text-white">Today</Link>
          <Link href="/grid" className="hover:text-white">All projects</Link>
          <Link href="/shop" className="hover:text-white">Shop</Link>
          <a href="https://github.com/sgharlow" target="_blank" rel="noreferrer" className="hover:text-white">GitHub</a>
        </div>
      </div>
    </nav>
  );
}
