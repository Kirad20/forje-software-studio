import { afterEach, describe, expect, it, vi } from "vitest";
import { createAppRuntimeHttpApp } from "../../../../server/bootstrap/appRuntimeHttp.js";
import { readServiceRuntime, restartServiceRuntime } from "../../../../server/modules/app-runtime/infrastructure/serviceControlRuntime.js";
import type { AppRuntimeHttpPorts } from "../../../../server/bootstrap/appRuntimeHttp.js";

afterEach(() => vi.unstubAllGlobals());
describe("Remote service control forwarding", () => {
  it("forwards authenticated snapshots and targeted restart to the configured runtime", async () => {
    const restart = vi.fn();
    const app = createAppRuntimeHttpApp({
      getProject: async () => ({ id: "p" }),
      internalToken: "control-token",
      getSandboxServices: () => [{ env: "preview", service: "orders", replicas: [{ pid: 123, ready: true, active: 2 }] }],
      restartSandboxService: restart,
    } as unknown as AppRuntimeHttpPorts);
    const fetch = vi.fn((url: string, init: RequestInit) => app.request(url, init));
    vi.stubGlobal("fetch", fetch);
    const result = await readServiceRuntime("p", "http://runtime/", "control-token");
    expect(result).toMatchObject({ available: true, scope: "app-runtime", services: [{ service: "orders", replicas: [{ pid: 123, active: 2 }] }] });
    expect(fetch.mock.calls[0]?.[0]).toBe("http://runtime/internal/runtime/service-control/snapshot");
    await restartServiceRuntime("p", "orders", "published", "http://runtime", "control-token");
    expect(restart).toHaveBeenCalledWith("p", "orders", "published");
    await expect(readServiceRuntime("p", "http://runtime", "wrong-token")).rejects.toThrow(/401/);
  });
  it("rejects malformed metric responses instead of fabricating health", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response('{"available":true,"services":[]}', { headers: { "content-type": "application/json" } })));
    await expect(readServiceRuntime("p", "http://runtime", "control-token")).rejects.toThrow();
  });
});
