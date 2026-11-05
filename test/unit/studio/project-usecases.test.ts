import { describe, expect, it, vi } from "vitest";
import { createProjectUseCases, parseProjectEvent, subscribeToProjectEvents } from "../../../studio/src/features/projects/application/usecases.js";
import { HttpClient } from "../../../studio/src/shared/infrastructure/http-client.js";
import type { EventStreamPort } from "../../../studio/src/shared/infrastructure/browser.js";

describe("Project use cases", () => {
  it("composes projects and folders for the dashboard", async () => {
    const fetch = vi.fn(async (input: RequestInfo | URL) =>
      new Response(
        JSON.stringify(String(input).endsWith("/folders") ? { folders: [{ id: "folder", name: "Work" }] } : { projects: [], shared: [{ id: "shared" }] }),
        { status: 200 },
      ),
    );
    const useCases = createProjectUseCases(new HttpClient(fetch));

    await expect(useCases.dashboard()).resolves.toEqual({
      projects: [],
      shared: [{ id: "shared" }],
      folders: [{ id: "folder", name: "Work" }],
    });
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("creates a project from a prompt through the typed HTTP port", async () => {
    const fetch = vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
      expect(init?.method).toBe("POST");
      expect(JSON.parse(String(init?.body))).toEqual({ prompt: "A portfolio" });
      return new Response(JSON.stringify({ project: { id: "project-id" } }), { status: 201 });
    });

    await expect(createProjectUseCases(new HttpClient(fetch)).createProject("A portfolio")).resolves.toEqual({
      project: { id: "project-id" },
    });
  });

  it("parses typed project SSE events and closes its browser stream on cleanup", () => {
    const source: EventStreamPort = { onmessage: null, onerror: null, close: vi.fn() };
    const createEventSource = vi.fn(() => source);
    const onEvent = vi.fn();
    const unsubscribe = subscribeToProjectEvents(createEventSource, "project-id", onEvent);

    expect(createEventSource).toHaveBeenCalledWith("/api/projects/project-id/events");
    source.onmessage?.(new MessageEvent("message", { data: JSON.stringify({ type: "published" }) }));
    source.onmessage?.(new MessageEvent("message", { data: "not json" }));
    expect(onEvent).toHaveBeenCalledOnce();
    expect(onEvent).toHaveBeenCalledWith({ type: "published" });
    expect(parseProjectEvent(JSON.stringify({ type: "log", entry: { at: "now" } }))).toBeNull();

    unsubscribe();
    expect(source.close).toHaveBeenCalledOnce();
  });

  it("sends an optional starter selector while leaving the legacy prompt input unchanged", async () => {
    const fetch = vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
      expect(JSON.parse(String(init?.body))).toEqual({ prompt: "Orders demo", template: "orders-invoices" });
      return Response.json({ project: { id: "demo" } });
    });
    await createProjectUseCases(new HttpClient(fetch)).createProject("Orders demo", { template: "orders-invoices" });
    expect(fetch).toHaveBeenCalledOnce();
  });
});
