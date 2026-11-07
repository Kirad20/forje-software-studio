import { createHash, createHmac, createSign, randomBytes, timingSafeEqual } from "node:crypto";
import { encrypt, decrypt } from "../../../shared/crypto.js";
import { q, one, platformDb } from "../../../shared/database/index.js";
import { config } from "../../../shared/config.js";
import type { AppCredentials, AppStore, GithubApp } from "../application/apps.js";
import { GithubError } from "../application/github.js";
import { gh } from "./github.js";

const hash = (value: string) => createHash("sha256").update(value).digest("hex");
const cache = new Map<string, { token: string; expires: number }>();
const pending = new Map<string, Promise<string>>();
const generations = new Map<string, number>();
export function appJwt(id: number, pem: string, now = Date.now()) {
  const header = Buffer.from(JSON.stringify({ alg: "RS256", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(JSON.stringify({ iat: Math.floor(now / 1000) - 60, exp: Math.floor(now / 1000) + 540, iss: String(id) })).toString("base64url");
  const body = `${header}.${payload}`;
  return `${body}.${createSign("RSA-SHA256").update(body).sign(pem, "base64url")}`;
}
async function credentials(a: string) {
  const r = await one<{ app_id: string; credentials_enc: string }>("select app_id, credentials_enc from github_apps where account_id = $1", [a]);
  if (!r) throw new GithubError("Crea tu GitHub App primero.", 409);
  return { id: Number(r.app_id), secrets: JSON.parse(decrypt(r.credentials_enc)) as AppCredentials };
}
export const githubAppStore: AppStore = {
  async app(a) {
    const r = await one<{ app_id: string; slug: string; name: string; owner: string }>("select app_id, slug, name, owner from github_apps where account_id = $1", [a]);
    return r ? { id: Number(r.app_id), slug: r.slug, name: r.name, owner: r.owner } : null;
  },
  async saveApp(a, app: GithubApp, secrets) {
    const rows = await q("insert into github_apps(account_id, app_id, slug, name, owner, credentials_enc) values($1,$2,$3,$4,$5,$6) on conflict do nothing returning account_id", [a, app.id, app.slug, app.name, app.owner, encrypt(JSON.stringify(secrets))]);
    if (!rows.length) throw new GithubError("Ya existe una GitHub App para esta cuenta.", 409);
  },
  async installations(a) {
    const rows = await q<{ installation_id: string; login: string }>("select installation_id, login from github_app_installations where account_id = $1 order by installation_id", [a]);
    return rows.map((r) => ({ id: Number(r.installation_id), login: r.login }));
  },
  async saveInstallation(a, i) {
    await q("insert into github_app_installations(account_id,installation_id,login) values($1,$2,$3) on conflict(account_id,installation_id) do update set login = excluded.login", [a, i.id, i.login]);
  },
  async removeInstallation(a, id) {
    cache.delete(`${a}:${id}`);
    await q("delete from github_app_installations where account_id = $1 and installation_id = $2", [a, id]);
    await q("update project_github set status = 'lost_access', error = 'Reinstala la GitHub App y selecciona este repositorio.' where account_id = $1 and installation_id = $2", [a, id]);
  },
  async disconnect(a) {
    generations.set(a, (generations.get(a) ?? 0) + 1);
    for (const key of cache.keys()) if (key.startsWith(`${a}:`)) cache.delete(key);
    await (await platformDb()).transaction(async (tx) => {
      await tx.query("delete from github_app_installations where account_id = $1", [a]);
      await tx.query("delete from github_app_states where account_id = $1", [a]);
      await tx.query("delete from github_accounts where account_id = $1", [a]);
      await tx.query("update project_github set status = 'lost_access', error = 'Cuenta desconectada. Vuelve a conectar GitHub.' where account_id = $1", [a]);
    });
  },
  async selectionChanged(a, id, removed) {
    cache.delete(`${a}:${id}`);
    if (removed.length) await q("update project_github set status = 'lost_access', error = 'Selecciona de nuevo este repositorio en tu GitHub App.' where account_id = $1 and installation_id = $2 and lower(owner || '/' || repo) = any($3::text[])", [a, id, removed.map((r) => r.toLowerCase())]);
  },
  async createState(a, session, purpose) {
    if (!session) throw new GithubError("Inicia sesión para conectar GitHub.", 401);
    const nonce = randomBytes(32).toString("base64url");
    const state = `${nonce}.${createHmac("sha256", config.secretsKey).update(nonce).digest("base64url")}`;
    await q("delete from github_app_states where expires_at < now()");
    await q("insert into github_app_states(nonce_hash,account_id,session_hash,purpose,expires_at) values($1,$2,$3,$4,now() + interval '10 minutes')", [hash(state), a, hash(session), purpose]);
    return state;
  },
  async consumeState(a, session, purpose, state) {
    if (!session || !/^[\w-]{43}\.[\w-]{43}$/.test(state)) return false;
    return (await q("delete from github_app_states where nonce_hash = $1 and account_id = $2 and session_hash = $3 and purpose = $4 and expires_at > now() returning nonce_hash", [hash(state), a, hash(session), purpose])).length === 1;
  },
  async appToken(a) { const c = await credentials(a); return appJwt(c.id, c.secrets.pem); },
  async installationToken(a, id) {
    if (!(await one("select installation_id from github_app_installations where account_id = $1 and installation_id = $2", [a, id]))) throw new GithubError("Cuenta desconectada. Vuelve a instalar tu GitHub App desde Forja.", 403);
    const key = `${a}:${id}`, saved = cache.get(key);
    if (saved && saved.expires > Date.now() + 60_000) return saved.token;
    if (pending.has(key)) return pending.get(key)!;
    const generation = generations.get(a) ?? 0;
    const work = (async () => {
      const data = await gh<{ token: string; expires_at: string }>(await githubAppStore.appToken(a), "POST", `/app/installations/${id}/access_tokens`, { permissions: { contents: "write", metadata: "read" } });
      const expires = Date.parse(data.expires_at);
      if (!data.token || !Number.isFinite(expires) || expires <= Date.now() + 60_000) throw new GithubError("GitHub no devolvió un token de instalación válido.", 502);
      if (generation !== (generations.get(a) ?? 0) || !(await one("select installation_id from github_app_installations where account_id = $1 and installation_id = $2", [a, id]))) throw new GithubError("La cuenta se desconectó durante la autorización.", 403);
      cache.set(key, { token: data.token, expires });
      return data.token;
    })();
    pending.set(key, work);
    try { return await work; } finally { pending.delete(key); }
  },
  async webhookAccount(raw, signature) {
    if (!signature || !/^sha256=[a-f0-9]{64}$/.test(signature)) return null;
    const body = JSON.parse(raw) as { installation?: { id?: number; app_id?: number }; hook?: { app_id?: number } };
    const appId = body.installation?.app_id ?? body.hook?.app_id;
    const rows = Number.isSafeInteger(appId)
      ? await q<{ account_id: string; credentials_enc: string }>("select account_id, credentials_enc from github_apps where app_id = $1", [appId])
      : Number.isSafeInteger(body.installation?.id)
        ? await q<{ account_id: string; credentials_enc: string }>("select a.account_id, a.credentials_enc from github_apps a join github_app_installations i using(account_id) where i.installation_id = $1", [body.installation!.id])
        : [];
    for (const r of rows) {
      const secrets = JSON.parse(decrypt(r.credentials_enc)) as AppCredentials;
      const expected = `sha256=${createHmac("sha256", secrets.webhookSecret).update(raw).digest("hex")}`;
      if (timingSafeEqual(Buffer.from(expected), Buffer.from(signature))) return r.account_id;
    }
    return null;
  },
};
