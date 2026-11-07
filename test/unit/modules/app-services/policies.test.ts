import { describe, expect, it, vi } from "vitest";
import { createPayments } from "../../../../server/modules/app-services/application/payments.js";
import { createRealtime } from "../../../../server/modules/app-services/application/realtime.js";
import { createContext } from "../../../../server/modules/app-services/application/context.js";
import { createJobs } from "../../../../server/modules/app-services/application/jobs.js";
import { createAuth } from "../../../../server/modules/app-services/application/auth.js";
import { createAi } from "../../../../server/modules/app-services/application/ai.js";
import { createEmail } from "../../../../server/modules/app-services/application/email.js";
import { createStorage, MAX_PROJECT_STORAGE_BYTES } from "../../../../server/modules/app-services/application/storage.js";
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

  it("uses explicit selection, requires actual tools and returns total Fusion usage with the final content", async () => {
    const model = { id: "selected", model: "chosen", label: "Chosen" };
    const usage = { input: 50, output: 12, cacheRead: 10, cacheWrite: 2 };
    const fusion = { operationId: "op", effort: "high", pattern: "critique", warnings: ["budget limit"], steps: [] };
    const callModel = vi.fn(async () => ({ model, credits: 8, usd: 0.08, totalUsage: usage, fusion,
      response: { content: [{ type: "text", text: "accepted" }], stopReason: "end", usage: { input: 10, output: 2, cacheRead: 0 } } }));
    const log = vi.fn();
    const api = createAi({ one: async () => ({ owner_id: "a", ai_enabled: true, credits: 50 }), q: vi.fn(),
      log, allowedModels: async () => [model], callModel } as any);
    const tools = [{ name: "read", description: "", input_schema: {} }];
    expect(await api.appAiChat("p", { model: "chosen", messages: [], tools }))
      .toMatchObject({ text: "accepted", model: model.id, credits: 8, usd: 0.08, usage, fusion });
    expect(callModel).toHaveBeenCalledWith({ accountId: "a", projectId: "p" }, "app", expect.objectContaining({ needsTools: true }),
      expect.objectContaining({ tools }), { billing: { payerId: "a", projectId: "p", source: "app" }, explicit: model });
    expect(log).toHaveBeenCalledWith("p", expect.objectContaining({ message: expect.stringContaining("62+12 tokens") }));
    await expect(api.appAiChat("p", { model: "forbidden", messages: [] })).rejects.toThrow("no está permitido");
    expect(callModel).toHaveBeenCalledOnce();
  });

  it("falls back to final response usage for non-Fusion app callers", async () => {
    const usage = { input: 5, output: 2, cacheRead: 1 };
    const callModel = vi.fn(async () => ({ model: { id: "m", label: "M" }, credits: 1,
      response: { content: [], stopReason: "end", usage } }));
    const api = createAi({ one: async () => ({ owner_id: "a", ai_enabled: true, credits: 1 }),
      q: vi.fn(), log: vi.fn(), allowedModels: vi.fn(), callModel } as any);
    expect(await api.appAiChat("p", { messages: [] })).toMatchObject({ usage });
    expect(callModel.mock.calls[0]).toBeDefined();
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

  it("enforces a project storage quota before writing files", async () => {
    const write = vi.fn();
    const q = vi.fn();
    const one = vi.fn(async (operation: string) => operation === "storageGet" ? undefined : { bytes: MAX_PROJECT_STORAGE_BYTES });
    const api = createStorage({
      one, q, newId: () => "id",
      files: { extension: () => ".txt", write },
    } as any);

    await expect(api.putObject("p", new Uint8Array([1]), { filename: "note.txt" }))
      .rejects.toMatchObject({ status: 413 });
    expect(write).not.toHaveBeenCalled();
    expect(q).not.toHaveBeenCalled();
  });

  it("serializes concurrent uploads so they cannot race past the project quota", async () => {
    let used = MAX_PROJECT_STORAGE_BYTES - 1;
    let nextId = 0;
    const write = vi.fn();
    const one = vi.fn(async (operation: string) =>
      operation === "storageGet" ? undefined : { bytes: used },
    );
    const q = vi.fn(async (_operation: string, params: unknown[]) => {
      used += Number(params[4]);
      return [];
    });
    const api = createStorage({
      one, q, newId: () => String(++nextId),
      files: { extension: () => ".txt", write },
    } as any);

    const results = await Promise.allSettled([
      api.putObject("p", new Uint8Array([1]), { filename: "a.txt" }),
      api.putObject("p", new Uint8Array([2]), { filename: "b.txt" }),
    ]);

    expect(results.filter((result) => result.status === "fulfilled")).toHaveLength(1);
    expect(results.filter((result) => result.status === "rejected")).toHaveLength(1);
    expect(write).toHaveBeenCalledTimes(1);
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

  it("limits realtime connections, subscriptions and payload sizes", () => {
    const api = createRealtime({ maxConnectionsPerProject: 1, maxChannelsPerSocket: 1, maxMessageBytes: 64 });
    const callbacks: Record<string, (raw?: unknown) => void> = {};
    const socket = {
      readyState: 1, send: vi.fn(), close: vi.fn(),
      on: vi.fn((event, cb) => { callbacks[event] = cb; }), off: vi.fn(),
    };
    const rejected = { ...socket, send: vi.fn(), close: vi.fn(), on: vi.fn(), off: vi.fn() };

    api.attachSocket("p", socket);
    expect(api.attachSocket("p", rejected)).toBe(false);
    expect(rejected.close).toHaveBeenCalledWith(1013, expect.any(String));

    callbacks.message(JSON.stringify({ type: "subscribe", channel: "one" }));
    callbacks.message(JSON.stringify({ type: "subscribe", channel: "two" }));
    expect(socket.send).toHaveBeenCalledWith(expect.stringContaining("error"));
    expect(() => api.publish("p", "one", "x".repeat(100))).toThrow("grande");
    callbacks.message(JSON.stringify({ type: "presence:join", channel: "one", data: "0123456789" }));
    expect(socket.send).toHaveBeenCalledWith(expect.stringContaining("presencia"));

    callbacks.close();
    expect(api.attachSocket("p", rejected)).toBe(true);
    api.stopRealtime();
  });

  it("tracks ephemeral realtime presence and removes it when a socket closes", () => {
    const api = createRealtime();
    const makeSocket = () => {
      const callbacks: Record<string, (raw?: unknown) => void> = {};
      return {
        callbacks,
        socket: {
          readyState: 1, send: vi.fn(), close: vi.fn(),
          on: vi.fn((event, cb) => { callbacks[event] = cb; }), off: vi.fn(),
        },
      };
    };
    const first = makeSocket();
    api.attachSocket("p", first.socket);
    first.callbacks.message(JSON.stringify({ type: "subscribe", channel: "room" }));
    first.callbacks.message(JSON.stringify({ type: "presence:join", channel: "room", data: { name: "Ada" } }));

    const second = makeSocket();
    api.attachSocket("p", second.socket);
    second.callbacks.message(JSON.stringify({ type: "subscribe", channel: "room" }));
    expect(second.socket.send).toHaveBeenCalledWith(expect.stringContaining('"action":"sync"'));
    expect(second.socket.send).toHaveBeenCalledWith(expect.stringContaining('"name":"Ada"'));

    first.callbacks.close();
    expect(second.socket.send).toHaveBeenCalledWith(expect.stringContaining('"action":"leave"'));
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
    let failRun!: (error: Error) => void;
    const runNow = vi.fn(() => new Promise<void>((_resolve, reject) => { failRun = reject; }));
    api.bindJobs({ runNow, addTimer: vi.fn() });
    const accepted = ctx.jobs.run("job");
    await accepted;
    expect(runNow).toHaveBeenCalledWith("p", "preview", "job", null, "background");
    failRun(new Error("failed"));
    await Promise.resolve();
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
