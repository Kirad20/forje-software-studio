import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { readProjectServices, resolveServiceExecution } from "../../../../server/modules/app-runtime/domain/services.js";
import { compileServerModule, checkProject } from "../../../../server/modules/app-runtime/infrastructure/bundler.js";
import { runInSandbox, stopAllSandboxes, getSandboxServices, restartSandboxService, sandboxStats } from "../../../../server/modules/app-runtime/infrastructure/sandbox.js";
import { config } from "../../../../server/shared/config.js";
import { bindRuntimeObservation } from "../../../../server/modules/app-runtime/infrastructure/observation.js";

const enqueue = vi.hoisted(() => vi.fn(async (name: string, payload: unknown) => `${name}:${JSON.stringify(payload)}`));
const cache = vi.hoisted(() => ({
  get: vi.fn(async (_key: string) => ({ status: "pending" })),
  set: vi.fn(async (_key: string, _value: unknown, _ttlSeconds: number) => undefined),
  delete: vi.fn(async (_key: string) => undefined),
}));
vi.mock("../../../../server/modules/app-services/context.js", () => ({
  serviceContext: async () => ({
    env: {},
    jobs: { enqueue },
    cache,
  }),
}));

const entries = {
  "pages/_index.tsx": "export default () => <p>App</p>",
  "endpoints/orders/create_POST.ts": "export default () => ({ ok: true })",
  "endpoints/status_GET.ts": "export default () => ({ ok: true })",
  "jobs/invoice.ts": "export default () => {}",
};
const manifest = {
  version: 1,
  services: {
    orders: { kind: "service", endpoints: ["endpoints/orders/create_POST.ts"], replicas: 2 },
    invoices: { kind: "worker", jobs: ["jobs/invoice.ts"], replicas: 2, maxConcurrency: 1 },
  },
};
const files = { ...entries, "forja.services.json": JSON.stringify(manifest) };

describe("project service topology", () => {
  it("extracts only assigned modules and preserves the monolith without a manifest", () => {
    expect(readProjectServices(entries)).toBeNull();
    expect(resolveServiceExecution(files, "endpoints/orders/create_POST.ts")).toEqual({ service: "orders", replicas: 2, maxConcurrency: 8 });
    expect(resolveServiceExecution(files, "jobs/invoice.ts")).toEqual({ service: "invoices", replicas: 2, maxConcurrency: 1 });
    expect(resolveServiceExecution(files, "endpoints/status_GET.ts").service).toBe("monolith");
  });

  it.each([
    ["malformed JSON", "{"],
    ["unknown options", JSON.stringify({ ...manifest, typo: true })],
    ["missing entrypoint", JSON.stringify({ version: 1, services: { orders: { kind: "service", endpoints: ["endpoints/missing_GET.ts"] } } })],
    ["duplicate ownership", JSON.stringify({ version: 1, services: { one: { kind: "worker", jobs: ["jobs/invoice.ts"] }, two: { kind: "worker", jobs: ["jobs/invoice.ts"] } } })],
    ["worker exposing HTTP", JSON.stringify({ version: 1, services: { worker: { kind: "worker", endpoints: ["endpoints/status_GET.ts"] } } })],
    ["unbounded replicas", JSON.stringify({ version: 1, services: { orders: { kind: "service", endpoints: ["endpoints/status_GET.ts"], replicas: 100 } } })],
    ["fractional concurrency", JSON.stringify({ version: 1, services: { orders: { kind: "service", endpoints: ["endpoints/status_GET.ts"], maxConcurrency: 1.5 } } })],
    ["null entrypoint list", JSON.stringify({ version: 1, services: { invoices: { kind: "worker", endpoints: null, jobs: ["jobs/invoice.ts"] } } })],
  ])("rejects %s rather than silently falling back", (_label, source) => {
    expect(() => readProjectServices({ ...entries, "forja.services.json": source })).toThrow("forja.services.json");
  });

  it("supports dozens of microservices but caps the manifest at 64", () => {
    const build = (count: number) => {
      const sources: Record<string, string> = {};
      const services: Record<string, unknown> = {};
      for (let i = 0; i < count; i++) {
        sources[`endpoints/s${i}/list_GET.ts`] = "export default async () => ({});";
        services[`svc-${i}`] = { kind: "service", endpoints: [`endpoints/s${i}/list_GET.ts`] };
      }
      return { ...sources, "forja.services.json": JSON.stringify({ version: 1, services }) };
    };
    expect(Object.keys(readProjectServices(build(64))!.services)).toHaveLength(64);
    expect(() => readProjectServices(build(65))).toThrow("entre 1 y 64");
  });

  it("blocks publication of a topology referring to nonexistent code", async () => {
    const problems = await checkProject({ ...entries, "forja.services.json": '{"version":1,"services":{"bad":{"kind":"worker","jobs":["jobs/missing.ts"]}}}' });
    expect(problems).toEqual([expect.objectContaining({ file: "forja.services.json", text: expect.stringContaining("inexistente") })]);
  }, 120_000);
});

