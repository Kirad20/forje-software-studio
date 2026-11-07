import { describe, expect, it, vi } from "vitest";
import { createGithubAppService, type AppStore, type GithubApp } from "../../../../server/modules/integrations/application/apps.js";
import { GithubError } from "../../../../server/modules/integrations/application/github.js";

function setup() {
  let now = 1, serial = 0;
  const configured = new Map<string, GithubApp>();
  const states = new Map<string, { account: string; session: string; purpose: string; until: number }>();
  const store: AppStore = {
    app: vi.fn(async (a) => configured.get(a) ?? null),
    saveApp: vi.fn(async (a, app) => { configured.set(a, app); }),
    installations: vi.fn(async () => [{ id: 42, login: "organization" }]),
    saveInstallation: vi.fn(), removeInstallation: vi.fn(), disconnect: vi.fn(), selectionChanged: vi.fn(), appToken: vi.fn(async () => "app-jwt"),
    installationToken: vi.fn(async () => "installation-token"), webhookAccount: vi.fn(async () => null),
    createState: async (account, session, purpose) => { const key = `random-${++serial}`; states.set(key, { account, session, purpose, until: now + 10 }); return key; },
    consumeState: async (account, session, purpose, state) => {
      const s = states.get(state);
      if (!s || s.account !== account || s.session !== session || s.purpose !== purpose || s.until <= now) return false;
      states.delete(state); return true;
    },
  };
  const repo = { id: 1, name: "repo", full_name: "organization/repo", owner: { login: "organization" }, private: true, description: null, default_branch: "main", permissions: { push: true } };
  const gateway = {
    request: vi.fn(async (_t: string, _method: string, path: string): Promise<any> => {
      if (path.includes("conversions")) return { id: 123, slug: "my-forja", name: "Forja", owner: { login: "owner" }, client_id: "client", client_secret: "secret", pem: "private-key", webhook_secret: "hook-secret" };
      if (path === "/app/installations/42") return { id: 42, app_id: 123, account: { login: "organization" }, permissions: { contents: "write" } };
      if (path.endsWith("/installation")) return { id: 42 };
      if (path.includes("/branches/")) return { name: "feature/ui" };
      if (path.includes("/branches?")) return [{ name: "main" }, { name: "feature/ui" }];
      if (path.includes("/installation/repositories")) return { total_count: 201, repositories: [repo, { ...repo, id: 2, archived: true }, { ...repo, id: 3, permissions: { push: false } }] };
      if (path.startsWith("/repos/")) return repo;
      return [];
    }),
    blobSha: (c: string) => c, decodeBlob: (_p: string, c: string) => c, encodeText: (c: string) => c,
    webUrl: () => "https://github.com", pollMs: () => 1, schedule: () => () => {}, warn: vi.fn(),
  };
  const legacy = vi.fn(async () => ({ token: "legacy-token", login: "legacy" }));
  let publicUrl = "https://forja.example";
  const service = createGithubAppService(store, gateway, legacy, () => publicUrl);
  const configure = () => configured.set("a", { id: 123, slug: "my-forja", name: "Forja", owner: "owner" });
  return { store, gateway, service, configure, legacy, setUrl: (u: string) => { publicUrl = u; }, expire: () => { now += 11; } };
}

