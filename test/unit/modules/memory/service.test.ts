import { describe, expect, it, vi } from "vitest";
import { createMemoryService } from "../../../../server/modules/memory/application/service.js";

describe("scoped memory use cases", () => {
  const setup = () => {
    const repository = {
      settings: vi.fn(async () => ({ projectEnabled: true, personalEnabled: true })),
      setEnabled: vi.fn(), list: vi.fn(async () => [] as any[]),
      refresh: vi.fn(async (id: string, kind: string): Promise<any> => ({ id, kind })),
      insert: vi.fn(async (m: any) => m), update: vi.fn(), delete: vi.fn(async () => true),
    };
    return { repository, service: createMemoryService(repository, () => "new", (text) => text.includes("secret") ? "clave" : null) };
  };
  it("deduplicates normalized text only within the chosen scope before enforcing limits", async () => {
    const { repository, service } = setup();
    repository.list.mockResolvedValue(Array.from({ length: 40 }, (_, i) => ({ id: `${i}`, text: i ? `fact ${i}` : "Dark   mode." })));
    expect((await service.addMemory("p", "a", { scope: "personal", kind: "preference", text: " dark mode ", source: "owner" })).created).toBe(false);
    expect(repository.list).toHaveBeenCalledWith("p", "a", "personal");
    expect(repository.insert).not.toHaveBeenCalled();
  });
  it("rejects invalid scopes, kinds, oversized text and secrets before accessing persistence", async () => {
    const { repository, service } = setup();
    for (const patch of [{ scope: "wrong" }, { kind: "wrong" }, { text: "secret" }, { text: "x".repeat(301) }]) {
      await expect(service.addMemory("p", "a", { scope: "project", kind: "business", text: "safe", source: "owner", ...patch } as any)).rejects.toThrow();
    }
    expect(repository.list).not.toHaveBeenCalled();
  });
});
