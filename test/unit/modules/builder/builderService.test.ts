import { expect, it, vi } from "vitest";
import { createBuilderService } from "../../../../server/modules/builder/index.js";
import type { Account } from "../../../../server/modules/identity/contracts.js";

const account: Account = {
  id: "account-1",
  email: "owner@example.com",
  name: "Owner",
  credits: 10,
  platformRole: "user",
};

function ports() {
  const runTurn = vi.fn(async (_input: unknown, emit: (event: { type: string; text?: string }) => void) => {
    emit({ type: "text", text: "done" });
  });
  const runTool = vi.fn(async () => ({
    output: { text: "tool result", images: [] as { media_type: string; data: string }[] },
  }));
  return {
    isBuilding: vi.fn(() => false),
    stopBuilding: vi.fn(),
    reloadSettings: vi.fn(async () => {}),
    startSecurityReview: vi.fn(async () => true),
    runTurn,
    runTool,
  };
}

it("protects the builder control API with its internal token", async () => {
  const app = createBuilderService(ports(), "builder-secret");
  const response = await app.request("/internal/builder/status", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ projectId: "p1" }),
  });

  expect(response.status).toBe(401);
});

it("streams builder events and forwards the complete turn request", async () => {
  const builder = ports();
  const app = createBuilderService(builder, "builder-secret");
  const response = await app.request("/internal/builder/turn", {
    method: "POST",
    headers: { authorization: "Bearer builder-secret", "content-type": "application/json" },
    body: JSON.stringify({
      account,
      projectId: "p1",
      userText: "Build a list",
      attachments: ["static/uploads/image.png"],
      mode: "plan",
      implementPlan: false,
    }),
  });

  expect(response.status).toBe(200);
  expect(response.headers.get("content-type")).toContain("text/event-stream");
  await expect(response.text()).resolves.toContain('data: {"type":"text","text":"done"}');
  expect(builder.runTurn).toHaveBeenCalledOnce();
  expect(builder.runTurn.mock.calls[0]?.[0]).toMatchObject({
    account,
    projectId: "p1",
    userText: "Build a list",
    attachments: ["static/uploads/image.png"],
    mode: "plan",
    implementPlan: false,
  });
});

it("reports existing work and forwards stop requests", async () => {
  const builder = ports();
  builder.isBuilding.mockReturnValue(true);
  const app = createBuilderService(builder, "builder-secret");
  const post = (path: string) => app.request(path, {
    method: "POST",
    headers: { authorization: "Bearer builder-secret", "content-type": "application/json" },
    body: JSON.stringify(path.endsWith("/turn")
      ? { account, projectId: "p1", userText: "Build", mode: "build" }
      : { projectId: "p1" }),
  });

  expect((await post("/internal/builder/turn")).status).toBe(409);
  await expect((await post("/internal/builder/status")).json()).resolves.toEqual({ building: true });
  await post("/internal/builder/stop");
  expect(builder.stopBuilding).toHaveBeenCalledWith("p1");
  expect(builder.runTurn).not.toHaveBeenCalled();
});

it("reloads persisted platform settings on authenticated requests", async () => {
  const builder = ports();
  const app = createBuilderService(builder, "builder-secret");
  const response = await app.request("/internal/builder/reload", {
    method: "POST",
    headers: { authorization: "Bearer builder-secret" },
  });

  expect(response.status).toBe(200);
  expect(builder.reloadSettings).toHaveBeenCalledOnce();
});

it("starts a deep security review in the worker", async () => {
  const builder = ports();
  const app = createBuilderService(builder, "builder-secret");
  const response = await app.request("/internal/builder/security-review", {
    method: "POST",
    headers: { authorization: "Bearer builder-secret", "content-type": "application/json" },
    body: JSON.stringify({ account, projectId: "p1" }),
  });

  expect(response.status).toBe(200);
  await expect(response.json()).resolves.toEqual({ started: true });
  expect(builder.startSecurityReview).toHaveBeenCalledWith(account, "p1");
});
