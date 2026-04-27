import { loadProjectsFile } from '../lib/projects';

async function main(): Promise<void> {
  const file = await loadProjectsFile();
  for (const entry of file.entries) {
    if (!entry.heroImage) {
      console.log(`# ${entry.slug} (${entry.category}, ${entry.kind})`);
      console.log(entry.heroImagePrompt);
      console.log();
    }
  }
}

main().catch((err) => { console.error(err); process.exit(1); });
