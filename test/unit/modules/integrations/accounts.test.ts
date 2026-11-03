import { expect, it, vi } from "vitest";
import { createGithubAccountService } from "../../../../server/modules/integrations/application/accounts.js";
function setup() {
  const repository = { token: vi.fn(async () => ({ token: "token", login: "user" })), account: vi.fn(async () => undefined), connect: vi.fn(), disconnect: vi.fn(), link: vi.fn(async () => undefined), saveLink: vi.fn(), unlink: vi.fn(), webhookLinks: vi.fn(async () => ["p"]) };
  const gateway = { request: vi.fn(async (): Promise<any> => ({ login: "user" })), blobSha: (v: string) => v, decodeBlob: (_p: string, v: string) => v, encodeText: (v: string) => v, webUrl: () => "https://github.test", pollMs: () => 1, schedule: () => () => {}, warn: vi.fn() };
  const auth = { now: () => 1000000, oauthEnabled: () => true, signState: (v: string) => `signed:${v.replaceAll(".", "-")}`, sameSignature: (a: string, b: string) => a === b, authorizeUrl: (v: string) => v, exchange: vi.fn(async () => ({ access_token: "x".repeat(20) })), webhookSignature: () => "valid" };
  const sync = vi.fn(async () => ({ pulled: [], pushed: null }));
  return { repository, gateway, auth, sync, service: createGithubAccountService(repository, gateway, auth, sync) };
}
it("validates OAuth identity, expiry and timestamp before exchanging a code", async () => {
  const s = setup();
  for (const state of ["other.1000000.signed:other-1000000", "a.1.signed:a-1", "a.NaN.signed:a-NaN", "a.1000001.signed:a-1000001"]) await expect(s.service.oauthFinish("a", "code", state)).rejects.toThrow("caducó");
  expect(s.auth.exchange).not.toHaveBeenCalled();
  const state = s.service.oauthStart("a");
  expect(await s.service.oauthFinish("a", "code", state)).toEqual({ login: "user" });
  expect(s.repository.connect).toHaveBeenCalledWith("a", "user", "x".repeat(20));
});
it("verifies webhooks before lookup and syncs only the matching repository branch", async () => {
  const s = setup(), body = JSON.stringify({ ref: "refs/heads/main", repository: { name: "repo", owner: { login: "owner" } } });
  await expect(s.service.handleWebhook(body, "invalid")).rejects.toThrow("Firma");
  expect(s.repository.webhookLinks).not.toHaveBeenCalled();
  expect(await s.service.handleWebhook(body, "valid")).toBe(1);
  expect(s.repository.webhookLinks).toHaveBeenCalledWith("owner", "repo", "main");
  expect(s.sync).toHaveBeenCalledWith("p");
});
