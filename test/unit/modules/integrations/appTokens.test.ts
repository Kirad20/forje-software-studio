import { generateKeyPairSync, createVerify } from "node:crypto";
import { afterEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ one: vi.fn(), q: vi.fn(), gh: vi.fn(), transaction: vi.fn(), encrypt: vi.fn((v: string) => `encrypted:${v}`) }));
vi.mock("../../../../server/shared/database/index.js", () => ({ one: mocks.one, q: mocks.q, platformDb: async () => ({ transaction: mocks.transaction }) }));
vi.mock("../../../../server/shared/crypto.js", () => ({ decrypt: (v: string) => v, encrypt: mocks.encrypt }));
vi.mock("../../../../server/modules/integrations/infrastructure/github.js", () => ({ gh: mocks.gh }));
import { appJwt, githubAppStore } from "../../../../server/modules/integrations/infrastructure/apps.js";

afterEach(() => { vi.useRealTimers(); vi.clearAllMocks(); });
it("signs short-lived backdated RS256 app JWTs and renews installation tokens before expiry", async () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
  const { privateKey, publicKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
  const pem = privateKey.export({ type: "pkcs1", format: "pem" }).toString();
  const jwt = appJwt(123, pem), [header, payload, signature] = jwt.split(".");
  expect(JSON.parse(Buffer.from(header!, "base64url").toString())).toMatchObject({ alg: "RS256" });
  const claims = JSON.parse(Buffer.from(payload!, "base64url").toString());
  expect(claims.exp - claims.iat).toBe(600);
  expect(claims.iat).toBe(Date.now() / 1000 - 60);
  expect(createVerify("RSA-SHA256").update(`${header}.${payload}`).verify(publicKey, signature!, "base64url")).toBe(true);
  mocks.one.mockResolvedValue({ app_id: "123", credentials_enc: JSON.stringify({ pem, webhookSecret: "secret" }) });
  mocks.gh.mockImplementation(async () => ({ token: `token-${mocks.gh.mock.calls.length}`, expires_at: new Date(Date.now() + 3600000).toISOString() }));
  const [first, same] = await Promise.all([githubAppStore.installationToken("refresh-account", 42), githubAppStore.installationToken("refresh-account", 42)]);
  expect(first).toBe(same); expect(mocks.gh).toHaveBeenCalledTimes(1);
  vi.advanceTimersByTime(3500000);
  expect(await githubAppStore.installationToken("refresh-account", 42)).toBe(first);
  vi.advanceTimersByTime(50000);
  expect(await githubAppStore.installationToken("refresh-account", 42)).not.toBe(first);
  expect(mocks.gh).toHaveBeenCalledTimes(2);
  expect(mocks.gh.mock.calls[0]!.slice(1)).toEqual(["POST", "/app/installations/42/access_tokens", { permissions: { contents: "write", metadata: "read" } }]);
});
it("encrypts private manifest credentials and refuses overwriting an existing App", async () => {
  mocks.q.mockResolvedValueOnce([{ account_id: "a" }]).mockResolvedValueOnce([]);
  const credentials = { clientId: "id", clientSecret: "secret", pem: "key", webhookSecret: "hook" };
  const app = { id: 123, slug: "forja", name: "Forja", owner: "owner" };
  await githubAppStore.saveApp("a", app, credentials);
  expect(mocks.encrypt).toHaveBeenCalledWith(JSON.stringify(credentials));
  expect(mocks.q.mock.calls[0]![1][5]).toBe(`encrypted:${JSON.stringify(credentials)}`);
  await expect(githubAppStore.saveApp("a", app, credentials)).rejects.toMatchObject({ status: 409 });
});
it("disconnects App and legacy access atomically, invalidates states, and cannot reuse cached or mint new tokens", async () => {
  let registered = true;
  const { privateKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
  mocks.one.mockImplementation(async (sql: string) => sql.includes("github_app_installations") ? (registered ? { installation_id: 42 } : undefined) : { app_id: "123", credentials_enc: JSON.stringify({ pem: privateKey.export({ type: "pkcs1", format: "pem" }) }) });
  mocks.gh.mockResolvedValue({ token: "before-disconnect", expires_at: new Date(Date.now() + 3600000).toISOString() });
  await githubAppStore.installationToken("disconnect-account", 42);
  expect(mocks.gh).toHaveBeenCalledTimes(1);
  const query = vi.fn(async (_sql: string, _params?: unknown[]) => ({ rows: [] }));
  mocks.transaction.mockImplementation(async (work: (tx: { query: typeof query }) => Promise<void>) => { await work({ query }); registered = false; });
  await githubAppStore.disconnect("disconnect-account");
  expect(query.mock.calls.map(([sql]) => sql)).toEqual([
    "delete from github_app_installations where account_id = $1",
    "delete from github_app_states where account_id = $1",
    "delete from github_accounts where account_id = $1",
    "update project_github set status = 'lost_access', error = 'Cuenta desconectada. Vuelve a conectar GitHub.' where account_id = $1",
  ]);
  await expect(githubAppStore.installationToken("disconnect-account", 42)).rejects.toMatchObject({ status: 403 });
  expect(mocks.gh).toHaveBeenCalledTimes(1);
});
