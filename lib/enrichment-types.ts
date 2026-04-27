export type Category = 'active' | 'frozen' | 'experiment' | 'product';

export type ProjectKind =
  | 'web-app'
  | 'cli'
  | 'mcp-server'
  | 'chrome-ext'
  | 'reddit-game'
  | 'library'
  | 'book'
  | 'course-platform';

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
  githubRepo?: string;
  youtubeVideo?: string;
  hackathon?: HackathonLink[];
  products?: ProductLink[];
}

export interface ProjectSpotlight {
  longDescription: string;
  callToAction?: { label: string; url: string };
  overrideDates?: string[];
}

export interface ProjectEntry {
  slug: string;
  name: string;
  tagline: string;
  summary: string;
  category: Category;
  kind: ProjectKind;
  heroImage: string | null;
  heroImagePrompt: string;
  order?: number;
  links: ProjectLinks;
  statusOverride?: string;
  spotlight?: ProjectSpotlight;
}

export interface ProjectsFile {
  version: 1;
  generatedAt?: string;
  spotlightLaunchDate: string;
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
  derivedStatus: string;
  activityScore: number;
}

export interface EnrichedProjectEntry extends ProjectEntry {
  enriched: EnrichmentBlock;
}

export interface EnrichedProjectsFile extends Omit<ProjectsFile, 'entries'> {
  generatedAt: string;
  entries: EnrichedProjectEntry[];
}
