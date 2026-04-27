import type { MetadataRoute } from 'next';
import { loadEnrichedProjectsFile } from '@/lib/projects';

export const revalidate = 21600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.learningai365.com';
  const file = await loadEnrichedProjectsFile();

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${base}/`, priority: 1.0, changeFrequency: 'daily' },
    { url: `${base}/today`, priority: 0.9, changeFrequency: 'daily' },
    { url: `${base}/grid`, priority: 0.9, changeFrequency: 'weekly' },
    { url: `${base}/shop`, priority: 0.7, changeFrequency: 'weekly' },
  ];

  const projectPages: MetadataRoute.Sitemap = file.entries.map((e) => ({
    url: `${base}/projects/${e.slug}`,
    priority: 0.7,
    changeFrequency: 'weekly',
  }));

  return [...staticPages, ...projectPages];
}
