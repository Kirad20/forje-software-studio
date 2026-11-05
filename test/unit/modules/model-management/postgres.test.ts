import { mkdirSync, rmSync } from "node:fs";
import path from "node:path";
import { afterAll, describe, expect, it, vi } from "vitest";
import { freshDatabase } from "../../../helpers/pg.mjs";

const dataDir = path.join(process.cwd(), `.model-management-data-${process.pid}`);
mkdirSync(dataDir, { recursive: true });
process.env.DATA_DIR = dataDir;
process.env.SECRETS_KEY = "ab".repeat(32);
const database = await freshDatabase();
process.env.DATABASE_URL = database.url;
const { q, platformDb, closePlatformDb } = await import("../../../../server/shared/database/index.js");
const providers = await import("../../../../server/modules/model-management/providers.js");
const catalog = await import("../../../../server/modules/model-management/catalog.js");
const { recordOutcome, posteriors } = await import("../../../../server/modules/model-management/bandit.js");
const { createPlatformModelManagement } = await import("../../../../server/modules/model-management/index.js");
afterAll(async () => {
  await catalog.stopCatalogSync();
  await closePlatformDb();
  await database.drop();
  rmSync(dataDir, { recursive: true, force: true });
});

describe("production provider/catalog persistence", () => {
  it("preserves encrypted credentials, validation, custom model management, audit and bandit updates", async () => {
    await platformDb();
    expect(await catalog.availableModels()).toEqual([]);
    await providers.saveProvider({ id: "local", baseUrl: "http://127.0.0.1:1234/v1/",
      apiKey: "private-key-1234", headers: { authorization: "private-header" }, enabled: true }, null, { create: true });
    expect(catalog.providerOf("local")?.endpoint?.baseUrl).toBe("http://127.0.0.1:1234/v1");
    const publicView = (await providers.listProviders()).find(p => p.id === "local")!;
    expect(publicView).toMatchObject({ keySet: true, keyHint: "…1234", headerNames: ["authorization"], available: true });
    expect(JSON.stringify(publicView)).not.toContain("private");
    expect(JSON.stringify(await q(`select * from providers where id = 'local'`))).not.toContain("private");
    await expect(catalog.saveModel({ provider: "local", model: "test", tier: 9 }, null, { create: true })).rejects.toThrow("Calidad");
    const id = await catalog.saveModel({ provider: "local", model: "test", inPrice: 1, outPrice: 2 }, null, { create: true });
    const model = (await catalog.availableModels()).find(m => m.id === id)!;
    expect(model).toMatchObject({ id: "local:test", tier: 3, context: 128000, source: "custom" });
    await recordOutcome("chat:low:general", model, 0.5, 0.01, 0.25);
    const stats = (await posteriors("chat:low:general", [model])).get(id)!;
    expect(stats.uses).toBe(1);
    expect(stats.alpha + stats.beta).toBeCloseTo(4.25);
    await catalog.saveModel({ provider: "local", model: "test", label: "Edited", enabled: false }, null);
    expect((await catalog.listCatalog()).find(m => m.id === id)).toMatchObject({ label: "Edited", enabled: false, available: false });
    expect(await q(`select action from settings_audit where key = $1`, [`model:${id}`]))
      .toEqual(expect.arrayContaining([{ action: "create" }, { action: "set" }]));
    await expect(providers.deleteProvider("anthropic", null)).rejects.toThrow("integrados");
    await providers.deleteProvider("local", null);
    expect(await q(`select id from model_catalog where id = $1`, [id])).toEqual([]);
  });
  it("composes bootstrap-owned services with idempotent start, stop and restart", async () => {
    const module = createPlatformModelManagement();
    const starting = module.start();
    expect(module.start()).toBe(starting);
    await starting;
    expect(module.providers.usableProviders()).toEqual(providers.usableProviders());
    await module.stop();
    await module.stop();
    await module.start();
    await module.stop();
  });
  it("persists an Ollama provider and routes native discovery and inference", async () => {
    await providers.saveProvider({ id: "native-ollama", kind: "ollama", baseUrl: "http://127.0.0.1:11434", enabled: true }, null, { create: true });
    try {
      expect(catalog.providerOf("native-ollama")).toMatchObject({ kind: "ollama" });
      await catalog.saveModel({ provider: "native-ollama", model: "qwen3.5:9b-32k", context: 32768, tools: true, vision: true }, null, { create: true });
      const { listProviderModels, probeProvider } = await import("../../../../server/modules/model-management/probe.js");
      vi.stubGlobal("fetch", vi.fn(async () => Response.json({ models: [{ name: "qwen3.5:9b-32k" }] })));
      expect(await listProviderModels("native-ollama")).toEqual({ models: [{ id: "qwen3.5:9b-32k", label: "qwen3.5:9b-32k", inPrice: 0, outPrice: 0 }] });
      expect(await probeProvider("native-ollama")).toMatchObject({ ok: true, models: 1 });
      const fetchMock = vi.fn<typeof fetch>(async () => Response.json({ model: "qwen3.5:9b-32k", message: { content: "OK" } }));
      vi.stubGlobal("fetch", fetchMock);
      const { invoke } = await import("../../../../server/modules/model-management/router.js");
      const model = (await catalog.availableModels()).find(m => m.provider === "native-ollama")!;
      expect(await invoke(model, { messages: [{ role: "user", content: "Hi" }] })).toMatchObject({ content: [{ type: "text", text: "OK" }] });
      const [url, options] = fetchMock.mock.calls[0]!;
      expect(url).toBe("http://127.0.0.1:11434/api/chat");
      expect(JSON.parse(String(options?.body)).options.num_ctx).toBe(32768);
    } finally {
      vi.unstubAllGlobals();
      await providers.deleteProvider("native-ollama", null);
    }
  });
});
