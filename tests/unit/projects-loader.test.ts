import { describe, it, expect } from 'vitest';
import { loadProjectsFile, validateProjectsFile } from '@/lib/projects';

describe('loadProjectsFile', () => {
  it('loads the seed projects.json with three entries', async () => {
    const file = await loadProjectsFile();
    expect(file.version).toBe(1);
    expect(file.entries).toHaveLength(3);
    expect(file.entries.map((e) => e.slug).sort()).toEqual([
      'comment-conspiracy',
      'ender-ai-leadership',
      'health-pulse',
    ]);
  });

  it('throws when a required field is missing', async () => {
    const malformed = { version: 1, spotlightLaunchDate: '2026-04-26', entries: [{ slug: 'x' }] };
    expect(() => validateProjectsFile(malformed)).toThrow(/missing required field/i);
  });
});
