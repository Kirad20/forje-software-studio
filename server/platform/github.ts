import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { config } from "../config.js";
import { decrypt, encrypt } from "../lib/crypto.js";
import { one, q } from "./db.js";
import { emitProject, projectEvents } from "./events.js";
import { recheckBuild } from "./problems.js";
import { assertValidPath, deleteFile, readAllFiles, writeFile } from "./projects.js";

/**
 * Two-way sync between a project and a GitHub repository, through the REST API only
 * (no git binary, no disk): every change made in Forja becomes a commit on the branch,
 * and commits pushed from anywhere else come back into the project, each one shown in
 * the chat with its build result. Only project paths (pages/, components/, endpoints/…)
 * are synced; anything else in the repo (README, CI…) is left untouched.
 */

export class GithubError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

interface Link {
  project_id: string;
  account_id: string;
  owner: string;
  repo: string;
  branch: string;
  last_sha: string | null;
  last_tree: string | null;
  synced: Record<string, string>;
  status: string;
  error: string | null;
  synced_at: string | null;
}

const MAX_FILE = 1024 * 1024;
const TEXT = /\.(tsx?|jsx?|css|md|json|txt|svg|html|csv|ya?ml|mjs|cjs)$/i;

/** The git blob id of a file, so both sides can be compared without downloading anything. */
export function blobSha(content: string): string {
  const bytes = content.startsWith("base64:") ? Buffer.from(content.slice(7), "base64") : Buffer.from(content, "utf8");
  return createHash("sha1").update(`blob ${bytes.byteLength}\0`).update(bytes).digest("hex");
}

// --- API -----------------------------------------------------------------------------------

