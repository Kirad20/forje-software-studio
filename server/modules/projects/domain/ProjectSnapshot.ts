import type { Author } from "./Author.js";

export type FileMap = Record<string, string>;

export interface SeoSettings {
  siteName?: string;
  siteDescription?: string;
  robots?: boolean;
  sitemap?: boolean;
  themeColor?: string;
}

export interface ProjectProfile {
  purpose?: string;
  audience?: string;
  appType?: string;
  coreFeatures?: string[];
  constraints?: string[];
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
  profile: ProjectProfile | null;
  shareEpoch: number;
  createdAt: string;
  updatedAt: string;
}

export type ProjectPatch = Partial<Pick<ProjectSnapshot,
  "name" | "description" | "aiEnabled" | "visibility" | "emailDomain" | "emailDomainVerified" |
  "favorite" | "archived" | "folderId" | "systemPrompt" | "designPrompt" | "seo" | "profile"
>>;

export function normalizeProjectProfile(value: unknown): ProjectProfile {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const source = value as Record<string, unknown>;
  const text = (field: unknown) => typeof field === "string" ? field.trim().slice(0, 500) : "";
  const list = (field: unknown) => Array.isArray(field)
    ? field.filter((item): item is string => typeof item === "string").map((item) => item.trim().slice(0, 300)).filter(Boolean).slice(0, 10)
    : [];
  const purpose = text(source.purpose);
  const audience = text(source.audience);
  const appType = text(source.appType);
  const coreFeatures = list(source.coreFeatures);
  const constraints = list(source.constraints);
  return {
    ...(purpose ? { purpose } : {}),
    ...(audience ? { audience } : {}),
    ...(appType ? { appType } : {}),
    ...(coreFeatures.length ? { coreFeatures } : {}),
    ...(constraints.length ? { constraints } : {}),
  };
}

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
