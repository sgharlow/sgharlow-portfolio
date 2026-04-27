import type { MetadataRoute } from 'next';
import { loadEnrichedProjectsFile } from '@/lib/projects';

export const revalidate = 21600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.learningai365.com';
  const file = await loadEnrichedProjectsFile();
  return [
    { url: `${base}/`, priority: 1.0, changeFrequency: 'daily' },
    ...file.entries.map((e) => ({
      url: `${base}/projects/${e.slug}`,
      priority: 0.7,
      changeFrequency: 'weekly' as const,
    })),
  ];
}
