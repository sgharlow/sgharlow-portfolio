import fs from 'node:fs/promises';
import path from 'node:path';
import type { EnrichedProjectsFile, ProjectEntry, ProjectsFile } from './enrichment-types';

const REQUIRED_ENTRY_FIELDS: (keyof ProjectEntry)[] = [
  'slug', 'name', 'tagline', 'summary', 'category', 'kind', 'heroImagePrompt', 'links',
];

export function validateProjectsFile(raw: unknown): asserts raw is ProjectsFile {
  if (!raw || typeof raw !== 'object') throw new Error('projects.json must be an object');
  const file = raw as Partial<ProjectsFile>;
  if (file.version !== 1) throw new Error('projects.json: version must be 1');
  if (typeof file.spotlightLaunchDate !== 'string') throw new Error('projects.json: spotlightLaunchDate is required');
  if (!Array.isArray(file.entries)) throw new Error('projects.json: entries must be an array');
  for (const entry of file.entries) {
    for (const field of REQUIRED_ENTRY_FIELDS) {
      if (!(field in entry)) {
        throw new Error(`projects.json entry "${(entry as ProjectEntry).slug ?? '?'}" missing required field: ${field}`);
      }
    }
  }
}

export async function loadProjectsFile(): Promise<ProjectsFile> {
  const filePath = path.join(process.cwd(), 'data', 'projects.json');
  const raw = JSON.parse(await fs.readFile(filePath, 'utf-8'));
  validateProjectsFile(raw);
  return raw;
}

export async function loadEnrichedProjectsFile(): Promise<EnrichedProjectsFile> {
  const filePath = path.join(process.cwd(), 'data', 'projects.enriched.json');
  try {
    const raw = JSON.parse(await fs.readFile(filePath, 'utf-8'));
    return raw as EnrichedProjectsFile;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
      throw new Error('projects.enriched.json not found — run `npm run prebuild` first');
    }
    throw err;
  }
}
