import Image from 'next/image';
import type { ReactElement } from 'react';

interface Props {
  slug: string;
  name: string;
  heroImage: string | null;
}

function hashSlug(slug: string): number {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function DetailHero({ slug, name, heroImage }: Props): ReactElement {
  if (heroImage) {
    return (
      <div
        className="w-full md:w-[28vw] md:max-w-[360px] aspect-video rounded-lg overflow-hidden"
        style={{ flexShrink: 0 }}
      >
        <Image
          src={heroImage}
          alt={`${name} hero`}
          width={1280}
          height={720}
          sizes="(min-width: 768px) 28vw, 100vw"
          className="w-full h-full object-cover"
          priority
        />
      </div>
    );
  }
  const hue = hashSlug(slug) % 360;
  return (
    <div
      className="w-full md:w-[28vw] md:max-w-[360px] aspect-video rounded-lg flex items-center justify-center"
      style={{
        flexShrink: 0,
        background: `linear-gradient(135deg, hsl(${hue} 60% 32%), hsl(${(hue + 40) % 360} 70% 22%))`,
      }}
    >
      <span
        className="text-2xl px-6 text-center"
        style={{ color: 'rgba(255,255,255,0.85)', fontFamily: 'var(--font-sans)' }}
      >
        {name}
      </span>
    </div>
  );
}
