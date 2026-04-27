import fs from 'node:fs/promises';
import path from 'node:path';
import type {
  EnrichedProjectEntry,
  EnrichedProjectsFile,
  GithubEnrichment,
  ProjectEntry,
  ProjectsFile,
  VercelEnrichment,
} from '../lib/enrichment-types';
import { loadProjectsFile } from '../lib/projects';

// ---------- exported helpers (testable) ----------

export function formatRelative(iso: string, now: Date = new Date()): string {
  const ms = now.getTime() - new Date(iso).getTime();
  const days = Math.floor(ms / 86_400_000);
  if (days < 7) return `${Math.max(days, 0)}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

export function computeActivityScore(
  signals: { github?: { lastCommitAt: string }; vercel?: { lastDeploymentAt: string } },
  now: Date = new Date(),
): number {
  const candidates: number[] = [];
  if (signals.github?.lastCommitAt) candidates.push(new Date(signals.github.lastCommitAt).getTime());
  if (signals.vercel?.lastDeploymentAt) candidates.push(new Date(signals.vercel.lastDeploymentAt).getTime());
  if (candidates.length === 0) return Number.MAX_SAFE_INTEGER;
  return Math.floor((now.getTime() - Math.max(...candidates)) / 86_400_000);
}

export function deriveStatus(
  category: ProjectEntry['category'],
  statusOverride: string | undefined,
  github: { lastCommitAt: string } | undefined,
  vercel: { lastDeploymentAt: string } | undefined,
  now: Date = new Date(),
): string {
  if (statusOverride) return statusOverride;

  const lastSignal = [github?.lastCommitAt, vercel?.lastDeploymentAt]
    .filter(Boolean)
    .sort()
    .at(-1);

  if (lastSignal) {
    const labels: Record<ProjectEntry['category'], string> = {
      active: 'Active',
      frozen: 'Frozen',
      experiment: 'Experiment',
      product: 'Product',
    };
    const verb = github?.lastCommitAt ? 'last commit' : 'last deploy';
    return `${labels[category]} — ${verb} ${formatRelative(lastSignal, now)}`;
  }

  return {
    active: 'Active',
    frozen: 'Frozen / archived',
    experiment: 'Experiment',
    product: 'Product',
  }[category];
}

// ---------- API fetchers ----------

const GH_API = 'https://api.github.com';
const VERCEL_API = 'https://api.vercel.com';

async function fetchGithub(repo: string, token: string): Promise<GithubEnrichment | undefined> {
  try {
    const headers = { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' };
    const repoResp = await fetch(`${GH_API}/repos/${repo}`, { headers });
    if (!repoResp.ok) {
      console.warn(`[enrich] github ${repo} → ${repoResp.status}`);
      return undefined;
    }
    const repoJson = (await repoResp.json()) as Record<string, unknown>;

    const commitsResp = await fetch(`${GH_API}/repos/${repo}/commits?per_page=1`, { headers });
    const commitsJson = (await commitsResp.json()) as Array<{ commit: { committer: { date: string } } }>;
    const lastCommitAt = commitsJson[0]?.commit?.committer?.date ?? (repoJson.pushed_at as string);

    const releasesResp = await fetch(`${GH_API}/repos/${repo}/releases/latest`, { headers });
    let latestRelease: GithubEnrichment['latestRelease'];
    if (releasesResp.ok) {
      const r = (await releasesResp.json()) as { tag_name: string; published_at: string };
      latestRelease = { tag: r.tag_name, publishedAt: r.published_at };
    }

    return {
      lastCommitAt,
      archived: Boolean(repoJson.archived),
      stars: Number(repoJson.stargazers_count) || 0,
      primaryLanguage: (repoJson.language as string | null) ?? null,
      latestRelease,
      fetchedAt: new Date().toISOString(),
      fetchOk: true,
    };
  } catch (err) {
    console.warn(`[enrich] github ${repo} threw`, err);
    return undefined;
  }
}

async function fetchVercel(
  projectName: string,
  token: string,
  teamId: string,
): Promise<VercelEnrichment | undefined> {
  try {
    const headers = { Authorization: `Bearer ${token}` };
    const proj = await fetch(`${VERCEL_API}/v9/projects/${projectName}?teamId=${teamId}`, { headers });
    if (!proj.ok) {
      console.warn(`[enrich] vercel ${projectName} → ${proj.status}`);
      return undefined;
    }
    const projJson = (await proj.json()) as {
      id: string;
      name: string;
      targets?: Record<string, { domain?: string }>;
    };

    const deploys = await fetch(
      `${VERCEL_API}/v6/deployments?projectId=${projJson.id}&teamId=${teamId}&target=production&limit=1`,
      { headers },
    );
    const deploysJson = (await deploys.json()) as {
      deployments: Array<{ created: number; state: VercelEnrichment['lastDeploymentState']; url: string }>;
    };
    const latest = deploysJson.deployments[0];
    if (!latest) return undefined;

    return {
      lastDeploymentAt: new Date(latest.created).toISOString(),
      lastDeploymentState: latest.state,
      productionDomain: projJson.targets?.production?.domain ?? latest.url,
      fetchedAt: new Date().toISOString(),
      fetchOk: true,
    };
  } catch (err) {
    console.warn(`[enrich] vercel ${projectName} threw`, err);
    return undefined;
  }
}

// ---------- main ----------

async function enrichEntry(
  entry: ProjectEntry,
  ghToken: string,
  vercelToken: string,
  vercelTeamId: string,
): Promise<EnrichedProjectEntry> {
  const github = entry.links.githubRepo ? await fetchGithub(entry.links.githubRepo, ghToken) : undefined;
  const vercel =
    entry.links.deployedSite && entry.kind !== 'book'
      ? await fetchVercel(entry.slug, vercelToken, vercelTeamId)
      : undefined;

  const derivedStatus = deriveStatus(entry.category, entry.statusOverride, github, vercel);
  const activityScore = computeActivityScore({ github, vercel });

  return { ...entry, enriched: { github, vercel, derivedStatus, activityScore } };
}

async function main(): Promise<void> {
  const ghToken = process.env.GH_TOKEN;
  const vercelToken = process.env.VERCEL_TOKEN;
  const vercelTeamId = process.env.VERCEL_TEAM_ID;

  const file: ProjectsFile = await loadProjectsFile();

  const outPath = path.join(process.cwd(), 'data', 'projects.enriched.json');
  await fs.mkdir(path.dirname(outPath), { recursive: true });

  if (!ghToken || !vercelToken || !vercelTeamId) {
    console.warn('[enrich] env vars missing; writing degraded enriched.json (no API calls)');
    const out: EnrichedProjectsFile = {
      ...file,
      generatedAt: new Date().toISOString(),
      entries: file.entries.map((e) => ({
        ...e,
        enriched: {
          derivedStatus: deriveStatus(e.category, e.statusOverride, undefined, undefined),
          activityScore: Number.MAX_SAFE_INTEGER,
        },
      })),
    };
    await fs.writeFile(outPath, JSON.stringify(out, null, 2), 'utf-8');
    console.log(`[enrich] wrote degraded ${outPath} (${out.entries.length} entries)`);
    return;
  }

  console.log(`[enrich] processing ${file.entries.length} entries`);

  const enriched: EnrichedProjectEntry[] = [];
  for (const entry of file.entries) {
    console.log(`[enrich] ${entry.slug}`);
    enriched.push(await enrichEntry(entry, ghToken, vercelToken, vercelTeamId));
  }

  const out: EnrichedProjectsFile = {
    ...file,
    generatedAt: new Date().toISOString(),
    entries: enriched,
  };

  await fs.writeFile(outPath, JSON.stringify(out, null, 2), 'utf-8');
  console.log(`[enrich] wrote ${outPath}`);
}

// Detect direct execution. On Windows, import.meta.url is `file:///C:/...` and
// process.argv[1] is `C:\...`; we normalize both sides for comparison. We also
// just always run main() when this file is the entry point, which `tsx` makes
// it via the `prebuild` script.
const argvPath = process.argv[1]?.replaceAll('\\', '/') ?? '';
const argvUrl = argvPath.startsWith('/') ? `file://${argvPath}` : `file:///${argvPath}`;
if (import.meta.url === argvUrl) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