async function gh<T = any>(token: string, method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${config.github.apiUrl}${path}`, {
    method,
    headers: {
      authorization: `Bearer ${token}`,
      accept: "application/vnd.github+json",
      "x-github-api-version": "2022-11-28",
      "user-agent": "forja",
      ...(body === undefined ? {} : { "content-type": "application/json" }),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(30_000),
  });
  if (res.status === 204) return undefined as T;
  const data = (await res.json().catch(() => ({}))) as { message?: string };
  if (!res.ok) throw new GithubError(data.message ?? `GitHub respondió ${res.status}`, res.status);
  return data as T;
}

async function tokenFor(accountId: string): Promise<{ token: string; login: string }> {
  const row = await one<{ token_enc: string; login: string }>(`select token_enc, login from github_accounts where account_id = $1`, [accountId]);
  if (!row) throw new GithubError("La cuenta no tiene GitHub conectado.", 401);
  return { token: decrypt(row.token_enc), login: row.login };
}

// --- Account connection ----------------------------------------------------------------------

/** Validates a token (personal access token or OAuth) and stores it encrypted. */
export async function connectAccount(accountId: string, token: string): Promise<{ login: string }> {
  const t = token.trim();
  if (!/^[\w-]{20,255}$/.test(t)) throw new GithubError("Ese token no parece válido.", 400);
  const user = await gh<{ login: string }>(t, "GET", "/user");
  await q(
    `insert into github_accounts (account_id, login, token_enc) values ($1, $2, $3)
     on conflict (account_id) do update set login = excluded.login, token_enc = excluded.token_enc, created_at = now()`,
    [accountId, user.login, encrypt(t)],
  );
  // Linked projects that had lost access can sync again.
  await q(`update project_github set status = 'ok', error = null where account_id = $1 and status = 'lost_access'`, [accountId]);
  return { login: user.login };
}

export async function disconnectAccount(accountId: string) {
  await q(`delete from github_accounts where account_id = $1`, [accountId]);
}

export async function accountStatus(accountId: string) {
  const row = await one<{ login: string }>(`select login from github_accounts where account_id = $1`, [accountId]);
  return { connected: !!row, login: row?.login ?? null, oauth: !!config.github.clientId };
}

/** OAuth: the authorize URL (state is signed so the callback can trust it). */
export function oauthStart(accountId: string): string {
  const state = `${accountId}.${Date.now()}`;
  const sig = createHmac("sha256", config.secretsKey).update(state).digest("base64url");
  const u = new URL(`${config.github.webUrl}/login/oauth/authorize`);
  u.searchParams.set("client_id", config.github.clientId);
  u.searchParams.set("scope", "repo");
  u.searchParams.set("redirect_uri", `${config.publicUrl}/api/github/oauth/callback`);
  u.searchParams.set("state", `${state}.${sig}`);
  return u.toString();
}

export async function oauthFinish(accountId: string, code: string, state: string) {
  const [acc, at, sig] = state.split(".");
  const expected = createHmac("sha256", config.secretsKey).update(`${acc}.${at}`).digest("base64url");
  if (acc !== accountId || !sig || sig.length !== expected.length || !timingSafeEqual(Buffer.from(sig), Buffer.from(expected)) || Date.now() - Number(at) > 10 * 60_000) {
    throw new GithubError("La autorización caducó o no es válida. Vuelve a intentarlo.", 400);
  }
  const res = await fetch(`${config.github.webUrl}/login/oauth/access_token`, {
    method: "POST",
    headers: { accept: "application/json", "content-type": "application/json" },
    body: JSON.stringify({ client_id: config.github.clientId, client_secret: config.github.clientSecret, code }),
  });
  const data = (await res.json()) as { access_token?: string; error_description?: string };
  if (!data.access_token) throw new GithubError(data.error_description ?? "GitHub no devolvió un token.", 400);
  return connectAccount(accountId, data.access_token);
}

// --- Project link ------------------------------------------------------------------------------

export async function getLink(projectId: string) {
  const l = await one<Link>(`select * from project_github where project_id = $1`, [projectId]);
  if (!l) return null;
  return {
    owner: l.owner,
    repo: l.repo,
    branch: l.branch,
    url: `${config.github.webUrl}/${l.owner}/${l.repo}`,
    lastSha: l.last_sha,
    status: l.status,
    error: l.error,
    syncedAt: l.synced_at,
    files: Object.keys(l.synced).length,
  };
}

/** Creates a repository for the project (initialized, so the Git Data API works) and pushes everything. */
export async function createRepo(projectId: string, accountId: string, input: { name: string; private?: boolean; description?: string }) {
  const { token, login } = await tokenFor(accountId);
  const name = input.name.trim().replace(/[^\w.-]+/g, "-").slice(0, 100);
  if (!name) throw new GithubError("Pon un nombre al repositorio.", 400);
  const repo = await gh<{ name: string; owner: { login: string }; default_branch: string }>(token, "POST", "/user/repos", {
    name,
    private: input.private !== false,
    description: (input.description ?? "").slice(0, 300) || "Proyecto creado con Forja",
    auto_init: true,
  });
  await saveLink(projectId, accountId, repo.owner.login ?? login, repo.name, repo.default_branch || "main");
  return syncProject(projectId, { message: "Proyecto inicial desde Forja" });
}

/** Links an existing repository: what is on GitHub comes in first, then Forja's own files go up. */
export async function linkRepo(projectId: string, accountId: string, input: { repo: string; branch?: string }) {
  const { token } = await tokenFor(accountId);
  const m = /^(?:https?:\/\/[^/]+\/)?([\w.-]+)\/([\w.-]+?)(?:\.git)?\/?$/.exec(input.repo.trim());
  if (!m) throw new GithubError("Escribe el repositorio como dueño/nombre.", 400);
  const repo = await gh<{ name: string; owner: { login: string }; default_branch: string; permissions?: { push?: boolean } }>(token, "GET", `/repos/${m[1]}/${m[2]}`);
  if (repo.permissions && !repo.permissions.push) throw new GithubError("Tu cuenta de GitHub no puede escribir en ese repositorio.", 403);
  await saveLink(projectId, accountId, repo.owner.login, repo.name, input.branch?.trim() || repo.default_branch || "main");
  return syncProject(projectId, { message: "Conectar con Forja" });
}

async function saveLink(projectId: string, accountId: string, owner: string, repo: string, branch: string) {
  await q(
    `insert into project_github (project_id, account_id, owner, repo, branch) values ($1, $2, $3, $4, $5)
     on conflict (project_id) do update set account_id = excluded.account_id, owner = excluded.owner, repo = excluded.repo, branch = excluded.branch,
       last_sha = null, last_tree = null, synced = '{}', status = 'ok', error = null`,
    [projectId, accountId, owner, repo, branch],
  );
}

export async function unlink(projectId: string) {
  await q(`delete from project_github where project_id = $1`, [projectId]);
}

// --- Sync ----------------------------------------------------------------------------------------

const running = new Map<string, Promise<SyncResult>>();
const held = new Set<string>();
const pushTimers = new Map<string, NodeJS.Timeout>();
/** Paths being written by a pull, so they do not bounce straight back as a push. */
const pulling = new Set<string>();

export interface SyncResult {
  pulled: { sha: string; message: string; files: string[] }[];
  pushed: { sha: string; files: string[] } | null;
}

/**
 * Pull then push, one at a time per project. `message` names the commit for Forja's changes.
 */
export function syncProject(projectId: string, opts: { message?: string; pushOnly?: boolean } = {}): Promise<SyncResult> {
  const prev = running.get(projectId) ?? Promise.resolve(null as unknown as SyncResult);
  const next = prev.catch(() => null).then(() => doSync(projectId, opts));
  running.set(projectId, next);
  return next.finally(() => running.get(projectId) === next && running.delete(projectId));
}

async function doSync(projectId: string, opts: { message?: string; pushOnly?: boolean }): Promise<SyncResult> {
  const link = await one<Link>(`select * from project_github where project_id = $1`, [projectId]);
  if (!link) throw new GithubError("El proyecto no está conectado a GitHub.", 400);
  const result: SyncResult = { pulled: [], pushed: null };
  try {
    const { token, login } = await tokenFor(link.account_id);
    const base = `/repos/${link.owner}/${link.repo}`;
    let head = await branchHead(token, base, link.branch);

    // 1. Pull: commits that arrived on GitHub since the last agreed commit.
    if (head && head.sha !== link.last_sha) {
      result.pulled = await pull(projectId, token, base, link, head.sha, head.tree);
      link.last_sha = head.sha;
      link.last_tree = head.tree;
    }

    // 2. Push: Forja's files that differ from the last synced state.
    const local = await readAllFiles(projectId);
    const changes: { path: string; mode: "100644"; type: "blob"; sha?: string | null; content?: string }[] = [];
    const nextSynced = { ...link.synced };
    for (const [path, content] of Object.entries(local)) {
      const sha = blobSha(content);
      if (link.synced[path] === sha) continue;
      const bytes = content.startsWith("base64:") ? content.length * 0.75 : content.length;
      if (bytes > MAX_FILE) continue;
      if (content.startsWith("base64:")) {
        const blob = await gh<{ sha: string }>(token, "POST", `${base}/git/blobs`, { content: content.slice(7), encoding: "base64" });
        changes.push({ path, mode: "100644", type: "blob", sha: blob.sha });
      } else changes.push({ path, mode: "100644", type: "blob", content });
      nextSynced[path] = sha;
    }
    for (const path of Object.keys(link.synced)) {
      if (!(path in local)) {
        changes.push({ path, mode: "100644", type: "blob", sha: null });
        delete nextSynced[path];
      }
    }
    if (changes.length) {
      if (!head) {
        // An empty repository has no branch yet: the contents API creates the first commit.
        await gh(token, "PUT", `${base}/contents/README.md`, {
          message: "Inicializar repositorio",
          content: Buffer.from(`# ${link.repo}\n\nHecho con Forja.\n`).toString("base64"),
          branch: link.branch,
        });
        head = await branchHead(token, base, link.branch);
        if (!head) throw new GithubError(`No pude crear la rama ${link.branch}.`, 409);
      }
      const tree = await gh<{ sha: string }>(token, "POST", `${base}/git/trees`, { base_tree: head.tree, tree: changes });
      const commit = await gh<{ sha: string }>(token, "POST", `${base}/git/commits`, {
        message: (opts.message || "Cambios desde Forja").slice(0, 500),
        tree: tree.sha,
        parents: [head.sha],
        author: { name: `${login} (Forja)`, email: `${login}@users.noreply.github.com` },
      });
      await gh(token, "PATCH", `${base}/git/refs/heads/${encodeURIComponent(link.branch)}`, { sha: commit.sha, force: false });
      result.pushed = { sha: commit.sha, files: changes.map((c) => c.path) };
      link.last_sha = commit.sha;
      link.last_tree = tree.sha;
      link.synced = nextSynced;
    } else if (head && !link.last_sha) {
      link.last_sha = head.sha;
      link.last_tree = head.tree;
    }
    await q(
      `update project_github set last_sha = $2, last_tree = $3, synced = $4, status = 'ok', error = null, synced_at = now() where project_id = $1`,
      [projectId, link.last_sha, link.last_tree, JSON.stringify(link.synced)],
    );
    emitProject(projectId, { type: "github", status: "ok" });
    return result;
  } catch (e) {
    const err = e as Error;
    const status = e instanceof GithubError && e.status === 401 ? "lost_access" : "error";
    const message = status === "lost_access" ? "Forja perdió el acceso a GitHub. Vuelve a conectar tu cuenta." : err.message;
    await q(`update project_github set status = $2, error = $3 where project_id = $1`, [projectId, status, message.slice(0, 500)]);
    emitProject(projectId, { type: "github", status, message });
    throw e instanceof GithubError ? new GithubError(message, e.status) : e;
  }
}

