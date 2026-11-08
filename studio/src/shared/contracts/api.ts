export interface Project {
  id: string;
  runtime?: "native" | "repository";
  name: string;
  description: string;
  slug: string | null;
  visibility: "public" | "private";
  aiEnabled: boolean;
  emailDomain: string | null;
  emailDomainVerified: boolean;
  publishedAt: string | null;
  updatedAt: string;
  createdAt: string;
  lastOpenedAt: string;
  favorite: boolean;
  archived: boolean;
  folderId: string | null;
  orgId?: string | null;
  systemPrompt: string;
  designPrompt: string;
  seo: { siteName?: string; siteDescription?: string; robots?: boolean; sitemap?: boolean; themeColor?: string };
  access?: "owner" | "editor";
  previewUrl: string;
  previewOrigin: string;
  appUrl: string | null;
  suggestedSlug: string;
  building: boolean;
  hasUnpublishedChanges: boolean;
}

export interface Folder {
  id: string;
  name: string;
}

export interface ProjectDashboard {
  projects: Project[];
  shared: Project[];
  folders: Folder[];
}

export interface Account {
  id: string;
  email: string;
  name: string | null;
  credits: number;
  platformRole: "admin" | "user";
  sessions: number;
}

export interface ProjectProblem {
  id: string;
  kind: "build" | "runtime" | "network" | "server";
  title: string;
  detail: string;
  file?: string;
  line?: number;
  status?: number;
  count: number;
  lastAt: string;
}

export type Me = Account;
export type JsonObject = Record<string, unknown>;

export interface ServiceReplica { pid: number | null; active: number; ready: boolean }
export interface ServiceRuntimeGroup { env: "preview" | "published"; service: string; replicas: ServiceReplica[] }
export interface ServiceQueueEntry {
  id: string; job: string; service?: string; env: string; status: string;
  attempts: number; maxAttempts: number; error: string | null;
  createdAt?: string; availableAt?: string;
}
export interface ControlledService {
  name: string; kind: "service" | "worker" | "monolith";
  endpoints: string[]; jobs: string[]; scalable: boolean;
  desired: { replicas: number; maxConcurrency: number | null };
  runtime: Omit<ServiceRuntimeGroup, "service">[];
  queue: ServiceQueueEntry[]; queueCounts: Record<string, number>; lastFailure: string | null;
}
export interface ServiceControlSnapshot {
  manifest: boolean; services: ControlledService[];
  runtime: { available: boolean; scope: "app-runtime"; services: ServiceRuntimeGroup[]; error?: string };
  queueScope: string;
}
