import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { freshDatabase } from "../helpers/pg.mjs";
import { createTestCoreModules } from "../helpers/coreModules.js";

const dir = mkdtempSync(path.join(process.cwd(), "test", ".tmp-settings-"));
process.env.DATA_DIR = dir;
process.env.SECRETS_KEY = "ab".repeat(32);
const pgdb = await freshDatabase();
process.env.DATABASE_URL = pgdb.url;

const { config, DEFAULT_MODELS_ALLOW } = await import("../../server/shared/config.js");
const { q, closePlatformDb } = await import("../../server/shared/database/index.js");
const settings = (await createTestCoreModules()).settings;
const store = settings;
const { createLocalSeed } = await import("../../server/bootstrap/database/localSeed.js");
const seedLocal = createLocalSeed(settings);
afterAll(async () => {
  rmSync(dir, { recursive: true, force: true });
  await closePlatformDb();
  await pgdb.drop();
});

describe("platform settings", () => {
  it("start at the defaults declared in config.ts", async () => {
    await store.loadSettings();
    expect(config.signup).toBe("open");
    expect(config.models.allow).toEqual(DEFAULT_MODELS_ALLOW);
    const view = await store.listSettings();
    expect(view.find((s) => s.key === "signup")).toMatchObject({ value: "open", isDefault: true, default: "open" });
    expect(view.filter((s) => s.key.startsWith("models.fusion.")).map((s) => s.key)).toHaveLength(12);
    expect(config.models.fusion).toMatchObject({
      fast: { maxCalls: 2, timeoutMs: 45_000, maxUsd: 0.05 },
      standard: { maxCalls: 4, timeoutMs: 60_000, maxUsd: 0.10 },
      high: { maxCalls: 6, timeoutMs: 120_000, maxUsd: 0.50 },
      max: { maxCalls: 8, timeoutMs: 180_000, maxUsd: 1 },
    });
  });

  it("write onto the live config, notify listeners, and reset to the default", async () => {
    const seen: string[][] = [];
    const unsubscribe = store.onSettingsChanged((k) => seen.push(k));
    expect(await store.updateSettings({ signup: "closed", "github.pollMs": 120000 }, null)).toEqual(["signup", "github.pollMs"]);
    expect(config.signup).toBe("closed");
    expect(config.github.pollMs).toBe(120000);
    expect(seen.at(-1)).toEqual(["signup", "github.pollMs"]);
    await store.resetSetting("signup", null);
    expect(config.signup).toBe("open");
    expect((await q(`select action from settings_audit where key = 'signup' order by id`)).map((r) => r.action)).toEqual(["set", "reset"]);
    unsubscribe();
  });

  it("reject the whole patch when one value is invalid", async () => {
    const before = config.freeCredits;
    await expect(store.updateSettings({ freeCredits: 5, signup: "x" }, null)).rejects.toMatchObject({ field: "signup" });
    await expect(store.updateSettings({ "evals.concurrency": 9 }, null)).rejects.toMatchObject({ field: "evals.concurrency" });
    await expect(store.updateSettings({ "models.fusion.high.maxCalls": 0 }, null))
      .rejects.toMatchObject({ field: "models.fusion.high.maxCalls" });
    await expect(store.updateSettings({ nope: 1 }, null)).rejects.toMatchObject({ field: "nope" });
    expect(config.freeCredits).toBe(before);
  });

  it("keep secrets encrypted and never list them in clear", async () => {
    await store.updateSettings({ smtpUrl: "smtp://user:hunter22@mail.test:2525" }, null);
    expect(config.smtpUrl).toBe("smtp://user:hunter22@mail.test:2525");
    const row = (await q<{ value: unknown; value_enc: string }>(`select value, value_enc from settings where key = 'smtpUrl'`))[0]!;
    expect(row.value).toBeNull();
    expect(row.value_enc).not.toContain("hunter22");
    const view = (await store.listSettings()).find((s) => s.key === "smtpUrl")!;
    expect(view.value).toBeUndefined();
    expect(view.secret).toEqual({ set: true, hint: "…2525", broken: false });
    expect(JSON.stringify(await store.listSettings())).not.toContain("hunter22");
    await store.updateSettings({ smtpUrl: null }, null);
    expect(config.smtpUrl).toBe("");
  });

  it("survive a stored value that can no longer be read", async () => {
    await q(`insert into settings (key, value_enc) values ('stripeKey', 'not-a-ciphertext') on conflict (key) do update set value_enc = excluded.value_enc`);
    await q(`insert into settings (key, value) values ('freeCredits', '"many"') on conflict (key) do update set value = excluded.value`);
    await expect(store.loadSettings()).resolves.toBeUndefined();
    expect(config.stripeKey).toBe("");
    expect(config.freeCredits).toBe(3000);
    const view = (await store.listSettings()).find((s) => s.key === "stripeKey")!;
    expect(view.secret?.broken).toBe(true);
    await q(`delete from settings where key in ('stripeKey', 'freeCredits')`);
  });

  it("seed.local.json fills only what is missing unless forced", async () => {
    await store.updateSettings({ emailFrom: "panel@forja.test" }, null);
    const file = path.join(dir, "seed.json");
    writeFileSync(file, JSON.stringify({ settings: { emailFrom: "file@forja.test", creditsPerUsd: 2000 } }));
    await seedLocal(file);
    expect(config.emailFrom).toBe("panel@forja.test");
    expect(config.creditsPerUsd).toBe(2000);
    await seedLocal(file, { force: true });
    expect(config.emailFrom).toBe("file@forja.test");
    expect(await seedLocal(path.join(dir, "missing.json"))).toEqual([]);
  });

  it("seed.local.json does not bring back what an admin removed", async () => {
    await q(`insert into accounts (id, email) values ('adm1', 'adm1@forja.test')`);
    const file = path.join(dir, "seed-secret.json");
    writeFileSync(file, JSON.stringify({ settings: { stripeKey: "sk_test_from_file_000" } }));
    await seedLocal(file);
    expect(config.stripeKey).toBe("sk_test_from_file_000");
    await store.updateSettings({ stripeKey: null }, "adm1"); // rotated out by an admin
    await seedLocal(file);
    expect(config.stripeKey).toBe("");
  });

  it("never shows defaults to a reader while a save reloads the settings", async () => {
    await store.updateSettings({ signup: "closed" }, null);
    const seen = new Set<string>();
    const sampler = setInterval(() => seen.add(config.signup), 0);
    await Promise.all(Array.from({ length: 20 }, () => store.loadSettings()));
    clearInterval(sampler);
    seen.add(config.signup);
    expect([...seen]).toEqual(["closed"]);
    await store.resetSetting("signup", null);
  });

  it("public module use cases read current values and validate lists without coercion", async () => {
    await settings.updatePlatformSettings({ signup: "closed", "models.allow": ["custom:*"] });
    expect(await settings.store.get("signup")).toBe("closed");
    expect(await settings.getPlatformSettings()).toMatchObject({ signup: "closed", "models.allow": ["custom:*"] });
    await expect(settings.updatePlatformSettings({ signup: "open", "models.allow": "not-a-list" })).rejects.toThrow();
    expect(config.signup).toBe("closed");
    await store.resetSetting("signup", null);
    await store.resetSetting("models.allow", null);
  });

  it("rolls back the entire patch and audit if persistence fails after a previous write", async () => {
    const before = await q("select key, value, value_enc from settings order by key");
    const auditBefore = await q("select id from settings_audit order by id");
    const signupBefore = config.signup;
    const notified: string[][] = [];
    store.onSettingsChanged((keys) => notified.push(keys));
    await q(`alter table settings add constraint test_rejected_email
      check (key <> 'emailFrom' or value <> '"__forja_test_rejected__"'::jsonb)`);
    try {
      await expect(store.updateSettings({
        signup: signupBefore === "closed" ? "open" : "closed",
        emailFrom: "__forja_test_rejected__",
      }, null)).rejects.toThrow();
      expect(await q("select key, value, value_enc from settings order by key")).toEqual(before);
      expect(await q("select id from settings_audit order by id")).toEqual(auditBefore);
      expect(config.signup).toBe(signupBefore);
      expect(notified).toEqual([]);
    } finally {
      await q("alter table settings drop constraint test_rejected_email");
    }
  });
});
