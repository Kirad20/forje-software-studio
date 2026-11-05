import { describe, expect, it, vi } from "vitest";
import { createServiceControl } from "../../../../server/modules/app-runtime/application/serviceControl.js";

const files = {
  "endpoints/orders_GET.ts": "export default () => []",
  "endpoints/health_GET.ts": "export default () => true",
  "jobs/invoices.ts": "export default () => {}",
  "forja.services.json": JSON.stringify({ version: 1, services: {
    orders: { kind: "service", endpoints: ["endpoints/orders_GET.ts"], replicas: 2 },
    invoices: { kind: "worker", jobs: ["jobs/invoices.ts"], maxConcurrency: 2 },
  } }),
};
function fixture(source = files) {
  const writeManifest = vi.fn(async (_projectId: string, _content: string) => {});
  const restart = vi.fn(async () => {});
  const control = createServiceControl({
    readFiles: async () => source,
    writeManifest,
    listQueue: async () => [
      { id: "1", job: "invoices", service: "invoices", env: "preview", status: "failed", attempts: 3, maxAttempts: 3, error: "SMTP down" },
      { id: "2", job: "invoices", service: "invoices", env: "published", status: "queued", attempts: 1, maxAttempts: 3, error: null },
    ],
    runtime: async () => ({ available: true, scope: "app-runtime", services: [
      { service: "orders", env: "preview", replicas: [{ pid: 123, active: 1, ready: true }] },
    ] }),
    restart,
  });
  return { control, writeManifest, restart };
}

describe("Project service control", () => {
  it("lists declared services and unassigned monolith, desired vs actual, and real queue failures", async () => {
    const { control } = fixture();
    const result = await control.snapshot("p");
    expect(result.services.map((s) => s.name)).toEqual(["orders", "invoices", "monolith"]);
    expect(result.services[0]).toMatchObject({ desired: { replicas: 2, maxConcurrency: 8 }, runtime: [{ env: "preview", replicas: [{ pid: 123, active: 1, ready: true }] }] });
    expect(result.services[1]).toMatchObject({ queueCounts: { failed: 1, queued: 1 }, lastFailure: "SMTP down" });
    expect(result.services[2]?.endpoints).toEqual(["endpoints/health_GET.ts"]);
  });
  it("shows a compatible monolith without creating a manifest", async () => {
    const { control, writeManifest } = fixture({ "endpoints/orders_GET.ts": "" } as typeof files);
    const result = await control.snapshot("p");
    expect(result.manifest).toBe(false);
    expect(result.services).toHaveLength(1);
    expect(result.services[0]).toMatchObject({ name: "monolith", scalable: false, desired: { replicas: 1, maxConcurrency: null } });
    await expect(control.scale("p", "monolith", { replicas: 2 })).rejects.toThrow(/monolith/i);
    expect(writeManifest).not.toHaveBeenCalled();
  });
  it("persists only scaling fields, preserving other service settings", async () => {
    const { control, writeManifest } = fixture();
    await control.scale("p", "orders", { replicas: 3, maxConcurrency: 4 });
    const saved = JSON.parse(writeManifest.mock.calls[0]![1] as string);
    expect(saved.services.orders).toEqual({ kind: "service", endpoints: ["endpoints/orders_GET.ts"], replicas: 3, maxConcurrency: 4 });
    expect(saved.services.invoices).toEqual(JSON.parse(files["forja.services.json"]).services.invoices);
  });
  it("rejects unknown fields/services and invalid limits without writing", async () => {
    const { control, writeManifest } = fixture();
    for (const patch of [{ replicas: 9 }, { replicas: 0 }, { maxConcurrency: 33 }, { replicas: 1.5 }, { kind: "worker" }, {}, null]) {
      await expect(control.scale("p", "orders", patch)).rejects.toThrow();
    }
    await expect(control.scale("p", "missing", { replicas: 2 })).rejects.toThrow();
    const malformed = fixture({ ...files, "forja.services.json": files["forja.services.json"].replace('"version":1', '"version":2') });
    await expect(malformed.control.scale("p", "orders", { replicas: 2 })).rejects.toThrow();
    expect(writeManifest).not.toHaveBeenCalled();
  });
  it("targets an existing service and rejects unknown restart targets", async () => {
    const { control, restart } = fixture();
    await control.restart("p", "invoices", "preview");
    expect(restart).toHaveBeenCalledWith("p", "invoices", "preview");
    await expect(control.restart("p", "missing")).rejects.toThrow();
    await expect(control.restart("p", "orders", "other")).rejects.toThrow();
  });
  it("validates the whole manifest's aggregate replica budget before persistence", async () => {
    const manifest = JSON.parse(files["forja.services.json"]);
    manifest.services.orders.replicas = 8;
    manifest.services.invoices.replicas = 7;
    manifest.services.health = { kind: "service", endpoints: ["endpoints/health_GET.ts"], replicas: 1 };
    const { control, writeManifest } = fixture({ ...files, "forja.services.json": JSON.stringify(manifest) });
    await expect(control.scale("p", "health", { replicas: 2 })).rejects.toThrow(/16/);
    expect(writeManifest).not.toHaveBeenCalled();
  });
  it("keeps queue available while clearly reporting unreachable runtime", async () => {
    const { control } = fixture();
    // Runtime failure must not become a fabricated zero/healthy snapshot.
    const unavailable = createServiceControl({
      readFiles: async () => files, writeManifest: async () => {}, listQueue: async () => [],
      runtime: async () => { throw new Error("offline"); }, restart: async () => {},
    });
    expect((await unavailable.snapshot("p")).runtime).toMatchObject({ available: false, error: "offline" });
    expect((await control.snapshot("p")).queueScope).toMatch(/100/);
  });
});
