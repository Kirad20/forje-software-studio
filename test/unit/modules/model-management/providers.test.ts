import { describe, expect, it, vi } from "vitest";
import { createProviderService } from "../../../../server/modules/model-management/application/ProviderService.js";

const provider = {
  id: "local", kind: "openai" as const, label: "Local", baseUrl: "http://localhost:1234/v1",
  headers: { authorization: "private" }, enabled: true, builtin: false, apiKey: "secret-12345678", keyBroken: false,
};
describe("provider application", () => {
  it("keeps credentials private, loads usable providers and supports idempotent unsubscribe", async () => {
    const repository = { list: vi.fn(async () => [provider]), find: vi.fn(), create: vi.fn(), update: vi.fn(),
      remove: vi.fn(), audit: vi.fn(), validate: (input: unknown) => input as never };
    const service = createProviderService(repository);
    const listener = vi.fn(), unsubscribe = service.onProvidersChanged(listener);
    await service.ensureProviders();
    expect(service.usableProviders()).toEqual([provider]);
    expect(service.providerSecret("local")).toBe(provider.apiKey);
    const views = await service.listProviders();
    expect(views[0]).toMatchObject({ keyHint: "…5678", keySet: true, headerNames: ["authorization"] });
    expect(JSON.stringify(views)).not.toContain("private");
    expect(JSON.stringify(views)).not.toContain("secret-12345678");
    unsubscribe(); unsubscribe();
    await service.reloadProviders();
    expect(listener).toHaveBeenCalledTimes(2);
  });
  it("isolates caches and refuses deleting a builtin provider", async () => {
    const repository = { list: vi.fn(async () => [provider]), find: vi.fn(async () => ({ builtin: true, kind: "openai" })),
      create: vi.fn(), update: vi.fn(), remove: vi.fn(), audit: vi.fn(), validate: (input: unknown) => input as never };
    const first = createProviderService(repository), second = createProviderService(repository);
    await first.ensureProviders();
    expect(second.usableProviders()).toEqual([]);
    await expect(first.deleteProvider("openai", null)).rejects.toThrow("integrados no se borran");
    expect(repository.remove).not.toHaveBeenCalled();
  });
});
