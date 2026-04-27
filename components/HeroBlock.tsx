import type { ReactElement } from 'react';

export function HeroBlock(): ReactElement {
  return (
    <section className="mb-5">
      <h1
        className="text-[26px] font-medium m-0"
        style={{
          color: 'var(--color-text-primary)',
          letterSpacing: '-0.01em',
        }}
      >
        The lab
      </h1>
      <p
        className="text-[14px] m-0 mt-2 leading-[1.5]"
        style={{
          color: 'var(--color-text-secondary)',
          maxWidth: 460,
        }}
      >
        Things I&apos;ve shipped, broken, and learned from while teaching myself AI. Color-coded by
        category — status is the small pill on the right.
      </p>
    </section>
  );
}