describe("real independent service processes", () => {
  let release: () => void;
  beforeAll(() => {
    release = bindRuntimeObservation({
      log: () => {}, watchProblems: () => {}, scan: async () => [],
      projectEvents: { on: () => {}, off: () => {} },
    });
  });
  afterAll(() => { release(); });
  afterEach(() => { stopAllSandboxes(); });

  async function execute(source: string, service = "orders", replicas = 2, env: "preview" | "published" = "preview") {
    const file = "endpoints/probe_GET.ts";
    const compiled = await compileServerModule({ [file]: source }, file);
    return runInSandbox("services-test", "endpoint", {
      file: compiled.file, base: "", env_name: env, method: "GET", url: "http://localhost/_api/probe", headers: [], query: {},
      execution: { service, replicas, maxConcurrency: 1 },
    }, "endpoint");
  }

  it("balances replicas, isolates modules and environments, and transports durable enqueue RPC", async () => {
    const probe = "export default async (ctx) => ({ pid: process.pid, queued: await ctx.jobs.enqueue('invoice', { order: 7 }) });";
    const first = await execute(probe);
    const second = await execute(probe);
    const third = await execute(probe);
    expect(first).toEqual({ kind: "json", data: { pid: expect.any(Number), queued: 'invoice:{"order":7}' }, setCookies: [] });
    expect(second).not.toEqual(first);
    expect(third).toEqual(first);
    expect(await execute(probe, "billing")).not.toEqual(first);
    expect(await execute(probe, "orders", 2, "published")).not.toEqual(first);
  }, 30_000);

  it("transports cache get, set, and delete calls through the sandbox RPC", async () => {
    cache.get.mockClear();
    cache.set.mockClear();
    cache.delete.mockClear();
    const result = await execute(`export default async (ctx) => {
      await ctx.cache.set("orders:42", { status: "pending" }, 60);
      const value = await ctx.cache.get("orders:42");
      await ctx.cache.delete("orders:42");
      return value;
    };`);
    expect(result).toMatchObject({ data: { status: "pending" } });
    expect(cache.set).toHaveBeenCalledWith("orders:42", { status: "pending" }, 60);
    expect(cache.get).toHaveBeenCalledWith("orders:42");
    expect(cache.delete).toHaveBeenCalledWith("orders:42");
  }, 30_000);

  it("rejects overload with 503, recovers a crashed replica and preserves a different service", async () => {
    const slow = "export default async () => { await new Promise(r => setTimeout(r, 400)); return process.pid; };";
    const compiled = await compileServerModule({ "endpoints/slow_GET.ts": slow }, "endpoints/slow_GET.ts");
    const input = {
      file: compiled.file, base: "", env_name: "preview" as const, method: "GET", url: "http://localhost/_api/slow", headers: [] as [string, string][], query: {},
      execution: { service: "slow", replicas: 1, maxConcurrency: 1 },
    };
    const pending = runInSandbox("services-test", "endpoint", input, "endpoint");
    await expect(runInSandbox("services-test", "endpoint", input, "endpoint")).rejects.toMatchObject({ detail: { status: 503 } });
    await pending;
    const healthy = await execute("export default () => process.pid", "healthy", 1);
    await expect(execute("export default () => process.exit(1)", "crashing", 1)).rejects.toThrow("se detuvo");
    expect(await execute("export default () => process.pid", "healthy", 1)).toEqual(healthy);
    await expect(execute("export default () => 'recovered'", "crashing", 1)).resolves.toMatchObject({ data: "recovered" });
  }, 30_000);

  it("drains and stops a removed replica without requiring another request", async () => {
    const probe = "export default () => process.pid";
    const retained = await execute(probe);
    enqueue.mockClear();
    const retiring = execute("export default async (ctx) => { await ctx.jobs.enqueue('started'); await new Promise(r => setTimeout(r, 800)); return process.pid; };");
    await expect.poll(() => enqueue.mock.calls.some(([name]) => name === "started")).toBe(true);
    expect(await execute(probe, "orders", 1)).toEqual(retained);
    const result = await retiring;
    expect(result).toMatchObject({ data: expect.any(Number) });
    const pid = (result as { data: number }).data;
    await expect.poll(() => {
      try { process.kill(pid, 0); return true; } catch { return false; }
    }, { timeout: 2000 }).toBe(false);
    expect(await execute(probe, "orders", 1)).toEqual(retained);
  }, 30_000);

  it("reports real replica processes and restarts only the selected service", async () => {
    const probe = "export default () => process.pid";
    const orders = await execute(probe, "orders", 1);
    const billing = await execute(probe, "billing", 1);
    expect(getSandboxServices("services-test")).toEqual(expect.arrayContaining([
      { env: "preview", service: "orders", replicas: [{ pid: (orders as { data: number }).data, active: 0, ready: true }] },
    ]));
    expect(getSandboxServices("other-project")).toEqual([]);
    restartSandboxService("services-test", "orders", "preview");
    expect(getSandboxServices("services-test").map((entry) => entry.service)).toEqual(["billing"]);
    expect(await execute(probe, "billing", 1)).toEqual(billing);
    expect(await execute(probe, "orders", 1)).not.toEqual(orders);
  }, 30_000);

  it("caps live sandbox processes by stopping the least recently used idle one, never a busy one", async () => {
    const previous = config.sandbox.maxProcesses;
    config.sandbox.maxProcesses = 2;
    try {
      const probe = "export default () => process.pid";
      const a = await execute(probe, "svc-a", 1);
      await execute(probe, "svc-b", 1);
      expect(await execute(probe, "svc-a", 1)).toEqual(a);
      await execute(probe, "svc-c", 1);
      expect(sandboxStats()).toMatchObject({ processes: 2, maxProcesses: 2 });
      // b was the least recently used; a survived.
      expect(await execute(probe, "svc-a", 1)).toEqual(a);

      const busy = execute("export default async () => { await new Promise(r => setTimeout(r, 800)); return process.pid; }", "svc-busy", 1);
      await expect.poll(() => sandboxStats().items.some((item) => item.busy && item.pid)).toBe(true);
      await execute(probe, "svc-d", 1);
      await execute(probe, "svc-e", 1);
      await expect(busy).resolves.toMatchObject({ data: expect.any(Number) });
    } finally {
      config.sandbox.maxProcesses = previous;
    }
  }, 30_000);
});
