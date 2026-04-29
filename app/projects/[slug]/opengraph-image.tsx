import { ImageResponse } from 'next/og';
import { loadEnrichedProjectsFile } from '@/lib/projects';
import type { Category } from '@/lib/enrichment-types';

export const runtime = 'nodejs';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'Project hero';

const ACCENT: Record<Category, string> = {
  agents: '#534AB7',
  mcp: '#1D9E75',
  product: '#D85A30',
  research: '#D4537E',
  tooling: '#378ADD',
};

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.learningai365.com';

export async function generateImageMetadata() {
  const file = await loadEnrichedProjectsFile();
  return file.entries.map((e) => ({
    id: e.slug,
    alt: `${e.name} — sgharlow`,
    contentType,
    size,
  }));
}

export default async function Image({ params }: { params: { slug: string } }) {
  const file = await loadEnrichedProjectsFile();
  const entry = file.entries.find((e) => e.slug === params.slug);
  if (!entry) {
    return new ImageResponse(<div>Not found</div>, size);
  }

  const accent = ACCENT[entry.category];
  const heroSrc = entry.heroImage ? `${SITE_URL}${entry.heroImage}` : null;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: '#1a1917',
          color: '#fefefc',
          fontFamily: 'sans-serif',
          padding: 60,
          position: 'relative',
        }}
      >
        {heroSrc ? (
          <img
            src={heroSrc}
            alt=""
            width={1200}
            height={630}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: 0.45,
              filter: 'saturate(0.9)',
            }}
          />
        ) : null}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: 14,
            height: '100%',
            background: accent,
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(90deg, rgba(26,25,23,0.92) 0%, rgba(26,25,23,0.65) 60%, rgba(26,25,23,0.35) 100%)',
          }}
        />
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            height: '100%',
            zIndex: 2,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span
              style={{
                fontFamily: 'monospace',
                fontSize: 22,
                color: '#fefefc',
                letterSpacing: '0.06em',
                textTransform: 'lowercase',
              }}
            >
              sgharlow //
            </span>
            <span
              style={{
                fontFamily: 'monospace',
                fontSize: 22,
                color: accent,
                letterSpacing: '0.06em',
              }}
            >
              {entry.category}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <span
              style={{
                fontFamily: 'monospace',
                fontSize: 18,
                color: '#888780',
                letterSpacing: '0.06em',
              }}
            >
              {entry.id} · {entry.status}
            </span>
            <h1
              style={{
                fontSize: 76,
                fontWeight: 600,
                margin: 0,
                lineHeight: 1.05,
                letterSpacing: '-0.015em',
                maxWidth: 980,
              }}
            >
              {entry.name}
            </h1>
            <p
              style={{
                fontSize: 30,
                margin: 0,
                color: '#b8b6ad',
                lineHeight: 1.35,
                maxWidth: 980,
              }}
            >
              {entry.tagline}
            </p>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontFamily: 'monospace',
              fontSize: 18,
              color: '#888780',
            }}
          >
            <span>{entry.stack.slice(0, 4).join(' · ')}</span>
            <span>www.learningai365.com</span>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
