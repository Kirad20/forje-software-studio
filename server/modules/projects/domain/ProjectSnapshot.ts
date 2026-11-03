import type { Author } from "./Author.js";

export type FileMap = Record<string, string>;

export interface SeoSettings {
  siteName?: string;
  siteDescription?: string;
  robots?: boolean;
  sitemap?: boolean;
  themeColor?: string;
}

/** Complete persisted project read model; unlike the aggregate, this includes operational settings. */
export interface ProjectSnapshot {
  id: string;
  ownerId: string;
  orgId: string | null;
  name: string;
  description: string;
  slug: string | null;
  visibility: "public" | "private";
  aiEnabled: boolean;
  emailDomain: string | null;
  emailDomainVerified: boolean;
  publishedVersionId: string | null;
  publishedAt: string | null;
  favorite: boolean;
  archived: boolean;
  folderId: string | null;
  lastOpenedAt: string;
  systemPrompt: string;
  designPrompt: string;
  seo: SeoSettings;
  shareEpoch: number;
  createdAt: string;
  updatedAt: string;
}

export type ProjectPatch = Partial<Pick<ProjectSnapshot,
  "name" | "description" | "aiEnabled" | "visibility" | "emailDomain" | "emailDomainVerified" |
  "favorite" | "archived" | "folderId" | "systemPrompt" | "designPrompt" | "seo"
>>;

export interface ChangeEntry {
  id: number;
  kind: string;
  paths: string[];
  author: Author;
  label: string | null;
  description: string | null;
  actor: string | null;
  createdAt: string;
}

export interface TurnFileChange {
  path: string;
  kind: "create" | "edit" | "delete";
  before: string | null;
  after: string | null;
  omitted?: boolean;
}

export interface TurnChanges {
  files: TurnFileChange[];
  restoreTo: number | null;
  firstChange: number | null;
}
