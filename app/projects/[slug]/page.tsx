import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { loadEnrichedProjectsFile } from '@/lib/projects';
import { HeroImage } from '@/components/HeroImage';
import { ProjectLinkRows } from '@/components/ProjectLinkRows';

export const revalidate = 21600;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const file = await loadEnrichedProjectsFile();
  return file.entries.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const file = await loadEnrichedProjectsFile();
  const entry = file.entries.find((e) => e.slug === slug);
  if (!entry) return { title: 'Not found' };
  return { title: `${entry.name} — sgharlow`, description: entry.tagline };
}

export default async function ProjectPage({ params }: PageProps) {
  const { slug } = await params;
  const file = await loadEnrichedProjectsFile();
  const entry = file.entries.find((e) => e.slug === slug);
  if (!entry) notFound();

  const body = entry.spotlight?.longDescription ?? entry.summary;

  return (
    <main className="max-w-4xl mx-auto px-6 py-10">
      <article className="grid md:grid-cols-2 gap-8 items-start">
        <HeroImage slug={entry.slug} name={entry.name} heroImage={entry.heroImage} priority />
        <div>
          <h1 className="font-display text-3xl text-white mb-2">{entry.name}</h1>
          <p className="text-white/70 mb-6">{entry.tagline}</p>
          <div className="prose prose-invert max-w-none mb-6">
            {body.split('\n\n').map((p, i) => <p key={i}>{p}</p>)}
          </div>
          <ProjectLinkRows entry={entry} utmMedium="modal" />
        </div>
      </article>
    </main>
  );
}
