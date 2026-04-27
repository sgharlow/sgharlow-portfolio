// Spectrum Lab category enum (taxonomy-as-category)
export type Category = 'agents' | 'mcp' | 'product' | 'research' | 'tooling';

// Spectrum Lab status enum (separate from category)
export type Status = 'active' | 'in progress' | 'shipped' | 'experiment' | 'archived';

// Same as before
export type HackathonStatus = 'submitted' | 'finalist' | 'won' | 'active';
export type ProductKind = 'kindle' | 'lemonsqueezy' | 'gumroad' | 'other';

export interface HackathonLink {
  name: string;
  url?: string;
  status: HackathonStatus;
  prize?: string;
}

export interface ProductLink {
  label: string;
  url: string;
  kind: ProductKind;
}

export interface ProjectLinks {
  deployedSite?: string;
  githubRepo?: string; // "owner/repo"
  youtubeVideo?: string;
  hackathon?: HackathonLink[];
  products?: ProductLink[];
}

export interface ProjectEntry {
  slug: string;
  id: string; // sequential, e.g. "#01" — set by remap script ordered by category then slug
  name: string;
  tagline: string; // ≤80 chars; surfaces as card description (line-clamp 2)
  summary: string; // 2-3 sentences for detail page body
  category: Category;
  status: Status;
  stack: string[]; // 2-4 tech-stack tags
  updated: string; // "2d ago" / "apr 2026" — set by enrichment script when github data available, else fallback
  heroImage: string | null; // detail page only; null → no image on detail
  heroImagePrompt: string; // unchanged from before; used for generating detail-page heroes (NOT card heroes)
  links: ProjectLinks;
  order?: number; // optional manual sort; default = id order
}

export interface ProjectsFile {
  version: 2; // BUMP from 1 — schema breaking change
  generatedAt?: string;
  entries: ProjectEntry[];
}

export interface GithubEnrichment {
  lastCommitAt: string;
  archived: boolean;
  stars: number;
  primaryLanguage: string | null;
  latestRelease?: { tag: string; publishedAt: string };
  fetchedAt: string;
  fetchOk: boolean;
}

export interface VercelEnrichment {
  lastDeploymentAt: string;
  lastDeploymentState: 'READY' | 'ERROR' | 'BUILDING' | 'CANCELED';
  productionDomain: string;
  fetchedAt: string;
  fetchOk: boolean;
}

export interface EnrichmentBlock {
  github?: GithubEnrichment;
  vercel?: VercelEnrichment;
  derivedUpdated: string; // formats lastCommitAt for display in the card footer
  activityScore: number;
}

export interface EnrichedProjectEntry extends ProjectEntry {
  enriched: EnrichmentBlock;
}

export interface EnrichedProjectsFile extends Omit<ProjectsFile, 'entries'> {
  generatedAt: string;
  entries: EnrichedProjectEntry[];
}