async function branchHead(token: string, base: string, branch: string): Promise<{ sha: string; tree: string } | null> {
  try {
    const ref = await gh<{ object: { sha: string } }>(token, "GET", `${base}/git/ref/heads/${encodeURIComponent(branch)}`);
    const commit = await gh<{ tree: { sha: string } }>(token, "GET", `${base}/git/commits/${ref.object.sha}`);
    return { sha: ref.object.sha, tree: commit.tree.sha };
  } catch (e) {
    // 404: no such branch; 409: the repository is empty.
    if (e instanceof GithubError && (e.status === 404 || e.status === 409)) return null;
    throw e;
  }
}

const projectPath = (p: string) => {
  try {
    assertValidPath(p);
    return true;
  } catch {
    return false;
  }
};

/** Applies the remote tree to the project and posts one chat card per pull, with the build result. */
async function pull(projectId: string, token: string, base: string, link: Link, headSha: string, headTree: string) {
  const tree = await gh<{ tree: { path: string; type: string; sha: string; size?: number }[]; truncated?: boolean }>(token, "GET", `${base}/git/trees/${headTree}?recursive=1`);
  const remote = new Map(tree.tree.filter((e) => e.type === "blob" && projectPath(e.path) && (e.size ?? 0) <= MAX_FILE).map((e) => [e.path, e.sha]));
  const local = await readAllFiles(projectId);
  const changed: string[] = [];
  const author = `github@${link.owner}`;
  pulling.add(projectId);
  try {
    for (const [path, sha] of remote) {
      if (link.synced[path] === sha) continue;
      if (local[path] !== undefined && blobSha(local[path]!) === sha) {
        link.synced[path] = sha;
        continue;
      }
      // Remote wins on conflict: it is an explicit commit; the previous version stays in the history.
      const blob = await gh<{ content: string; encoding: string }>(token, "GET", `${base}/git/blobs/${sha}`);
      const bytes = Buffer.from(blob.content, blob.encoding === "base64" ? "base64" : "utf8");
      const text = TEXT.test(path) ? bytes.toString("utf8") : null;
      const content = text !== null && !text.includes("�") ? text : `base64:${bytes.toString("base64")}`;
      await writeFile(projectId, path, content, "github", author);
      link.synced[path] = sha;
      changed.push(path);
    }
    for (const path of Object.keys(link.synced)) {
      if (remote.has(path)) continue;
      // Deleted on GitHub (only if Forja has not changed it since the last sync).
      if (local[path] !== undefined && blobSha(local[path]!) === link.synced[path]) {
        await deleteFile(projectId, path, "github");
        changed.push(path);
      }
      delete link.synced[path];
    }
  } finally {
    pulling.delete(projectId);
  }
  if (!changed.length || !link.last_sha) return changed.length ? [{ sha: headSha, message: "Contenido inicial del repositorio", files: changed }] : [];

  const commit = await gh<{ message: string; author?: { name?: string } }>(token, "GET", `${base}/git/commits/${headSha}`);
  const problems = await recheckBuild(projectId).catch(() => []);
  const card = {
    type: "github",
    sha: headSha,
    message: commit.message.split("\n")[0]!.slice(0, 200),
    author: commit.author?.name ?? "",
    url: `${config.github.webUrl}/${link.owner}/${link.repo}/commit/${headSha}`,
    files: changed.slice(0, 50),
    build: problems.length ? "failed" : "ok",
    error: problems[0]?.title ?? null,
  };
  await q(`insert into chat_messages (project_id, role, content) values ($1, 'assistant', $2)`, [projectId, JSON.stringify([card])]);
  emitProject(projectId, { type: "github", status: "pulled", message: card.message });
  return [{ sha: headSha, message: card.message, files: changed }];
}

