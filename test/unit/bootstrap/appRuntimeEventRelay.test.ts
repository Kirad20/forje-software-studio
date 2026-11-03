import { afterEach, expect, it, vi } from "vitest";
import { emitProject } from "../../../server/modules/project-observability/events.js";
import { startAppRuntimeEventRelay } from "../../../server/bootstrap/appRuntimeEventRelay.js";

afterEach(() => {
  vi.unstubAllGlobals();
});

it("forwards file-change events to app-runtime using its internal token", async () => {
  const fetch = vi.fn(async () => Response.json({ ok: true }));
  vi.stubGlobal("fetch", fetch);
  const stop = startAppRuntimeEventRelay("http://app-runtime:4200", "runtime-token");

  emitProject("p1", { type: "files", paths: ["pages/home.tsx"] });
  await vi.waitFor(() => expect(fetch).toHaveBeenCalledOnce());

  expect(fetch).toHaveBeenCalledWith("http://app-runtime:4200/internal/runtime/project-event", expect.objectContaining({
    method: "POST",
    headers: { authorization: "Bearer runtime-token", "content-type": "application/json" },
    body: JSON.stringify({ projectId: "p1", event: { type: "files", paths: ["pages/home.tsx"] } }),
  }));
  stop();
});

it("does not relay unrelated project events", async () => {
  const fetch = vi.fn(async () => Response.json({ ok: true }));
  vi.stubGlobal("fetch", fetch);
  const stop = startAppRuntimeEventRelay("http://app-runtime:4200", "runtime-token");

  emitProject("p1", { type: "log", entry: {
    at: "now",
    env: "preview",
    level: "info",
    source: "request",
    message: "request",
  } });

  expect(fetch).not.toHaveBeenCalled();
  stop();
});
