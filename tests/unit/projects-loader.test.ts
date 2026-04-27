import { describe, it, expect } from 'vitest';
import { loadProjectsFile, validateProjectsFile } from '@/lib/projects';

const VALID_CATEGORIES = new Set(['agents', 'mcp', 'product', 'research', 'tooling']);
const VALID_STATUSES = new Set(['active', 'in progress', 'shipped', 'experiment', 'archived']);

describe('loadProjectsFile', () => {
  it('loads projects.json with at least 20 entries and valid slugs', async () => {
    const file = await loadProjectsFile();
    expect(file.version).toBe(2);
    expect(file.entries.length).toBeGreaterThanOrEqual(20);
    expect(file.entries.every((e) => /^[a-z0-9-]+$/.test(e.slug))).toBe(true);
  });

  it('every entry has a valid category and status', async () => {
    const file = await loadProjectsFile();
    for (const entry of file.entries) {
      expect(VALID_CATEGORIES.has(entry.category)).toBe(true);
      expect(VALID_STATUSES.has(entry.status)).toBe(true);
      expect(/^#\d+$/.test(entry.id)).toBe(true);
      expect(entry.stack.length).toBeGreaterThanOrEqual(2);
      expect(entry.stack.length).toBeLessThanOrEqual(4);
    }
  });

  it('throws when a required field is missing', () => {
    const malformed = { version: 2, entries: [{ slug: 'x' }] };
    expect(() => validateProjectsFile(malformed)).toThrow(/missing required field/i);
  });

  it('throws on a wrong version', () => {
    const malformed = { version: 1, entries: [] };
    expect(() => validateProjectsFile(malformed)).toThrow(/version must be 2/);
  });
});
