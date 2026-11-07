export interface GithubAccount {
  connected: boolean;
  login: string | null;
  oauth: boolean;
  app: { id: number; slug: string; name: string; owner: string } | null;
  installations: { id: number; login: string }[];
  canCreateRepo: boolean;
}

export interface GithubRepository {
  id: number;
  name: string;
  fullName: string;
  owner: string;
  private: boolean;
  description: string | null;
  defaultBranch: string;
  installationId: number | null;
}

export interface GithubSelection {
  repo: string;
  branch: string;
  installationId: number | null;
}