// --- Triggers ------------------------------------------------------------------------------------

/** While the builder works, its writes wait; when the turn ends they go up as one commit. */
export function holdSync(projectId: string) {
  held.add(projectId);
}

export async function releaseSync(projectId: string, message: string) {
  held.delete(projectId);
  clearTimeout(pushTimers.get(projectId));
  if (!(await one(`select 1 from project_github where project_id = $1 and status = 'ok'`, [projectId]))) return;
  await syncProject(projectId, { message }).catch((e) => console.warn(`[github] ${projectId}: ${(e as Error).message}`));
}

const listening = new Set<string>();

/** Other edits (code editor, MCP, restores) are pushed after a few quiet seconds. */
function listen(projectId: string) {
  if (listening.has(projectId)) return;
  listening.add(projectId);
  projectEvents.on(projectId, (e) => {
    if (e.type !== "files" || held.has(projectId) || pulling.has(projectId)) return;
    clearTimeout(pushTimers.get(projectId));
    pushTimers.set(
      projectId,
      setTimeout(() => {
        if (held.has(projectId)) return;
        void one(`select 1 from project_github where project_id = $1 and status = 'ok'`, [projectId]).then(
          (linked) => linked && syncProject(projectId, { message: "Edición en Forja" }).catch(() => {}),
        );
      }, 5_000),
    );
  });
}

