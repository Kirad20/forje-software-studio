import { spawn } from "node:child_process";
import { createHash, randomBytes } from "node:crypto";
import { chmod, mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { RepositoryRuntimeError, safeRepositoryPath, type RepositoryConfig, type RepositoryDeployment, type RepositoryEnvironment, type RepositoryRevision } from "../domain/repository.js";
import type { RepositoryRunner } from "../ports/runtime.js";

export type DockerCommand = (args: string[], options?: { timeout?: number; env?: Record<string, string>; log?: (text: string) => void }) => Promise<string>;
export interface DockerRepositoryOptions {
  enabled: boolean;
  contextRoot: string;
  host?: string;
  command?: DockerCommand;
  environmentSecret?: (id: string, env: RepositoryEnvironment) => Promise<{ password: string; key: string }>;
  unavailableReason?: string;
}
export const dockerCommand: DockerCommand = (args, options = {}) => new Promise((resolve, reject) => {
  const process = spawn("docker", args, { shell: false, windowsHide: true, env: { ...globalThis.process.env, ...options.env }, stdio: ["ignore", "pipe", "pipe"] });
  let output = "";
  let timedOut = false;
  const redact = (text: string) => Object.values(options.env ?? {}).reduce((result, secret) => secret ? result.replaceAll(secret, "[redacted]") : result, text);
  const append = (chunk: Buffer) => {
    const text = redact(chunk.toString());
    output = (output + text).slice(-65536);
    options.log?.(text);
  };
  process.stdout.on("data", append);
  process.stderr.on("data", append);
  const timer = setTimeout(() => { timedOut = true; process.kill(); }, options.timeout ?? 30_000);
  process.once("error", (error) => { clearTimeout(timer); reject(new RepositoryRuntimeError(`Docker runner unavailable: ${error.message}`, 503)); });
  process.once("close", (code) => {
    clearTimeout(timer);
    if (code === 0 && !timedOut) resolve(output.trim());
    else reject(new RepositoryRuntimeError(timedOut ? "Docker operation timed out" : `Docker operation failed: ${output.slice(-4000)}`, 422));
  });
});
const excluded = new Set([".git", "node_modules", "graphify-out", ".graphify_python", ".graphify_root", "data", "data-preview"]);
export function selectBuildFiles(files: Record<string, string>, rootDirectory: string): Record<string, string> {
  if (!safeRepositoryPath(rootDirectory, true)) throw new RepositoryRuntimeError("Invalid repository root", 400);
  const selected: Record<string, string> = {};
  let bytes = 0;
  for (const [file, content] of Object.entries(files)) {
    if (!safeRepositoryPath(file)) throw new RepositoryRuntimeError(`Unsafe build context path: ${file}`, 400);
    const parts = file.split("/");
    if (parts.some((part) => excluded.has(part) || (part.startsWith(".env") && part !== ".env.example")) || file.endsWith(".log")) continue;
    if (rootDirectory !== "." && !file.startsWith(rootDirectory + "/")) continue;
    const relative = rootDirectory === "." ? file : file.slice(rootDirectory.length + 1);
    bytes += content.startsWith("base64:") ? Buffer.byteLength(content.slice(7), "base64") : Buffer.byteLength(content);
    if (bytes > 100 * 1024 * 1024 || Object.keys(selected).length >= 20_000) throw new RepositoryRuntimeError("Repository build context exceeds limits", 422);
    selected[relative] = content;
  }
  return selected;
}
const generatedDockerfile = `FROM node:24-bookworm-slim
WORKDIR /app
COPY . .
RUN if [ -f package-lock.json ]; then npm ci --no-audit --no-fund; else npm install --no-audit --no-fund; fi
RUN npm run build --if-present && mkdir -p /app/data && chown -R node:node /app
ENV NODE_ENV=production HOST=0.0.0.0
USER node
CMD ["npm","start"]
`;
const label = (id: string) => createHash("sha256").update(id).digest("hex").slice(0, 20);
const pause = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
type ContainerInspect = { State?: { Running: boolean }; NetworkSettings?: { Ports: Record<string, { HostPort: string }[] | null> } };
export class DockerRepositoryRunner implements RepositoryRunner {
  private readonly command: DockerCommand;
  private readonly secrets = new Map<string, { password: string; key: string }>();
  constructor(private readonly options: DockerRepositoryOptions) { this.command = options.command ?? dockerCommand; }
  get unavailableReason() { return this.options.unavailableReason; }
  async available() {
    if (!this.options.enabled || this.options.unavailableReason) return false;
    try { await this.command(["info", "--format", "{{.ServerVersion}}"], { timeout: 15_000 }); return true; } catch { return false; }
  }
  private owner(id: string) { return `forja.repository=${label(id)}`; }
  private base(id: string, env: RepositoryEnvironment) { return `forja-repo-${label(id)}-${env}`; }
  private async inspect(name: string) {
    return JSON.parse(await this.command(["inspect", "--format", "{{json .}}", name])) as ContainerInspect;
  }
  private async ensureResource(kind: "network" | "volume", name: string, id: string) {
    try { await this.command([kind, "inspect", name]); }
    catch { await this.command([kind, "create", "--label", this.owner(id), name]); }
  }
  async build(id: string, revisionId: string, files: Record<string, string>, config: RepositoryConfig, log: (text: string) => void) {
    const selected = selectBuildFiles(files, config.rootDirectory);
    if (config.dockerfile && !selected[config.dockerfile]) throw new RepositoryRuntimeError("Configured Dockerfile does not exist in repository root", 422);
    if (!config.dockerfile && !selected["package.json"]) throw new RepositoryRuntimeError("Node repository requires package.json or a Dockerfile", 422);
    const root = path.resolve(this.options.contextRoot);
    const directory = path.join(root, label(id), label(revisionId));
    await mkdir(directory, { recursive: true });
    const tag = `forja-repository:${label(id)}-${label(revisionId)}`;
    try {
      for (const [file, content] of Object.entries(selected)) {
        const target = path.resolve(directory, ...file.split("/"));
        if (!target.startsWith(directory + path.sep)) throw new RepositoryRuntimeError("Unsafe build context", 400);
        await mkdir(path.dirname(target), { recursive: true });
        const bytes = content.startsWith("base64:") ? Buffer.from(content.slice(7), "base64") : Buffer.from(content, "utf8");
        await writeFile(target, bytes);
        if (bytes.subarray(0, 2).toString() === "#!") await chmod(target, 0o755);
      }
      if (!config.dockerfile) await writeFile(path.join(directory, "Dockerfile.forja"), generatedDockerfile);
      await this.command(["build", "--network", "default", "--label", this.owner(id), "--tag", tag, "--file", path.join(directory, config.dockerfile ?? "Dockerfile.forja"), directory], { timeout: 15 * 60_000, log });
      const image = JSON.parse(await this.command(["image", "inspect", "--format", "{{json .}}", tag])) as { Id: string; Config: { User: string } };
      this.assertNonRoot(image.Config.User);
      return image.Id;
    } catch (error) {
      await this.command(["image", "rm", tag]).catch(() => {});
      throw error;
    } finally { await rm(directory, { recursive: true, force: true }); }
  }
  private assertNonRoot(user: string) {
    if (!user || user.split(":")[0] === "root" || /^0+$/.test(user.split(":")[0])) throw new RepositoryRuntimeError("Repository image must declare a non-root USER", 422);
  }
  private async environmentSecret(id: string, env: RepositoryEnvironment) {
    const name = this.base(id, env);
    if (this.options.environmentSecret) {
      const secret = await this.options.environmentSecret(id, env);
      this.secrets.set(name, secret);
      return secret;
    }
    if (!this.secrets.has(name)) this.secrets.set(name, { password: randomBytes(32).toString("hex"), key: randomBytes(32).toString("hex") });
    return this.secrets.get(name)!;
  }
  async deploy(id: string, env: RepositoryEnvironment, revision: RepositoryRevision, config: RepositoryConfig, publicUrl: string) {
    const image = JSON.parse(await this.command(["image", "inspect", "--format", "{{json .}}", revision.image])) as { Id: string; Config: { User: string } };
    this.assertNonRoot(image.Config.User);
    const base = this.base(id, env);
    const name = `${base}-app-${randomBytes(6).toString("hex")}`;
    await this.ensureResource("network", base, id);
    const secret = await this.environmentSecret(id, env);
    const variables: Record<string, string> = {
      PORT: String(config.port), HOST: "0.0.0.0", PUBLIC_URL: publicUrl, NODE_ENV: "production",
      SECRETS_KEY: secret.key, FORJA_REPOSITORY_RUNNER: "disabled",
    };
    let createdDatabase = false;
    try {
      if (config.postgres) {
        await this.ensureResource("volume", `${base}-postgres-data`, id);
        let running = false;
        try { running = (await this.inspect(`${base}-postgres`)).State?.Running ?? false; } catch { /* New database. */ }
        if (!running) {
          await this.command(["rm", "-f", `${base}-postgres`]).catch(() => {});
          await this.command(["run", "-d", "--name", `${base}-postgres`, "--label", this.owner(id),
            "--network", base, "--network-alias", "postgres", "--memory=512m", "--cpus=1", "--pids-limit=128",
            "--security-opt=no-new-privileges", "-e", "POSTGRES_PASSWORD", "-e", "POSTGRES_USER=forja", "-e", "POSTGRES_DB=forja",
            "--mount", `type=volume,source=${base}-postgres-data,target=/var/lib/postgresql/data`, "postgres:17-bookworm",
          ], { env: { POSTGRES_PASSWORD: secret.password }, timeout: 180_000 });
          createdDatabase = true;
        }
        let ready = false;
        for (let i = 0; i < 30; i++) {
          try { await this.command(["exec", `${base}-postgres`, "pg_isready", "-U", "forja", "-d", "forja"], { timeout: 3000 }); ready = true; break; }
          catch { await pause(1000); }
        }
        if (!ready) throw new RepositoryRuntimeError("Isolated PostgreSQL failed readiness check", 422);
        variables.DATABASE_URL = `postgres://forja:${secret.password}@postgres:5432/forja`;
      }
      const mounts: string[] = [];
      if (config.storagePath) {
        await this.ensureResource("volume", `${base}-storage`, id);
        variables.DATA_DIR = config.storagePath;
        mounts.push("--mount", `type=volume,source=${base}-storage,target=${config.storagePath}`);
      }
      await this.command(["run", "-d", "--name", name, "--label", this.owner(id), "--label", `forja.environment=${env}`,
        "--network", base, "--publish", `127.0.0.1::${config.port}`,
        "--memory=1g", "--cpus=1", "--pids-limit=256", "--cap-drop=ALL", "--security-opt=no-new-privileges",
        "--log-driver=json-file", "--log-opt=max-size=1m", "--log-opt=max-file=2",
        ...Object.keys(variables).flatMap((key) => ["-e", key]), ...mounts, image.Id,
      ], { env: variables, timeout: 180_000 });
      const inspect = await this.inspect(name);
      const port = inspect.NetworkSettings?.Ports[`${config.port}/tcp`]?.[0]?.HostPort;
      if (!port) throw new RepositoryRuntimeError("Docker application port mapping unavailable", 422);
      const host = this.options.host ?? "127.0.0.1";
      if (!/^[a-zA-Z0-9._-]+$/.test(host)) throw new RepositoryRuntimeError("Invalid runner host configuration", 503);
      return { container: name, origin: `http://${host}:${port}` };
    } catch (error) {
      await this.command(["rm", "-f", name]).catch(() => {});
      if (createdDatabase) await this.command(["rm", "-f", `${base}-postgres`]).catch(() => {});
      throw error;
    }
  }
  async healthy(deployment: RepositoryDeployment, config: RepositoryConfig) {
    try {
      if (!(await this.inspect(deployment.container)).State?.Running) return false;
    } catch { return false; }
    for (let attempt = 0; attempt < 60; attempt++) {
      if (attempt > 0 && attempt % 5 === 0) {
        try { if (!(await this.inspect(deployment.container)).State?.Running) return false; } catch { return false; }
      }
      try {
        const response = await fetch(new URL(config.healthPath, deployment.origin), { signal: AbortSignal.timeout(2000), redirect: "manual" });
        await response.body?.cancel();
        if (response.ok) return true;
      } catch { /* Startup may still be running migrations. */ }
      await pause(1000);
    }
    return false;
  }
  async stop(id: string, env: RepositoryEnvironment, deployment?: RepositoryDeployment) {
    if (deployment) {
      if (!deployment.container.startsWith(this.base(id, env) + "-app-")) throw new RepositoryRuntimeError("Refusing to remove unowned container", 403);
      await this.command(["rm", "-f", deployment.container]);
      return;
    }
    const names = await this.command(["ps", "-a", "--filter", `label=${this.owner(id)}`, "--format", "{{.Names}}"]);
    for (const name of names.split(/\s+/).filter((n) => n.startsWith(this.base(id, env)))) await this.command(["rm", "-f", name]);
    // Stop preserves environment volumes and credentials; remove() is destructive.
  }
  async remove(id: string, images: string[]) {
    if (!this.options.enabled && !images.length) return;
    for (const env of ["preview", "published"] as const) {
      await this.stop(id, env);
      const base = this.base(id, env);
      for (const suffix of ["storage", "postgres-data"]) {
        try { await this.command(["volume", "inspect", `${base}-${suffix}`]); } catch { continue; }
        await this.command(["volume", "rm", `${base}-${suffix}`]);
      }
      try { await this.command(["network", "inspect", base]); } catch { continue; }
      await this.command(["network", "rm", base]);
    }
    const tags = await this.command(["image", "ls", "--filter", `label=${this.owner(id)}`, "--format", "{{.Repository}}:{{.Tag}}"]);
    for (const tag of tags.split(/\s+/).filter((t) => t.startsWith(`forja-repository:${label(id)}-`))) await this.command(["image", "rm", tag]);
    await rm(path.join(path.resolve(this.options.contextRoot), label(id)), { recursive: true, force: true });
  }
  async cleanup(id: string, activeContainers: string[]) {
    const names = await this.command(["ps", "-a", "--filter", `label=${this.owner(id)}`, "--format", "{{.Names}}"]);
    for (const name of names.split(/\s+/)) {
      if (!activeContainers.includes(name) && (["preview", "published"] as const).some((env) => name.startsWith(this.base(id, env) + "-app-"))) {
        await this.command(["rm", "-f", name]);
      }
    }
  }
  async logs(deployment: RepositoryDeployment, id?: string, env?: RepositoryEnvironment) {
    if (id && env) await this.environmentSecret(id, env);
    let text = await this.command(["logs", "--tail", "200", deployment.container]);
    for (const secret of this.secrets.values()) for (const value of Object.values(secret)) text = text.replaceAll(value, "[redacted]");
    return text.slice(-65536);
  }
}
