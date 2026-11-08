export type RepositoryEnvironment = "preview" | "published";
export interface RepositoryConfig {
  rootDirectory: string;
  dockerfile: string | null;
  port: number;
  healthPath: string;
  postgres: boolean;
  storagePath: string | null;
}
export interface RepositoryRevision {
  id: string;
  image: string;
  createdAt: string;
  status: "ready" | "failed";
  error: string | null;
}
export interface RepositoryDeployment {
  revisionId: string;
  container: string;
  origin: string;
  publicUrl?: string;
  projectId?: string;
  environment?: RepositoryEnvironment;
}
export interface RepositorySnapshot {
  available: boolean;
  config: RepositoryConfig;
  status: "idle" | "building" | "ready" | "failed";
  error: string | null;
  preview: RepositoryRevision | null;
  published: RepositoryRevision | null;
  revisions: RepositoryRevision[];
  logs: string;
}
export interface RepositoryState {
  config: RepositoryConfig;
  status: RepositorySnapshot["status"];
  error: string | null;
  revisions: (RepositoryRevision & { files: Record<string, string>; config: RepositoryConfig })[];
  deployments: Partial<Record<RepositoryEnvironment, RepositoryDeployment>>;
  slug: string | null;
  logs: string;
}
export class RepositoryRuntimeError extends Error {
  constructor(message: string, public readonly status: 400 | 403 | 409 | 422 | 503) { super(message); }
}
export function safeRepositoryPath(value: string, allowRoot = false): boolean {
  return (allowRoot && value === ".") || (
    value.length > 0 && value.length <= 500 && !/^[\\/]|\x00|[\\:]|[\r\n]/.test(value)
    && value.split("/").every((part) => !!part && part !== "." && part !== "..")
  );
}
export function validateRepositoryConfig(config: RepositoryConfig): RepositoryConfig {
  if (!safeRepositoryPath(config.rootDirectory, true)) throw new RepositoryRuntimeError("Invalid repository root directory", 400);
  if (config.dockerfile !== null && !safeRepositoryPath(config.dockerfile)) throw new RepositoryRuntimeError("Invalid Dockerfile path", 400);
  if (!Number.isInteger(config.port) || config.port < 1 || config.port > 65535) throw new RepositoryRuntimeError("Invalid application port", 400);
  if (!/^\/[A-Za-z0-9/_.~-]*$/.test(config.healthPath) || config.healthPath.length > 500) throw new RepositoryRuntimeError("Invalid health path", 400);
  if (typeof config.postgres !== "boolean") throw new RepositoryRuntimeError("Invalid PostgreSQL setting", 400);
  if (config.storagePath !== null && (!/^\/[A-Za-z0-9/_-]+$/.test(config.storagePath) || config.storagePath.split("/").includes("..") || !config.storagePath.startsWith("/app/"))) {
    throw new RepositoryRuntimeError("Storage must be a named volume under /app/", 400);
  }
  return { ...config };
}
export function inferRepositoryConfig(files: Record<string, string>): RepositoryConfig {
  const dockerfile = files.Dockerfile;
  let pkg: { name?: string; dependencies?: Record<string, unknown> } = {};
  try { pkg = JSON.parse(files["package.json"] ?? "{}"); }
  catch {
    if (!dockerfile || dockerfile.includes("package.json")) throw new RepositoryRuntimeError("Invalid repository package.json", 400);
  }
  const forja = pkg.name === "forja";
  const port = Number(dockerfile?.match(/\bEXPOSE\s+(\d+)/i)?.[1] ?? dockerfile?.match(/\bPORT=(\d+)/)?.[1] ?? (forja ? 4100 : 3000));
  return {
    rootDirectory: ".", dockerfile: dockerfile ? "Dockerfile" : null, port,
    healthPath: forja || dockerfile?.includes("/healthz") ? "/healthz" : "/",
    postgres: forja || !!pkg.dependencies?.pg,
    storagePath: forja || dockerfile?.includes("/app/data") ? "/app/data" : null,
  };
}
