import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { config } from "../../../shared/config.js";
import { decrypt, encrypt } from "../../../shared/crypto.js";
import { one, q } from "../../../shared/database/index.js";
import { GithubError, type GithubGateway, type GithubRepository, type Link } from "../application/github.js";
import type { GithubAccountRepository, GithubAuthorization } from "../application/accounts.js";
export async function gh<T = any>(token: string, method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${config.github.apiUrl}${path}`, {
    method,
    headers: { authorization: `Bearer ${token}`, accept: "application/vnd.github+json", "x-github-api-version": "2022-11-28", "user-agent": "forja", ...(body === undefined ? {} : { "content-type": "application/json" }) },
    body: body === undefined ? undefined : JSON.stringify(body), signal: AbortSignal.timeout(30_000),
  });
  if (res.status === 204) return undefined as T;
  const data = await res.json().catch(() => ({})) as { message?: string };
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
  link: (p) => one<Link>(`select * from project_github where project_id = $1`, [p]), token: tokenFor,
  async saveSync(p, link) { await q(`update project_github set last_sha = $2, last_tree = $3, synced = $4, status = 'ok', error = null, synced_at = now() where project_id = $1`, [p, link.last_sha, link.last_tree, JSON.stringify(link.synced)]); },
  async failSync(p, status, message) { await q(`update project_github set status = $2, error = $3 where project_id = $1`, [p, status, message]); },
  async linkedProjects() { return (await q<{ project_id: string }>(`select project_id from project_github where status = 'ok'`)).map((r) => r.project_id); },
  async addPullCard(p, card) { await q(`insert into chat_messages (project_id, role, content) values ($1, 'assistant', $2)`, [p, JSON.stringify([card])]); },
};
export const githubGateway: GithubGateway = {
  request: gh, blobSha,
  decodeBlob(path, content, encoding) {
    const bytes = Buffer.from(content, encoding === "base64" ? "base64" : "utf8");
    const text = /\.(tsx?|jsx?|css|md|json|txt|svg|html|csv|ya?ml|mjs|cjs)$/i.test(path) ? bytes.toString("utf8") : null;
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
  async saveLink(p, a, owner, repo, branch) {
    await q(`insert into project_github (project_id, account_id, owner, repo, branch) values ($1, $2, $3, $4, $5)
     on conflict (project_id) do update set account_id = excluded.account_id, owner = excluded.owner, repo = excluded.repo, branch = excluded.branch,
       last_sha = null, last_tree = null, synced = '{}', status = 'ok', error = null`, [p, a, owner, repo, branch]);
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
