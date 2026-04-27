import Image from 'next/image';
import type { ReactElement } from 'react';

interface Props {
  slug: string;
  name: string;
  heroImage: string | null;
  priority?: boolean;
}

function hashSlug(slug: string): number {
  let h = 0;
  for (let i = 0; i < slug.length; i++) {
    h = (h * 31 + slug.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

export function HeroImage({ slug, name, heroImage, priority }: Props): ReactElement {
  if (heroImage) {
    return (
      <Image
        src={heroImage}
        alt={`${name} hero`}
        width={1280}
        height={720}
        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
        className="aspect-video w-full rounded-xl object-cover"
        priority={priority}
      />
    );
  }
  const hue = hashSlug(slug) % 360;
  return (
    <div
      className="aspect-video w-full rounded-xl flex items-center justify-center"
      data-stub-hue={hue}
      style={{
        background: `linear-gradient(135deg, hsl(${hue} 60% 22%), hsl(${(hue + 40) % 360} 70% 14%))`,
      }}
    >
      <span className="font-display text-2xl text-white/85 px-6 text-center">{name}</span>
    </div>
  );
}
