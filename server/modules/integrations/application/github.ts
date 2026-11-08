import { decodeRepositoryBlob } from "./RepositoryBlob.js";
export type ProjectRuntime = "native" | "repository";

export class GithubError extends Error {
  constructor(message: string, readonly status: number) { super(message); }
}
export interface Link {
  project_id: string; account_id: string; owner: string; repo: string; branch: string;
  installation_id?: number | string | null;
  last_sha: string | null; last_tree: string | null; synced: Record<string, string>; status: string; error: string | null; synced_at: string | null;
}
export interface SyncResult { pulled: { sha: string; message: string; files: string[] }[]; pushed: { sha: string; files: string[] } | null }
export interface GithubRepository {
  link(projectId: string): Promise<Link | null | undefined>;
  token(accountId: string, installationId?: number | null, owner?: string, repo?: string): Promise<{ token: string; login: string }>;
  saveSync(projectId: string, link: Link): Promise<void>;
  failSync(projectId: string, status: string, message: string): Promise<void>;
  linkedProjects(): Promise<string[]>;
  addPullCard(projectId: string, card: unknown): Promise<void>;
}
export interface GithubProjectPorts {
  readAllFiles(projectId: string): Promise<Record<string, string>>;
  writeFile(projectId: string, path: string, content: string, actor: "github", author: string): Promise<unknown>;
  deleteFile(projectId: string, path: string, actor: "github"): Promise<unknown>;
  assertValidPath(path: string): unknown;
  assertValidPathForProject?(projectId: string, path: string): Promise<unknown>;
  projectRuntime?(projectId: string): Promise<ProjectRuntime>;
  recheckBuild(projectId: string): Promise<{ title: string }[]>;
  emitProject(projectId: string, event: { type: "github"; status: string; message?: string }): unknown;
  subscribe(projectId: string, listener: (event: { type: string }) => void): () => void;
}
export interface GithubGateway {
  repositoryPolicy?: {
    assertPath(path: string): void;
    assertContent(path: string, content: string): void;
    exclusion(path: string): "environment" | "generated" | null;
  };
  request<T = any>(token: string, method: string, path: string, body?: unknown): Promise<T>;
  blobSha(content: string): string;
  decodeBlob(path: string, content: string, encoding: string): string;
  encodeText(content: string): string;
  webUrl(): string;
  pollMs(): number;
  schedule(delay: number, action: () => void): () => void;
  warn(message: string): void;
}
export function createGithubSyncService(repository: GithubRepository, gateway: GithubGateway, project: GithubProjectPorts) {
  const running = new Map<string, Promise<SyncResult>>();
  const edits = new Set<Promise<unknown>>();
  const held = new Set<string>(), pulling = new Set<string>();
  const pushTimers = new Map<string, () => void>(), listeners = new Map<string, () => void>();
  let pollTimer: (() => void) | undefined, polling: Promise<void> | undefined, started = false, generation = 0;
  async function branchHead(token: string, base: string, branch: string): Promise<{ sha: string; tree: string } | null> {
    try {
      const ref = await gateway.request<{ object: { sha: string } }>(token, "GET", `${base}/git/ref/heads/${encodeURIComponent(branch)}`);
      const commit = await gateway.request<{ tree: { sha: string } }>(token, "GET", `${base}/git/commits/${ref.object.sha}`);
      return { sha: ref.object.sha, tree: commit.tree.sha };
    } catch (e) { if (e instanceof GithubError && [404, 409].includes(e.status)) return null; throw e; }
  }
  async function validPath(projectId: string, path: string): Promise<boolean> {
    try {
      if (project.assertValidPathForProject) await project.assertValidPathForProject(projectId, path);
      else project.assertValidPath(path);
      return true;
    } catch { return false; }
  }
  async function pull(projectId: string, token: string, base: string, link: Link, headSha: string, headTree: string, repositoryMode: boolean, remoteModes: Map<string, "100644" | "100755">) {
    const policy = gateway.repositoryPolicy;
    if (repositoryMode && !policy) throw new GithubError("Repository path policy no configurada.", 503);
    const tree = await gateway.request<{ truncated?: boolean; tree: { path: string; type: string; mode?: string; sha: string; size?: number }[] }>(token, "GET", `${base}/git/trees/${headTree}?recursive=1`);
    if (tree.truncated || tree.tree.length > 10000) throw new GithubError("GitHub truncó el árbol del repositorio; no se puede sincronizar sin perder archivos.", 422);
    const present = new Set(tree.tree.map((e) => e.path));
    const remote = new Map<string, string>();
    let total = 0;
    for (const entry of tree.tree) {
      if (repositoryMode) {
        try { policy!.assertPath(entry.path); }
        catch (error) { throw new GithubError((error as Error).message, 422); }
        if (entry.type !== "tree" && (entry.type !== "blob" || (entry.mode && !["100644", "100755"].includes(entry.mode)))) throw new GithubError(`No se admiten enlaces ni submódulos en ${entry.path}.`, 422);
        if (policy!.exclusion(entry.path)) { gateway.warn(`Excluido de sincronización: ${entry.path}`); continue; }
        if (entry.type === "tree") continue;
        total += entry.size ?? 0;
        if ((entry.size ?? 0) > 4 * 1024 * 1024 || total > 64 * 1024 * 1024 || remote.size >= 8000) throw new GithubError("Contenido de repositorio demasiado grande.", 422);
        if (!await validPath(projectId, entry.path)) throw new GithubError(`Ruta de repositorio no válida: ${entry.path}`, 422);
      } else if (entry.type !== "blob" || (entry.size ?? 0) > 1024 * 1024 || !await validPath(projectId, entry.path)) continue;
      remote.set(entry.path, entry.sha);
      remoteModes.set(entry.path, entry.mode === "100755" ? "100755" : "100644");
    }
    const local = await project.readAllFiles(projectId), changed: string[] = [];
    pulling.add(projectId);
    try {
      for (const [path, sha] of remote) {
        if (link.synced[path] === sha) continue;
        if (local[path] !== undefined && gateway.blobSha(local[path]!) === sha) { link.synced[path] = sha; continue; }
        const blob = await gateway.request<{ content: string; encoding: string }>(token, "GET", `${base}/git/blobs/${sha}`);
        const content = repositoryMode ? decodeRepositoryBlob(blob.content, blob.encoding) : gateway.decodeBlob(path, blob.content, blob.encoding);
        if (repositoryMode) {
          try { policy!.assertContent(path, content); }
          catch (error) { throw new GithubError((error as Error).message, 422); }
          const size = content.startsWith("base64:") ? Buffer.byteLength(content.slice(7), "base64") : Buffer.byteLength(content);
          if (size > 4 * 1024 * 1024 || gateway.blobSha(content) !== sha) throw new GithubError(`Contenido incompleto o demasiado grande en ${path}.`, 422);
        }
        await project.writeFile(projectId, path, content, "github", `github@${link.owner}`);
        link.synced[path] = sha;
        changed.push(path);
      }
      for (const path of Object.keys(link.synced)) {
        if (repositoryMode && !await validPath(projectId, path)) { delete link.synced[path]; continue; }
        if (present.has(path)) continue;
        if (local[path] !== undefined && gateway.blobSha(local[path]!) === link.synced[path]) { await project.deleteFile(projectId, path, "github"); changed.push(path); }
        delete link.synced[path];
      }
    } finally { pulling.delete(projectId); }
    if (!changed.length || !link.last_sha) return changed.length ? [{ sha: headSha, message: "Contenido inicial del repositorio", files: changed }] : [];
    const commit = await gateway.request<{ message: string; author?: { name?: string } }>(token, "GET", `${base}/git/commits/${headSha}`);
    const problems = repositoryMode ? [] : await project.recheckBuild(projectId).catch(() => []);
    const card = { type: "github", sha: headSha, message: commit.message.split("\n")[0]!.slice(0, 200), author: commit.author?.name ?? "", url: `${gateway.webUrl()}/${link.owner}/${link.repo}/commit/${headSha}`, files: changed.slice(0, 50), build: repositoryMode ? "pending" : problems.length ? "failed" : "ok", error: problems[0]?.title ?? null };
    await repository.addPullCard(projectId, card);
    project.emitProject(projectId, { type: "github", status: "pulled", message: card.message });
    return [{ sha: headSha, message: card.message, files: changed }];
  }
  async function doSync(projectId: string, opts: { message?: string; pushOnly?: boolean }): Promise<SyncResult> {
    const link = await repository.link(projectId);
    if (!link) throw new GithubError("El proyecto no está conectado a GitHub.", 400);
    const result: SyncResult = { pulled: [], pushed: null };
    try {
      const { token, login } = await repository.token(link.account_id, link.installation_id == null ? null : Number(link.installation_id), link.owner, link.repo), base = `/repos/${link.owner}/${link.repo}`;
      const repositoryMode = await project.projectRuntime?.(projectId) === "repository";
      if (repositoryMode && !gateway.repositoryPolicy) throw new GithubError("Repository path policy no configurada.", 503);
      const remoteModes = new Map<string, "100644" | "100755">();
      let head = await branchHead(token, base, link.branch);
      if (head && head.sha !== link.last_sha) {
        result.pulled = await pull(projectId, token, base, link, head.sha, head.tree, repositoryMode, remoteModes);
        link.last_sha = head.sha; link.last_tree = head.tree;
      } else if (repositoryMode && head) {
        const tree = await gateway.request<{ truncated?: boolean; tree: { path: string; mode?: string }[] }>(token, "GET", `${base}/git/trees/${head.tree}?recursive=1`);
        if (tree.truncated || tree.tree.length > 10000) throw new GithubError("GitHub truncó el árbol; no se pueden preservar los modos de archivo.", 422);
        for (const entry of tree.tree) if (entry.mode === "100755") remoteModes.set(entry.path, "100755");
      }
      const local = await project.readAllFiles(projectId);
      const changes: { path: string; mode: "100644" | "100755"; type: "blob"; sha?: string | null; content?: string }[] = [], nextSynced = { ...link.synced };
      for (const [path, content] of Object.entries(local)) {
        if (repositoryMode) {
          if (!await validPath(projectId, path)) throw new GithubError(`Ruta no válida para sincronización: ${path}`, 422);
          try { gateway.repositoryPolicy!.assertContent(path, content); }
          catch (error) { throw new GithubError((error as Error).message, 422); }
        }
        const sha = gateway.blobSha(content);
        if (link.synced[path] === sha || (content.startsWith("base64:") ? content.length * 0.75 : content.length) > (repositoryMode ? 4 : 1) * 1024 * 1024) continue;
        if (content.startsWith("base64:")) {
          const blob = await gateway.request<{ sha: string }>(token, "POST", `${base}/git/blobs`, { content: content.slice(7), encoding: "base64" });
          changes.push({ path, mode: remoteModes.get(path) ?? "100644", type: "blob", sha: blob.sha });
        } else changes.push({ path, mode: remoteModes.get(path) ?? (repositoryMode && content.startsWith("#!") ? "100755" : "100644"), type: "blob", content });
        nextSynced[path] = sha;
      }
      for (const path of Object.keys(link.synced)) if (!(path in local)) {
        if (!repositoryMode || await validPath(projectId, path)) changes.push({ path, mode: "100644", type: "blob", sha: null });
        delete nextSynced[path];
      }
      if (changes.length) {
        if (!head) {
          await gateway.request(token, "PUT", `${base}/contents/README.md`, { message: "Inicializar repositorio", content: gateway.encodeText(`# ${link.repo}\n\nHecho con Forja.\n`), branch: link.branch });
          head = await branchHead(token, base, link.branch);
          if (!head) throw new GithubError(`No pude crear la rama ${link.branch}.`, 409);
        }
        const tree = await gateway.request<{ sha: string }>(token, "POST", `${base}/git/trees`, { base_tree: head.tree, tree: changes });
        const commit = await gateway.request<{ sha: string }>(token, "POST", `${base}/git/commits`, { message: (opts.message || "Cambios desde Forja").slice(0, 500), tree: tree.sha, parents: [head.sha], author: { name: `${login} (Forja)`, email: `${login}@users.noreply.github.com` } });
        await gateway.request(token, "PATCH", `${base}/git/refs/heads/${encodeURIComponent(link.branch)}`, { sha: commit.sha, force: false });
        result.pushed = { sha: commit.sha, files: changes.map((c) => c.path) };
        link.last_sha = commit.sha; link.last_tree = tree.sha; link.synced = nextSynced;
      } else if (head && !link.last_sha) { link.last_sha = head.sha; link.last_tree = head.tree; }
      await repository.saveSync(projectId, link);
      project.emitProject(projectId, { type: "github", status: "ok" });
      return result;
    } catch (e) {
      const status = e instanceof GithubError && [401, 403, 404].includes(e.status) ? "lost_access" : "error";
      const message = status === "lost_access" ? "Forja perdió el acceso a GitHub. Vuelve a conectar tu cuenta." : (e as Error).message;
      await repository.failSync(projectId, status, message.slice(0, 500));
      project.emitProject(projectId, { type: "github", status, message });
      throw e instanceof GithubError ? new GithubError(message, e.status) : e;
    }
  }
  function syncProject(projectId: string, opts: { message?: string; pushOnly?: boolean } = {}) {
    const prev = running.get(projectId) ?? Promise.resolve(null as unknown as SyncResult);
    const next = prev.catch(() => null).then(() => doSync(projectId, opts));
    running.set(projectId, next);
    return next.finally(() => { if (running.get(projectId) === next) running.delete(projectId); });
  }
  function holdSync(projectId: string) { held.add(projectId); pushTimers.get(projectId)?.(); pushTimers.delete(projectId); }
  async function releaseSync(projectId: string, message: string) {
    held.delete(projectId); pushTimers.get(projectId)?.(); pushTimers.delete(projectId);
    if ((await repository.link(projectId))?.status !== "ok") return;
    await syncProject(projectId, { message }).catch((e) => gateway.warn(`[github] ${projectId}: ${(e as Error).message}`));
  }
  function watchLinked(projectId: string) {
    if (listeners.has(projectId)) return;
    listeners.set(projectId, project.subscribe(projectId, (e) => {
      if (e.type !== "files" || held.has(projectId) || pulling.has(projectId)) return;
      pushTimers.get(projectId)?.();
      const epoch = generation;
      pushTimers.set(projectId, gateway.schedule(5000, () => {
        pushTimers.delete(projectId);
        if (held.has(projectId) || epoch !== generation) return;
        const work = repository.link(projectId).then((link) => {
          if (epoch === generation && !held.has(projectId) && link?.status === "ok") return syncProject(projectId, { message: "Edición en Forja" });
        }).catch(() => {});
        edits.add(work);
        void work.finally(() => edits.delete(work));
      }));
    }));
  }
  function tick() {
    if (!started || polling) return;
    const epoch = generation;
    polling = (async () => {
      for (const p of await repository.linkedProjects().catch(() => [])) {
        if (!started || epoch !== generation) break;
        watchLinked(p);
        if (!held.has(p) && !running.has(p)) await syncProject(p).catch(() => {});
      }
    })().finally(() => {
      polling = undefined;
      if (started && epoch === generation) pollTimer = gateway.schedule(gateway.pollMs(), tick);
    });
  }
  function startGithubSync() { if (started) return; started = true; tick(); }
  function reschedulePoll() { if (!started) return; pollTimer?.(); if (!polling) pollTimer = gateway.schedule(gateway.pollMs(), tick); }
  async function stopGithubSync() {
    started = false; generation++; pollTimer?.(); pollTimer = undefined;
    for (const cancel of pushTimers.values()) cancel(); pushTimers.clear();
    for (const unsubscribe of listeners.values()) unsubscribe(); listeners.clear();
    await polling;
    await Promise.allSettled([...edits]);
    await Promise.allSettled([...running.values()]);
    held.clear(); pulling.clear();
  }
  return { syncProject, holdSync, releaseSync, watchLinked, startGithubSync, stopGithubSync, reschedulePoll };
}