/** Webhook from GitHub (push event): pulls the projects linked to that repository and branch. */
export async function handleWebhook(rawBody: string, signature: string | undefined) {
  if (!config.github.webhookSecret) throw new GithubError("Webhook no configurado.", 404);
  const expected = `sha256=${createHmac("sha256", config.github.webhookSecret).update(rawBody).digest("hex")}`;
  if (!signature || signature.length !== expected.length || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) throw new GithubError("Firma no válida.", 401);
  const body = JSON.parse(rawBody) as { ref?: string; repository?: { name?: string; owner?: { login?: string; name?: string } } };
  const branch = body.ref?.replace(/^refs\/heads\//, "");
  const owner = body.repository?.owner?.login ?? body.repository?.owner?.name;
  const rows = await q<{ project_id: string }>(`select project_id from project_github where lower(owner) = lower($1) and lower(repo) = lower($2) and branch = $3`, [
    owner ?? "",
    body.repository?.name ?? "",
    branch ?? "",
  ]);
  for (const r of rows) void syncProject(r.project_id).catch(() => {});
  return rows.length;
}

let poller: NodeJS.Timeout | undefined;

/** Starts listeners for linked projects and polls them for commits pushed elsewhere. */
export function startGithubSync() {
  const tick = async () => {
    const rows = await q<{ project_id: string }>(`select project_id from project_github where status = 'ok'`).catch(() => []);
    for (const r of rows) {
      listen(r.project_id);
      if (!held.has(r.project_id) && !running.has(r.project_id)) await syncProject(r.project_id).catch(() => {});
    }
  };
  void tick();
  clearInterval(poller);
  poller = setInterval(() => void tick(), config.github.pollMs).unref();
}

/** The poll interval changed: keep polling at the new pace (only if polling had started). */
export function reschedulePoll() {
  if (poller) startGithubSync();
}

/** Called after linking so edits start syncing without waiting for the next poll. */
export const watchLinked = listen;
