import { GithubError, type GithubGateway, type Link, type SyncResult } from "./github.js";
export interface GithubAccountRepository {
  token(accountId: string): Promise<{ token: string; login: string }>;
  account(accountId: string): Promise<{ login: string } | null | undefined>;
  connect(accountId: string, login: string, token: string): Promise<void>;
  disconnect(accountId: string): Promise<void>;
  link(projectId: string): Promise<Link | null | undefined>;
  saveLink(projectId: string, accountId: string, owner: string, repo: string, branch: string): Promise<void>;
  unlink(projectId: string): Promise<void>;
  webhookLinks(owner: string, repo: string, branch: string): Promise<string[]>;
}
export interface GithubAuthorization {
  now(): number; oauthEnabled(): boolean; signState(state: string): string; sameSignature(a: string, b: string): boolean;
  authorizeUrl(state: string): string; exchange(code: string): Promise<{ access_token?: string; error_description?: string }>;
  webhookSignature(body: string): string | null;
}
export function createGithubAccountService(repository: GithubAccountRepository, gateway: GithubGateway, auth: GithubAuthorization, sync: (p: string, opts?: { message?: string }) => Promise<SyncResult>) {
  async function connectAccount(accountId: string, token: string) {
    const t = token.trim();
    if (!/^[\w-]{20,255}$/.test(t)) throw new GithubError("Ese token no parece válido.", 400);
    const user = await gateway.request<{ login: string }>(t, "GET", "/user");
    await repository.connect(accountId, user.login, t);
    return { login: user.login };
  }
  return {
    connectAccount, disconnectAccount: (a: string) => repository.disconnect(a),
    async accountStatus(a: string) { const row = await repository.account(a); return { connected: !!row, login: row?.login ?? null, oauth: auth.oauthEnabled() }; },
    oauthStart(a: string) { const state = `${a}.${auth.now()}`; return auth.authorizeUrl(`${state}.${auth.signState(state)}`); },
    async oauthFinish(a: string, code: string, state: string) {
      const [acc, at, sig] = state.split("."), expected = auth.signState(`${acc}.${at}`);
      if (acc !== a || !sig || !auth.sameSignature(sig, expected) || !Number.isFinite(Number(at)) || auth.now() - Number(at) > 10 * 60_000 || Number(at) > auth.now()) throw new GithubError("La autorización caducó o no es válida. Vuelve a intentarlo.", 400);
      const data = await auth.exchange(code);
      if (!data.access_token) throw new GithubError(data.error_description ?? "GitHub no devolvió un token.", 400);
      return connectAccount(a, data.access_token);
    },
    async getLink(p: string) {
      const l = await repository.link(p);
      return l ? { owner: l.owner, repo: l.repo, branch: l.branch, url: `${gateway.webUrl()}/${l.owner}/${l.repo}`, lastSha: l.last_sha, status: l.status, error: l.error, syncedAt: l.synced_at, files: Object.keys(l.synced).length } : null;
    },
    async createRepo(p: string, a: string, input: { name: string; private?: boolean; description?: string }) {
      const { token, login } = await repository.token(a), name = input.name.trim().replace(/[^\w.-]+/g, "-").slice(0, 100);
      if (!name) throw new GithubError("Pon un nombre al repositorio.", 400);
      const repo = await gateway.request<{ name: string; owner: { login: string }; default_branch: string }>(token, "POST", "/user/repos", { name, private: input.private !== false, description: (input.description ?? "").slice(0, 300) || "Proyecto creado con Forja", auto_init: true });
      await repository.saveLink(p, a, repo.owner.login ?? login, repo.name, repo.default_branch || "main");
      return sync(p, { message: "Proyecto inicial desde Forja" });
    },
    async linkRepo(p: string, a: string, input: { repo: string; branch?: string }) {
      const { token } = await repository.token(a), m = /^(?:https?:\/\/[^/]+\/)?([\w.-]+)\/([\w.-]+?)(?:\.git)?\/?$/.exec(input.repo.trim());
      if (!m) throw new GithubError("Escribe el repositorio como dueño/nombre.", 400);
      const repo = await gateway.request<{ name: string; owner: { login: string }; default_branch: string; permissions?: { push?: boolean } }>(token, "GET", `/repos/${m[1]}/${m[2]}`);
      if (repo.permissions && !repo.permissions.push) throw new GithubError("Tu cuenta de GitHub no puede escribir en ese repositorio.", 403);
      await repository.saveLink(p, a, repo.owner.login, repo.name, input.branch?.trim() || repo.default_branch || "main");
      return sync(p, { message: "Conectar con Forja" });
    },
    unlink: (p: string) => repository.unlink(p),
    async handleWebhook(rawBody: string, signature: string | undefined) {
      const expected = auth.webhookSignature(rawBody);
      if (!expected) throw new GithubError("Webhook no configurado.", 404);
      if (!signature || !auth.sameSignature(signature, expected)) throw new GithubError("Firma no válida.", 401);
      const body = JSON.parse(rawBody) as { ref?: string; repository?: { name?: string; owner?: { login?: string; name?: string } } };
      const projects = await repository.webhookLinks(body.repository?.owner?.login ?? body.repository?.owner?.name ?? "", body.repository?.name ?? "", body.ref?.replace(/^refs\/heads\//, "") ?? "");
      for (const p of projects) void sync(p).catch(() => {});
      return projects.length;
    },
  };
}
