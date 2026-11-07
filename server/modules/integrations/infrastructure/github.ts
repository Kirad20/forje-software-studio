import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { config } from "../../../shared/config.js";
import { decrypt, encrypt } from "../../../shared/crypto.js";
import { one, q } from "../../../shared/database/index.js";
import { GithubError, type GithubGateway, type GithubRepository, type Link } from "../application/github.js";
import type { GithubAccountRepository, GithubAuthorization } from "../application/accounts.js";
import { githubAppStore } from "./apps.js";
export async function gh<T = any>(token: string, method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${config.github.apiUrl}${path}`, {
    method,
    headers: { authorization: `Bearer ${token}`, accept: "application/vnd.github+json", "x-github-api-version": "2022-11-28", "user-agent": "forja", ...(body === undefined ? {} : { "content-type": "application/json" }) },
    body: body === undefined ? undefined : JSON.stringify(body), signal: AbortSignal.timeout(30_000),
  });
  if (res.status === 204) return undefined as T;
  if (Number(res.headers.get("content-length") ?? 0) > 16 * 1024 * 1024) { await res.body?.cancel(); throw new GithubError("La respuesta de GitHub supera el límite permitido.", 422); }
  const chunks: Uint8Array[] = [];
  let bytes = 0;
  if (res.body) for await (const chunk of res.body) {
    bytes += chunk.byteLength;
    if (bytes > 16 * 1024 * 1024) { throw new GithubError("La respuesta de GitHub supera el límite permitido.", 422); }
    chunks.push(chunk);
  }
  const text = Buffer.concat(chunks).toString("utf8");
  let data: { message?: string };
  try { data = JSON.parse(text || "{}"); }
  catch { if (res.ok) throw new GithubError("GitHub no devolvió JSON válido.", 502); data = {}; }
  if (!res.ok) throw new GithubError(data.message ?? `GitHub respondió ${res.status}`, res.status);
  return data as T;
}
export function blobSha(content: string): string {
  const bytes = content.startsWith("base64:") ? Buffer.from(content.slice(7), "base64") : Buffer.from(content, "utf8");
  return createHash("sha1").update(`blob ${bytes.byteLength}\0`).update(bytes).digest("hex");
}
async function tokenFor(accountId: string) {
  const row = await one<{ token_enc: string; login: string }>(`select token_enc, login from github_accounts where account_id = $1`, [accountId]);
  if (!row) throw new GithubError("La cuenta no tiene GitHub conectado.", 401);
  return { token: decrypt(row.token_enc), login: row.login };
}
export const githubRepository: GithubRepository = {
  link: (p) => one<Link>(`select * from project_github where project_id = $1`, [p]),
  async token(a, id, owner, repo) {
    if (id == null) return tokenFor(a);
    const i = (await githubAppStore.installations(a)).find((i) => i.id === id), app = await githubAppStore.app(a);
    if (!i || !app) throw new GithubError("Reinstala tu GitHub App y selecciona este repositorio.", 403);
    const jwt = await githubAppStore.appToken(a);
    try {
      const remote = await gh<{ app_id: number; suspended_at?: string; permissions?: { contents?: string } }>(jwt, "GET", `/app/installations/${id}`);
      if (remote.app_id !== app.id || remote.suspended_at || remote.permissions?.contents !== "write") throw new GithubError("La instalación ya no permite escribir.", 403);
    } catch (e) {
      if (e instanceof GithubError && [401, 403, 404].includes(e.status)) await githubAppStore.removeInstallation(a, id);
      throw e;
    }
    const selected = await gh<{ id: number }>(jwt, "GET", `/repos/${owner}/${repo}/installation`);
    if (selected.id !== id) throw new GithubError("El repositorio ya no está seleccionado en esta instalación.", 403);
    return { token: await githubAppStore.installationToken(a, id), login: i.login };
  },
  async saveSync(p, link) { await q(`update project_github set last_sha = $2, last_tree = $3, synced = $4, status = 'ok', error = null, synced_at = now() where project_id = $1`, [p, link.last_sha, link.last_tree, JSON.stringify(link.synced)]); },
  async failSync(p, status, message) { await q(`update project_github set status = $2, error = $3 where project_id = $1`, [p, status, message]); },
  async linkedProjects() { return (await q<{ project_id: string }>(`select project_id from project_github where status = 'ok'`)).map((r) => r.project_id); },
  async addPullCard(p, card) { await q(`insert into chat_messages (project_id, role, content) values ($1, 'assistant', $2)`, [p, JSON.stringify([card])]); },
};
export const githubGateway: GithubGateway = {
  request: gh, blobSha,
  decodeBlob(path, content, encoding) {
    const bytes = Buffer.from(content, encoding === "base64" ? "base64" : "utf8");
    const text = /\.(tsx?|jsx?|css|md|json|txt|svg|html|csv|ya?ml|mjs|cjs|sql)$/i.test(path) ? bytes.toString("utf8") : null;
    return text !== null && !text.includes("�") ? text : `base64:${bytes.toString("base64")}`;
  },
  encodeText: (content) => Buffer.from(content).toString("base64"),
  webUrl: () => config.github.webUrl, pollMs: () => config.github.pollMs,
  schedule(delay, action) { const timer = setTimeout(action, delay).unref(); return () => clearTimeout(timer); },
  warn: (message) => console.warn(message),
};
export const githubAccountRepository: GithubAccountRepository = {
  token: tokenFor, link: githubRepository.link,
  account: (a) => one<{ login: string }>(`select login from github_accounts where account_id = $1`, [a]),
  async connect(a, login, token) {
    await q(`insert into github_accounts (account_id, login, token_enc) values ($1, $2, $3)
     on conflict (account_id) do update set login = excluded.login, token_enc = excluded.token_enc, created_at = now()`, [a, login, encrypt(token)]);
    await q(`update project_github set status = 'ok', error = null where account_id = $1 and status = 'lost_access'`, [a]);
  },
  async disconnect(a) { await q(`delete from github_accounts where account_id = $1`, [a]); },
  async saveLink(p, a, owner, repo, branch, installationId = null, baseline) {
    await q(`insert into project_github (project_id, account_id, owner, repo, branch, installation_id, last_sha, last_tree, synced) values ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     on conflict (project_id) do update set account_id = excluded.account_id, owner = excluded.owner, repo = excluded.repo, branch = excluded.branch,
       installation_id = excluded.installation_id, last_sha = excluded.last_sha, last_tree = excluded.last_tree, synced = excluded.synced, status = 'ok', error = null`, [p, a, owner, repo, branch, installationId, baseline?.last_sha ?? null, baseline?.last_tree ?? null, JSON.stringify(baseline?.synced ?? {})]);
  },
  async unlink(p) { await q(`delete from project_github where project_id = $1`, [p]); },
  async webhookLinks(owner, repo, branch) { return (await q<{ project_id: string }>(`select project_id from project_github where lower(owner) = lower($1) and lower(repo) = lower($2) and branch = $3`, [owner, repo, branch])).map((r) => r.project_id); },
};
export const githubAuthorization: GithubAuthorization = {
  now: () => Date.now(), oauthEnabled: () => !!config.github.clientId,
  signState: (state) => createHmac("sha256", config.secretsKey).update(state).digest("base64url"),
  sameSignature(a, b) { const left = Buffer.from(a), right = Buffer.from(b); return left.length === right.length && timingSafeEqual(left, right); },
  authorizeUrl(state) {
    const u = new URL(`${config.github.webUrl}/login/oauth/authorize`);
    u.searchParams.set("client_id", config.github.clientId); u.searchParams.set("scope", "repo");
    u.searchParams.set("redirect_uri", `${config.publicUrl}/api/github/oauth/callback`); u.searchParams.set("state", state);
    return u.toString();
  },
  async exchange(code) {
    const response = await fetch(`${config.github.webUrl}/login/oauth/access_token`, { method: "POST", headers: { accept: "application/json", "content-type": "application/json" }, body: JSON.stringify({ client_id: config.github.clientId, client_secret: config.github.clientSecret, code }), signal: AbortSignal.timeout(30_000) });
    return response.json() as Promise<{ access_token?: string; error_description?: string }>;
  },
  webhookSignature: (body) => config.github.webhookSecret ? `sha256=${createHmac("sha256", config.github.webhookSecret).update(body).digest("hex")}` : null,
};
