import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { freshDatabase } from "../helpers/pg.mjs";

const dir = mkdtempSync(path.join(os.tmpdir(), "forja-catalog-"));
process.env.DATA_DIR = dir;
process.env.SECRETS_KEY = "ab".repeat(32);
const pgdb = await freshDatabase();
process.env.DATABASE_URL = pgdb.url;

const { config } = await import("../../server/config.js");
const { platformDb, q, closePlatformDb } = await import("../../server/platform/db.js");
const { seedDefaults } = await import("../../server/db/seeds/defaults.js");
const { seedLocal } = await import("../../server/db/seeds/local.js");
const providers = await import("../../server/llm/providers.js");
const catalog = await import("../../server/llm/catalog.js");
afterAll(async () => {
  rmSync(dir, { recursive: true, force: true });
  await closePlatformDb();
  await pgdb.drop();
});

describe("default seed", () => {
  it("creates the builtin providers (off, no key) and the Anthropic models, once", async () => {
    await seedDefaults(await platformDb()); // platformDb() already ran it: a second run changes nothing
    const rows = await q<{ id: string; enabled: boolean; api_key_enc: string | null }>(`select id, enabled, api_key_enc from providers order by id`);
    expect(rows).toEqual([
      { id: "anthropic", enabled: false, api_key_enc: null },
      { id: "openai", enabled: false, api_key_enc: null },
      { id: "openrouter", enabled: false, api_key_enc: null },
    ]);
    const models = await q<{ id: string; source: string }>(`select id, source from model_catalog order by id`);
    expect(models.map((m) => m.id)).toEqual(["anthropic:claude-haiku-5-5", "anthropic:claude-opus-5-5", "anthropic:claude-sonnet-5-5"]);
    expect(models.every((m) => m.source === "builtin")).toBe(true);
  });
});

describe("providers and models", () => {
  it("offer no model until a provider is enabled and configured", async () => {
    expect(await catalog.availableModels()).toEqual([]);
    await providers.saveProvider({ id: "anthropic", enabled: true }, null);
    expect((await providers.listProviders()).find((p) => p.id === "anthropic")).toMatchObject({ available: false, missing: "Falta la clave de API" });
    await providers.saveProvider({ id: "anthropic", apiKey: "sk-ant-test-0000wxyz" }, null);
    const view = (await providers.listProviders()).find((p) => p.id === "anthropic")!;
    expect(view).toMatchObject({ available: true, keySet: true, keyHint: "…wxyz" });
    expect(JSON.stringify(view)).not.toContain("sk-ant-test");
    const haiku = (await catalog.availableModels()).find((m) => m.id === "anthropic:claude-haiku-5-5")!;
    expect(haiku.longPrompt).toEqual({ threshold: 100_000, inPrice: 0.5, outPrice: 2.5 });
    expect(catalog.providers().map((p) => p.id)).toEqual(["anthropic"]);
  });

  it("hide switched-off models and apply the platform whitelist from settings", async () => {
    await catalog.saveModel({ provider: "anthropic", model: "claude-opus-5-5", enabled: false }, null);
    expect((await catalog.availableModels()).map((m) => m.id)).not.toContain("anthropic:claude-opus-5-5");
    const sonnet = (await catalog.availableModels()).find((m) => m.id === "anthropic:claude-sonnet-5-5")!;
    expect(catalog.platformAllows(sonnet)).toBe(true);
    config.models.allow = ["anthropic:claude-haiku-*"];
    expect(catalog.platformAllows(sonnet)).toBe(false);
    config.models.allow = ["custom:*"];
  });

  it("add OpenAI-compatible providers with custom models, and refuse to delete builtin ones", async () => {
    await expect(providers.saveProvider({ id: "lab", baseUrl: null }, null, { create: true })).rejects.toThrow(/URL base/);
    await providers.saveProvider({ id: "lab", label: "Ollama", baseUrl: "http://127.0.0.1:11434/v1/" }, null, { create: true });
    const id = await catalog.saveModel({ provider: "lab", model: "qwen3.8:latest", tier: 3 }, null, { create: true });
    expect(id).toBe("lab:qwen3.8:latest");
    const m = (await catalog.availableModels()).find((x) => x.id === id)!;
    expect(m).toMatchObject({ source: "custom", inPrice: 0, context: 128_000 });
    expect(catalog.platformAllows(m)).toBe(true); // "custom:*"
    expect(catalog.providerOf("lab")?.endpoint?.baseUrl).toBe("http://127.0.0.1:11434/v1");
    // Some gateways authenticate with a header: stored encrypted, listed by name only.
    await providers.saveProvider({ id: "lab", headers: { "api-key": "header-secret-123" } }, null);
    expect(catalog.providerOf("lab")?.endpoint?.headers).toEqual({ "api-key": "header-secret-123" });
    const labView = (await providers.listProviders()).find((p) => p.id === "lab")!;
    expect(labView.headerNames).toEqual(["api-key"]);
    expect(JSON.stringify(labView)).not.toContain("header-secret-123");
    expect(JSON.stringify(await q(`select * from providers where id = 'lab'`))).not.toContain("header-secret-123");
    await expect(catalog.saveModel({ provider: "lab", model: "x", tier: 9 }, null, { create: true })).rejects.toThrow(/Calidad/);
    await expect(catalog.deleteModel("anthropic:claude-opus-5-5", null)).rejects.toThrow(/propios/);
    await expect(providers.deleteProvider("anthropic", null)).rejects.toThrow(/integrados/);
    await providers.deleteProvider("lab", null);
    expect(await q(`select 1 from model_catalog where id = $1`, [id])).toEqual([]);
  });

  it("keep a provider whose key cannot be decrypted as unavailable", async () => {
    await q(`update providers set api_key_enc = 'garbage' where id = 'anthropic'`);
    await providers.reloadProviders();
    expect((await providers.listProviders()).find((p) => p.id === "anthropic")).toMatchObject({ available: false, keyBroken: true });
    expect(catalog.providers()).toEqual([]);
  });
});

describe("seed.local.json", () => {
  it("configures untouched providers and adds models, but never overrides the panel unless forced", async () => {
    const file = path.join(dir, "seed.json");
    writeFileSync(
      file,
      JSON.stringify({
        providers: [
          { id: "openai", baseUrl: "http://127.0.0.1:9/v1", apiKey: "file-key-1234", enabled: true },
          { id: "anthropic", apiKey: "file-key-anthropic" },
        ],
        models: [{ provider: "openai", model: "local-a", tier: 2 }],
      }),
    );
    const done = await seedLocal(file);
    // anthropic was edited in the panel above: the file leaves it alone.
    expect(done).toEqual(["proveedor openai", "modelo openai:local-a"]);
    expect(catalog.providerOf("openai")?.endpoint).toMatchObject({ baseUrl: "http://127.0.0.1:9/v1", apiKey: "file-key-1234" });
    expect(await seedLocal(file)).toEqual(["proveedor openai"]); // still untouched: re-applied, same values
    await providers.saveProvider({ id: "openai", apiKey: "panel-key-5678" }, null);
    await seedLocal(file);
    expect(catalog.providerOf("openai")?.endpoint?.apiKey).toBe("panel-key-5678");
    await seedLocal(file, { force: true });
    expect(catalog.providerOf("openai")?.endpoint?.apiKey).toBe("file-key-1234");
    expect(providers.providerSecret("anthropic")).toBe("file-key-anthropic");
  });
});