describe("GitHub App onboarding and scoped selection", () => {
  it("binds single-use manifest states to session, account and expiry, saves secrets only to the server port", async () => {
    const s = setup(), start = await s.service.start("a", "session");
    const state = new URL(start.url).searchParams.get("state")!;
    const manifest = JSON.parse(start.manifest);
    expect(manifest.public).toBe(true);
    expect(manifest.default_permissions).toEqual({ metadata: "read", contents: "write" });
    expect(manifest.redirect_url).toBe("https://forja.example/api/github/app/callback");
    for (const [account, session] of [["other", "session"], ["a", "other-session"]]) await expect(s.service.finish(account!, session!, "code", state)).rejects.toThrow("caducada");
    expect(s.gateway.request).not.toHaveBeenCalled();
    await s.service.finish("a", "session", "code", state);
    expect(s.store.saveApp).toHaveBeenCalledWith("a", { id: 123, slug: "my-forja", name: "Forja", owner: "owner" }, { clientId: "client", clientSecret: "secret", pem: "private-key", webhookSecret: "hook-secret" });
    await expect(s.service.finish("a", "session", "code", state)).rejects.toThrow("ya utilizada");
    await expect(s.service.start("a", "session")).rejects.toMatchObject({ status: 409 });
    const second = await s.service.start("b", "session");
    s.expire();
    await expect(s.service.finish("b", "session", "code", new URL(second.url).searchParams.get("state")!)).rejects.toThrow("caducada");
  });
  it("rejects non-public HTTP configuration and accepts explicit loopback development", async () => {
    const s = setup();
    for (const url of ["http://host.example", "https://host.example/path", "https://user:password@host.example", "https://host.example?query=1"]) {
      s.setUrl(url); await expect(s.service.start("a", "session")).rejects.toThrow("PUBLIC_URL");
    }
    s.setUrl("http://localhost:4100");
    expect((await s.service.start("a", "session")).manifest).toContain("http://localhost:4100/api/github/app/callback");
  });
  it("authenticates installation ownership instead of trusting callback IDs", async () => {
    const s = setup(); s.configure();
    const start = await s.service.installStart("a", "session"), state = new URL(start).searchParams.get("state")!;
    s.gateway.request.mockResolvedValueOnce({ id: 42, app_id: 999, account: { login: "other" }, permissions: { contents: "write" } });
    await expect(s.service.installFinish("a", "session", 42, state)).rejects.toMatchObject({ status: 403 });
    expect(s.store.saveInstallation).not.toHaveBeenCalled();
    const retry = new URL(await s.service.installStart("a", "session")).searchParams.get("state")!;
    await s.service.installFinish("a", "session", 42, retry);
    expect(s.store.saveInstallation).toHaveBeenCalledWith("a", { id: 42, login: "organization" });
    await expect(s.service.installFinish("a", "session", 42, retry)).rejects.toThrow("ya utilizada");
  });
  it("uses only selected installation repositories, validates branches, and retains pagination after filtering", async () => {
    const s = setup(); s.configure();
    const page = await s.service.repositories("a", 1);
    expect(page.repositories).toHaveLength(1);
    expect(page.repositories[0]).toMatchObject({ owner: "organization", fullName: "organization/repo", installationId: 42 });
    expect(page.nextPage).toBe(2);
    expect((await s.service.repositories("a", 3)).nextPage).toBeNull();
    await expect(s.service.selectRepository("a", { repo: "organization/repo", branch: "feature/ui", installationId: 42 })).resolves.toMatchObject({ token: "installation-token", branch: "feature/ui" });
    expect(s.gateway.request).toHaveBeenCalledWith("app-jwt", "GET", "/repos/organization/repo/installation");
    expect(s.gateway.request).toHaveBeenCalledWith("installation-token", "GET", "/repos/organization/repo/branches/feature%2Fui");
    expect(s.legacy).not.toHaveBeenCalled();
    s.gateway.request.mockImplementationOnce(async () => { throw new GithubError("Not Found", 404); });
    await expect(s.service.selectRepository("a", { repo: "organization/repo", installationId: 42 })).rejects.toThrow("Reinstala");
    expect(s.store.removeInstallation).toHaveBeenCalledWith("a", 42);
  });
  it("rejects an unselected public repo, invalid branch and malformed pagination before any write", async () => {
    const s = setup(); s.configure();
    await expect(s.service.selectRepository("a", { repo: "organization/repo", installationId: 43 })).rejects.toMatchObject({ status: 403 });
    expect(s.store.installationToken).not.toHaveBeenCalled();
    const original = s.gateway.request.getMockImplementation()!;
    s.gateway.request.mockImplementation(async (token, method, path) => path.endsWith("/installation") ? { id: 999 } : original(token, method, path));
    await expect(s.service.selectRepository("a", { repo: "organization/repo", installationId: 42 })).rejects.toMatchObject({ status: 403 });
    await expect(s.service.repositories("a", 1.2)).rejects.toMatchObject({ status: 400 });
    await expect(s.service.selectRepository("a", { repo: "../repo" })).rejects.toMatchObject({ status: 400 });
    s.gateway.request.mockImplementation(async (token, method, path) => path.includes("/branches/") ? Promise.reject(new GithubError("Not Found", 404)) : original(token, method, path));
    await expect(s.service.selectRepository("a", { repo: "organization/repo", branch: "absent", installationId: 42 })).rejects.toMatchObject({ status: 422 });
    expect(s.store.saveInstallation).not.toHaveBeenCalled();
  });
  it("marks removed repository access from verified App webhooks without deleting the whole installation", async () => {
    const s = setup();
    vi.mocked(s.store.webhookAccount).mockResolvedValue("a");
    const raw = JSON.stringify({ action: "removed", installation: { id: 42 }, repositories_removed: [{ full_name: "organization/repo" }] });
    expect(await s.service.handleAppWebhook(raw, "valid")).toBe("a");
    expect(s.store.selectionChanged).toHaveBeenCalledWith("a", 42, ["organization/repo"]);
    expect(s.store.removeInstallation).not.toHaveBeenCalled();
    vi.mocked(s.store.webhookAccount).mockResolvedValue(null);
    await s.service.handleAppWebhook(raw, "invalid");
    expect(s.store.selectionChanged).toHaveBeenCalledTimes(1);
  });
});
