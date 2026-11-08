import { GithubError, type GithubGateway } from "./github.js";

export interface GithubApp { id: number; slug: string; name: string; owner: string }
export interface AppCredentials { clientId: string; clientSecret: string; pem: string; webhookSecret: string }
export interface Installation { id: number; login: string }
export interface AppStore {
  app(accountId: string): Promise<GithubApp | null>;
  saveApp(accountId: string, app: GithubApp, credentials: AppCredentials): Promise<void>;
  installations(accountId: string): Promise<Installation[]>;
  saveInstallation(accountId: string, installation: Installation): Promise<void>;
  removeInstallation(accountId: string, id: number): Promise<void>;
  disconnect(accountId: string): Promise<void>;
  selectionChanged(accountId: string, id: number, removed: string[]): Promise<void>;
  consumeState(accountId: string, session: string, purpose: string, state: string): Promise<boolean>;
  createState(accountId: string, session: string, purpose: string): Promise<string>;
  appToken(accountId: string): Promise<string>;
  installationToken(accountId: string, id: number): Promise<string>;
  webhookAccount(raw: string, signature?: string): Promise<string | null>;
}
export interface RepoSelection { repo: string; branch?: string; installationId?: number | null }
export interface SelectedRepository {
  id: number; name: string; fullName: string; owner: string; private: boolean; description: string | null;
  defaultBranch: string; installationId: number | null;
}
interface RemoteRepo {
  id: number; name: string; full_name: string; owner: { login: string }; private: boolean; description: string | null;
  default_branch: string; archived?: boolean; disabled?: boolean; permissions?: { push?: boolean };
}
interface RemoteInstallation { id: number; app_id: number; account: { login: string }; suspended_at?: string | null; permissions?: { contents?: string } }
export function repoName(value: string) {
  if (typeof value !== "string" || !/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(value) || value.split("/").some((s) => s === "." || s === "..")) throw new GithubError("Elige un repositorio válido (dueño/nombre).", 400);
  return value;
}
export function pageNumber(value: number) {
  if (!Number.isSafeInteger(value) || value < 1 || value > 10000) throw new GithubError("Página no válida.", 400);
  return value;
}
export function branchName(value: string) {
  if (typeof value !== "string" || !value || value.length > 255 || /[\s~^:?*\\\[\x00-\x1f]/.test(value) || value.includes("..") || value.includes("@{") || value.startsWith("/") || value.endsWith("/") || value.endsWith(".") || value.split("/").some((s) => !s || s.startsWith(".") || s.endsWith(".lock"))) throw new GithubError("La rama no es válida.", 400);
  return value;
}
export function createGithubAppService(store: AppStore, gateway: GithubGateway, legacyToken: (accountId: string) => Promise<{ token: string; login: string }>, publicUrl: () => string) {
  async function requireApp(a: string) {
    const app = await store.app(a);
    if (!app) throw new GithubError("Crea tu GitHub App primero.", 409);
    return app;
  }
  async function installation(a: string, id: number) {
    if (!Number.isSafeInteger(id) || id < 1) throw new GithubError("Instalación no válida.", 400);
    const app = await requireApp(a);
    if (!(await store.installations(a)).some((i) => i.id === id)) throw new GithubError("Instala esta GitHub App y selecciona el repositorio.", 403);
    try {
      const remote = await gateway.request<RemoteInstallation>(await store.appToken(a), "GET", `/app/installations/${id}`);
      if (remote.app_id !== app.id || remote.suspended_at || remote.permissions?.contents !== "write") throw new GithubError("Instalación suspendida o sin permiso de escritura.", 403);
      return { token: await store.installationToken(a, id), login: remote.account.login };
    } catch (e) {
      if (e instanceof GithubError && [401, 403, 404].includes(e.status)) {
        await store.removeInstallation(a, id);
        throw new GithubError("GitHub revocó o suspendió la instalación. Reinstala tu App y selecciona los repositorios.", 403);
      }
      throw e;
    }
  }
  async function selectRepository(a: string, input: RepoSelection, allowEmptyLegacy = false) {
    const full = repoName(input.repo);
    let id = input.installationId ?? null;
    if (input.installationId === undefined && await store.app(a)) {
      try {
        const selected = await gateway.request<{ id: number }>(await store.appToken(a), "GET", `/repos/${full}/installation`);
        id = selected.id;
      } catch (e) {
        if (e instanceof GithubError && [403, 404].includes(e.status)) throw new GithubError("Selecciona este repositorio en la instalación de tu GitHub App.", 403);
        throw e;
      }
    }
    const auth = id === null ? await legacyToken(a) : await installation(a, id);
    if (id !== null) {
      let selected: { id: number };
      try { selected = await gateway.request<{ id: number }>(await store.appToken(a), "GET", `/repos/${full}/installation`); }
      catch (e) { if (e instanceof GithubError && [403, 404].includes(e.status)) throw new GithubError("Selecciona este repositorio en la instalación de tu GitHub App.", 403); throw e; }
      if (selected.id !== id) throw new GithubError("Este repositorio no está seleccionado en esa instalación. Configura los repositorios de tu GitHub App.", 403);
    }
    const remote = await gateway.request<RemoteRepo>(auth.token, "GET", `/repos/${full}`);
    if (remote.archived || remote.disabled || (id === null && remote.permissions?.push !== true)) throw new GithubError("El repositorio está archivado o no permite escribir.", 403);
    const branch = branchName(input.branch ?? remote.default_branch ?? "main");
    try { await gateway.request(auth.token, "GET", `/repos/${full}/branches/${encodeURIComponent(branch)}`); }
    catch (e) {
      if (!(e instanceof GithubError) || e.status !== 404) throw e;
      if (allowEmptyLegacy && id === null && !input.branch) {
        try { await gateway.request(auth.token, "GET", `/repos/${full}/git/ref/heads/${encodeURIComponent(branch)}`); }
        catch (headError) {
          if (headError instanceof GithubError && headError.status === 409) return { ...auth, owner: remote.owner.login, repo: remote.name, branch, installationId: id };
          throw new GithubError(`La rama ${branch} no existe. Selecciona una rama existente.`, 422);
        }
      }
      throw new GithubError(`La rama ${branch} no existe. Selecciona una rama existente.`, 422);
    }
    return { ...auth, owner: remote.owner.login, repo: remote.name, branch, installationId: id };
  }
  const view = (r: RemoteRepo, id: number | null): SelectedRepository => ({ id: r.id, name: r.name, fullName: r.full_name, owner: r.owner.login, private: r.private, description: r.description ?? null, defaultBranch: r.default_branch, installationId: id });
  return {
    selectRepository, installation,
    async status(a: string) {
      const app = await store.app(a);
      const installations: Installation[] = [];
      for (const i of await store.installations(a)) {
        try { await installation(a, i.id); installations.push(i); }
        catch (e) { if (!(e instanceof GithubError) || ![401, 403, 404].includes(e.status)) throw e; }
      }
      return { app, installations };
    },
    async start(a: string, session: string) {
      if (await store.app(a)) throw new GithubError("Ya tienes una GitHub App. Instálala para seleccionar repositorios.", 409);
      const u = new URL(publicUrl());
      if (u.username || u.password || u.search || u.hash || u.pathname !== "/" || (u.protocol !== "https:" && !(u.protocol === "http:" && ["localhost", "127.0.0.1", "[::1]"].includes(u.hostname)))) throw new GithubError("Configura PUBLIC_URL con el origen HTTPS público de Forja antes de crear la GitHub App.", 400);
      const state = await store.createState(a, session, "manifest");
      const base = u.origin;
      const manifest = JSON.stringify({ name: `Forja-${state.slice(0, 10)}`, url: base, public: true, hook_attributes: { url: `${base}/api/github/webhook`, active: true }, redirect_url: `${base}/api/github/app/callback`, setup_url: `${base}/api/github/app/install/callback`, setup_on_update: true, default_permissions: { metadata: "read", contents: "write" }, default_events: ["push"] });
      return { url: `${gateway.webUrl()}/settings/apps/new?state=${encodeURIComponent(state)}`, manifest };
    },
    async finish(a: string, session: string, code: string, state: string) {
      if (!(await store.consumeState(a, session, "manifest", state))) throw new GithubError("Autorización caducada o ya utilizada. Vuelve a intentarlo.", 400);
      if (await store.app(a)) throw new GithubError("Ya tienes una GitHub App.", 409);
      if (!/^[A-Za-z0-9_-]{1,255}$/.test(code)) throw new GithubError("GitHub no devolvió un código de registro válido.", 400);
      const r = await gateway.request<{ id: number; slug: string; name: string; owner: { login: string }; client_id: string; client_secret: string; pem: string; webhook_secret: string }>("", "POST", `/app-manifests/${encodeURIComponent(code)}/conversions`);
      if (!Number.isSafeInteger(r.id) || !r.slug || !r.owner?.login || !r.client_id || !r.client_secret || !r.pem || !r.webhook_secret) throw new GithubError("GitHub devolvió una configuración incompleta.", 502);
      await store.saveApp(a, { id: r.id, slug: r.slug, name: r.name, owner: r.owner.login }, { clientId: r.client_id, clientSecret: r.client_secret, pem: r.pem, webhookSecret: r.webhook_secret });
    },
    async installStart(a: string, session: string) {
      const app = await requireApp(a), state = await store.createState(a, session, "install");
      return `${gateway.webUrl()}/apps/${encodeURIComponent(app.slug)}/installations/new?state=${encodeURIComponent(state)}`;
    },
    async installFinish(a: string, session: string, id: number, state: string) {
      if (!(await store.consumeState(a, session, "install", state))) throw new GithubError("Autorización caducada o ya utilizada. Vuelve a instalar la App desde Forja.", 400);
      if (!Number.isSafeInteger(id) || id < 1) throw new GithubError("Instalación no válida.", 400);
      const app = await requireApp(a);
      const remote = await gateway.request<RemoteInstallation>(await store.appToken(a), "GET", `/app/installations/${id}`);
      if (remote.app_id !== app.id || remote.suspended_at || remote.permissions?.contents !== "write") throw new GithubError("La instalación no pertenece a tu App o no permite escritura.", 403);
      await store.saveInstallation(a, { id, login: remote.account.login });
    },
    async repositories(a: string, page = 1) {
      pageNumber(page);
      const app = await store.app(a), repositories: SelectedRepository[] = [];
      let next = false;
      if (app) {
        const installs = await store.installations(a);
        if (!installs.length) throw new GithubError("Instala tu GitHub App y selecciona los repositorios que quieres editar.", 409);
        for (const i of installs) {
          const auth = await installation(a, i.id);
          const r = await gateway.request<{ repositories: RemoteRepo[]; total_count: number }>(auth.token, "GET", `/installation/repositories?per_page=100&page=${page}`);
          next ||= r.total_count > page * 100;
          repositories.push(...r.repositories.filter((r) => !r.archived && !r.disabled).map((r) => view(r, i.id)));
        }
      } else {
        const { token } = await legacyToken(a);
        const rows = await gateway.request<RemoteRepo[]>(token, "GET", `/user/repos?per_page=100&page=${page}&sort=full_name&affiliation=owner,collaborator,organization_member`);
        next = rows.length === 100;
        repositories.push(...rows.filter((r) => !r.archived && !r.disabled && r.permissions?.push === true).map((r) => view(r, null)));
      }
      return { repositories, nextPage: next ? page + 1 : null };
    },
    async branches(a: string, repo: string, id: number | null | undefined, page = 1) {
      pageNumber(page);
      const selected = await selectRepository(a, { repo, installationId: id });
      const branches = await gateway.request<{ name: string }[]>(selected.token, "GET", `/repos/${repoName(repo)}/branches?per_page=100&page=${page}`);
      return { branches: branches.map((b) => ({ name: b.name })), nextPage: branches.length === 100 ? page + 1 : null };
    },
    async handleAppWebhook(raw: string, signature?: string) {
      const a = await store.webhookAccount(raw, signature);
      if (!a) return null;
      const body = JSON.parse(raw) as { action?: string; installation?: { id?: number }; repositories_removed?: { full_name?: string }[] };
      if (body.installation?.id && ["deleted", "suspend"].includes(body.action ?? "")) await store.removeInstallation(a, body.installation.id);
      if (body.installation?.id && ["added", "removed"].includes(body.action ?? "")) {
        const removed = (body.repositories_removed ?? []).flatMap((r) => {
          if (typeof r.full_name !== "string") return [];
          try { return [repoName(r.full_name)]; } catch { return []; }
        });
        await store.selectionChanged(a, body.installation.id, removed);
      }
      return a;
    },
  };
}
