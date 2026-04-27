import fs from 'node:fs/promises';
import path from 'node:path';
import type {
  Category,
  EnrichedProjectsFile,
  ProjectEntry,
  ProjectsFile,
  Status,
} from './enrichment-types';

const REQUIRED_ENTRY_FIELDS: (keyof ProjectEntry)[] = [
  'slug',
  'id',
  'name',
  'tagline',
  'summary',
  'category',
  'status',
  'stack',
  'updated',
  'heroImagePrompt',
  'links',
];

const VALID_CATEGORIES: Category[] = ['agents', 'mcp', 'product', 'research', 'tooling'];
const VALID_STATUSES: Status[] = ['active', 'in progress', 'shipped', 'experiment', 'archived'];

export function validateProjectsFile(raw: unknown): asserts raw is ProjectsFile {
  if (!raw || typeof raw !== 'object') throw new Error('projects.json must be an object');
  const file = raw as Partial<ProjectsFile>;
  if (file.version !== 2) throw new Error('projects.json: version must be 2');
  if (!Array.isArray(file.entries)) throw new Error('projects.json: entries must be an array');
  for (const entry of file.entries) {
    for (const field of REQUIRED_ENTRY_FIELDS) {
      if (!(field in entry)) {
        throw new Error(
          `projects.json entry "${(entry as ProjectEntry).slug ?? '?'}" missing required field: ${field}`,
        );
      }
    }
    if (!VALID_CATEGORIES.includes(entry.category)) {
      throw new Error(`projects.json entry "${entry.slug}" has invalid category: ${entry.category}`);
    }
    if (!VALID_STATUSES.includes(entry.status)) {
      throw new Error(`projects.json entry "${entry.slug}" has invalid status: ${entry.status}`);
    }
    if (!Array.isArray(entry.stack) || entry.stack.length < 2 || entry.stack.length > 4) {
      throw new Error(`projects.json entry "${entry.slug}" must have 2-4 stack tags`);
    }
    if (!/^#\d+$/.test(entry.id)) {
      throw new Error(`projects.json entry "${entry.slug}" has invalid id: ${entry.id}`);
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
