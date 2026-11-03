import type { ProjectProfile } from "../../projects/domain/ProjectSnapshot.js";

export interface EvaluationAccount {
  id: string;
  email: string;
  name: string | null;
  credits: number;
  platformRole: "admin" | "user";
  tokenOrgId?: string | null;
}

export interface EvaluationProject {
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
  profile: ProjectProfile | null;
  seo: {
    siteName?: string;
    siteDescription?: string;
    robots?: boolean;
    sitemap?: boolean;
    themeColor?: string;
  };
  shareEpoch: number;
  createdAt: string;
  updatedAt: string;
}

export interface EvaluationResourcesPort {
  identity: {
    createAccount(email: string, name: string | null, password: string | null, role?: "admin" | "user"): Promise<string>;
    getAccount(id: string): Promise<EvaluationAccount | undefined>;
  };
  projects: {
    createProject(ownerId: string, name: string, description?: string, files?: Record<string, string>, orgId?: string): Promise<EvaluationProject>;
    deleteProject(id: string): Promise<void>;
    readAllFiles(projectId: string): Promise<Record<string, string>>;
    writeFile(projectId: string, path: string, content: string, author?: "owner" | "builder" | "mcp" | "github" | "system", actor?: string): Promise<void>;
  };
}
