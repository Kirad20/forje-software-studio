import { describe, expect, it, vi } from "vitest";
import { createPayments } from "../../../../server/modules/app-services/application/payments.js";
import { createRealtime } from "../../../../server/modules/app-services/application/realtime.js";
import { createContext } from "../../../../server/modules/app-services/application/context.js";
import { createJobs } from "../../../../server/modules/app-services/application/jobs.js";
import { createAuth } from "../../../../server/modules/app-services/application/auth.js";
import { createAi } from "../../../../server/modules/app-services/application/ai.js";
import { createEmail } from "../../../../server/modules/app-services/application/email.js";
import { createStorage } from "../../../../server/modules/app-services/application/storage.js";
import { createSecrets } from "../../../../server/modules/app-services/application/secrets.js";
import { createAnalytics } from "../../../../server/modules/app-services/application/analytics.js";

describe("app service capability boundaries", () => {
  it("rejects invalid signup before hashing or writing", async () => {
    const hashPassword = vi.fn();
    const projectDb = vi.fn();
    const api = createAuth({ hashPassword, projectDb } as any);
    await expect(api.signUp("p", { email: "bad", password: "abcdefgh" })).rejects.toThrow("Correo no válido");
    await expect(api.signUp("p", { email: "user@example.com", password: "short" })).rejects.toThrow("8 caracteres");
    expect(hashPassword).not.toHaveBeenCalled();
    expect(projectDb).not.toHaveBeenCalled();
  });

  it("blocks disabled AI before selecting or billing a model", async () => {
    const callModel = vi.fn();
    const api = createAi({ one: async () => ({ owner_id: "a", ai_enabled: false, credits: 50 }), callModel } as any);
    await expect(api.appAiChat("p", { messages: [] })).rejects.toThrow("desactivada");
    expect(callModel).not.toHaveBeenCalled();
  });

  it("redirects unverified sending domains to the project owner", async () => {
    const sendMail = vi.fn();
    const q = vi.fn();
    const api = createEmail({
      one: vi.fn().mockResolvedValue({ owner_email: "owner@example.com", name: "App", email_domain: null, email_domain_verified: false }),
      q, log: vi.fn(), getTransport: () => ({ sendMail }), emailFrom: () => "platform@example.com",
    });
    const result = await api.sendEmail("p", { to: "user@example.com", subject: "Hi", html: "<p>Hello</p>" });
    expect(sendMail).toHaveBeenCalledWith(expect.objectContaining({ to: "owner@example.com", subject: "[para: user@example.com] Hi" }));
    expect(result[0].redirected).toBe(true);
    expect(q).toHaveBeenCalled();
  });

  it("rejects storage traversal before any driver access", async () => {
    const read = vi.fn();
    const one = vi.fn();
    const api = createStorage({ one, files: { read } } as any);
    await expect(api.getObject("p", "../outside")).rejects.toThrow("Clave");
    expect(read).not.toHaveBeenCalled();
    expect(one).not.toHaveBeenCalled();
  });

  it("lets project secrets override integrations and reports decrypt failures without exposing values", async () => {
    const onDecryptError = vi.fn();
    const api = createSecrets({
      q: vi.fn().mockResolvedValue([{ name: "KEY", value_enc: "encrypted" }, { name: "BROKEN", value_enc: "invalid" }]),
      encrypt: vi.fn(), decrypt: (value) => { if (value === "invalid") throw new Error("bad key"); return "project"; },
      integrationEnv: async () => ({ KEY: "integration", OTHER: "other" }), onDecryptError,
    });
    expect(await api.secretEnv("p")).toEqual({ KEY: "project", OTHER: "other" });
    expect(onDecryptError).toHaveBeenCalledWith("p", "BROKEN", expect.any(Error));
    await expect(api.setSecret("p", "bad", "value")).rejects.toThrow("Nombre");
  });

  it("filters bots and scopes cookie-free visitor identity to project and day", async () => {
    const q = vi.fn();
    const hash = vi.fn((value) => value);
    const api = createAnalytics({ q, hash, now: () => new Date("2026-11-02"), salt: () => "salt" });
    await api.recordPageView("p", { ip: "ip", userAgent: "HeadlessChrome", path: "/" });
    expect(q).not.toHaveBeenCalled();
    api.visitorId("p", "ip", "browser");
    expect(hash).toHaveBeenCalledWith("salt|p|2026-11-02|ip|browser");
  });
  it("prefers project payment credentials and serializes checkout defaults", async () => {
    const stripe = vi.fn().mockResolvedValue({ id: "checkout", url: "url" });
    const api = createPayments({ stripe, platformKey: () => "platform" }).paymentsFor({ STRIPE_SECRET_KEY: "project" });
    await api.checkout({ lineItems: [{ name: "Item", amountCents: 100 }], successUrl: "ok", cancelUrl: "cancel" });
    expect(stripe.mock.calls[0][0]).toBe("project");
    expect(stripe.mock.calls[0][2].get("line_items[0][quantity]")).toBe("1");
  });

  it("keeps realtime fanout scoped by project and cleans disconnected subscriptions", () => {
    const api = createRealtime();
    const callbacks: Record<string, (raw?: unknown) => void> = {};
    const socket = { readyState: 1, send: vi.fn(), on: vi.fn((event, cb) => { callbacks[event] = cb; }), off: vi.fn() };
    api.attachSocket("one", socket);
    callbacks.message(JSON.stringify({ type: "subscribe", channel: "room" }));
    expect(api.publish("two", "room", {})).toBe(0);
    expect(api.publish("one", "room", {})).toBe(1);
    callbacks.close();
    expect(api.realtimeStats("one")).toEqual([]);
    expect(socket.off).toHaveBeenCalledWith("message", expect.any(Function));
    api.stopRealtime();
    api.stopRealtime();
  });

  it("requires explicit jobs binding and reports background failure without blocking requests", async () => {
    const log = vi.fn();
    const api = createContext({
      secretEnv: async () => ({ KEY: "value" }), projectDb: vi.fn(), log,
      paymentsFor: vi.fn(), putObject: vi.fn(), getObject: vi.fn(), deleteObject: vi.fn(),
      listObjects: vi.fn(), sendEmail: vi.fn(), appAiChat: vi.fn(), publish: vi.fn(),
    });
    const ctx = await api.serviceContext("p", "preview", "https://app", "endpoint");
    expect(() => ctx.jobs.run("job")).toThrow(/configurad/);
    const runNow = vi.fn().mockRejectedValue(new Error("failed"));
    api.bindJobs({ runNow, addTimer: vi.fn() });
    await ctx.jobs.run("job");
    await Promise.resolve();
    expect(runNow).toHaveBeenCalledWith("p", "preview", "job", null, "background");
    expect(log).toHaveBeenCalledWith("p", expect.objectContaining({ level: "error", message: expect.stringContaining("failed") }));
  });

  it("starts once, binds explicitly, and stops all scheduled work", async () => {
    const stop = vi.fn();
    const bindJobs = vi.fn();
    const q = vi.fn().mockResolvedValue([]);
    const api = createJobs({
      q, newId: () => "id", log: vi.fn(), bindJobs,
      runtime: () => ({
        publishedFiles: async () => ({}), readAllFiles: async () => ({}),
        jobFiles: () => [{ name: "daily", file: "jobs/daily.ts" }],
        readJobSettings: () => ({ schedule: "0 8 * * *" }),
        compileServerModule: vi.fn(), runInSandbox: vi.fn(), appUrl: vi.fn(), previewOrigin: vi.fn(),
      }),
      cron: () => ({ stop, nextRuns: () => [new Date(0), new Date(86400000)], nextRun: () => null, getPattern: () => "0 8 * * *" }),
    });
    expect(bindJobs).not.toHaveBeenCalled();
    await api.startJobRunner();
    await api.startJobRunner();
    expect(bindJobs).toHaveBeenCalledTimes(1);
    await api.scheduleProject("p");
    await api.stopJobRunner();
    expect(stop).toHaveBeenCalledTimes(1);
    expect(api.isJobRunnerStarted()).toBe(false);
  });

  it("waits for running sandbox work on shutdown and records execution status", async () => {
    let finish!: () => void;
    let entered!: () => void;
    const ready = new Promise<void>((resolve) => { entered = resolve; });
    const work = new Promise<void>((resolve) => { finish = resolve; });
    const q = vi.fn().mockImplementation(async (operation: string) => operation === "jobCreateRun" ? [{ id: 1 }] : []);
    const runInSandbox = vi.fn(async () => { entered(); await work; });
    const api = createJobs({
      q, newId: () => "id", log: vi.fn(), bindJobs: vi.fn(),
      runtime: () => ({
        publishedFiles: async () => ({}), readAllFiles: async () => ({}),
        jobFiles: () => [{ name: "daily", file: "jobs/daily.ts" }], readJobSettings: () => ({}),
        compileServerModule: async () => ({ file: "compiled.ts" }), runInSandbox,
        previewOrigin: () => "https://preview", appUrl: () => "https://published",
      }),
      cron: vi.fn(),
    });
    const run = api.runJob("p", "preview", "daily", { x: 1 }, "background");
    await ready;
    let stopped = false;
    const shutdown = api.stopJobRunner().then(() => { stopped = true; });
    await Promise.resolve();
    expect(stopped).toBe(false);
    expect(runInSandbox).toHaveBeenCalledWith("p", "job", { env_name: "preview", file: "compiled.ts", base: "https://preview", payload: { x: 1 }, job: "daily" }, "job");
    finish();
    await Promise.all([run, shutdown]);
    expect(stopped).toBe(true);
    expect(q).toHaveBeenCalledWith("jobCompleteRun", [1]);
  });

  it("does not resurrect a poller when stop races startup", async () => {
    let release!: () => void;
    const pending = new Promise<any[]>((resolve) => { release = () => resolve([]); });
    const api = createJobs({
      q: vi.fn().mockReturnValue(pending), newId: vi.fn(), log: vi.fn(), bindJobs: vi.fn(),
      runtime: vi.fn().mockReturnValue({}), cron: vi.fn(),
    });
    const startup = api.startJobRunner();
    const shutdown = api.stopJobRunner();
    release();
    await Promise.all([startup, shutdown]);
    expect(api.isJobRunnerStarted()).toBe(false);
  });
});
