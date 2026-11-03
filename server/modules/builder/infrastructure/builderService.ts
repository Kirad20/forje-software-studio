import { Hono } from "hono";
import { z } from "zod";
import { isInternalServiceRequest } from "../../../shared/internalServiceAuth.js";
import type { Account } from "../../identity/contracts.js";
import type { AgentEvent } from "../domain/AgentExecution.js";
import type { ChatMode } from "../domain/BuilderWorkflow.js";
import type { ToolContext, ToolOutput } from "./BuilderToolsAdapter.js";

export interface BuilderTurnInput {
  account: Account;
  projectId: string;
  userText: string;
  attachments: string[];
  mode: ChatMode;
  implementPlan: boolean;
}

export interface BuilderToolResult {
  output: ToolOutput;
  data?: Record<string, unknown>;
}

export interface BuilderServicePorts {
  isBuilding(projectId: string): boolean;
  stopBuilding(projectId: string): void;
  reloadSettings(): Promise<void>;
  startSecurityReview(account: Account, projectId: string): Promise<boolean>;
  runTurn(input: BuilderTurnInput, emit: (event: AgentEvent) => void): Promise<void>;
  runTool(name: string, input: Record<string, unknown>, context: ToolContext, structured: boolean): Promise<BuilderToolResult>;
}

type BuilderStreamSubscriber = { send: (event: AgentEvent) => void; close: () => void };
type ActiveBuilderStream = { events: AgentEvent[]; subscribers: Set<BuilderStreamSubscriber> };

const accountSchema = z.object({
  id: z.string().min(1),
  email: z.string().email(),
  name: z.string().nullable(),
  credits: z.number(),
  platformRole: z.enum(["admin", "user"]),
  tokenOrgId: z.string().nullable().optional(),
});

export function createBuilderService(ports: BuilderServicePorts, token: string) {
  if (!token) throw new Error("BUILDER_SERVICE_TOKEN must be configured");
  const app = new Hono();
  const activeStreams = new Map<string, ActiveBuilderStream>();
  app.use("/internal/builder/*", async (c, next) => {
    if (!isInternalServiceRequest(c.req.header("authorization"), token)) return c.json({ error: "Unauthorized" }, 401);
    await next();
  });

  app.get("/healthz", (c) => c.json({ ok: true }));
  app.post("/internal/builder/reload", async (c) => {
    await ports.reloadSettings();
    return c.json({ ok: true });
  });
  app.post("/internal/builder/security-review", async (c) => {
    const parsed = z.object({ account: accountSchema, projectId: z.string().min(1) }).safeParse(await c.req.json());
    if (!parsed.success) return c.json({ error: "Invalid security review request", issues: parsed.error.issues }, 400);
    return c.json({ started: await ports.startSecurityReview(parsed.data.account, parsed.data.projectId) });
  });
  app.post("/internal/builder/status", async (c) => {
    const body = await c.req.json<{ projectId: string }>();
    if (!body.projectId) return c.json({ error: "projectId is required" }, 400);
    return c.json({ building: ports.isBuilding(body.projectId) || activeStreams.has(body.projectId) });
  });
  app.post("/internal/builder/stop", async (c) => {
    const body = await c.req.json<{ projectId: string }>();
    if (!body.projectId) return c.json({ error: "projectId is required" }, 400);
    ports.stopBuilding(body.projectId);
    return c.json({ ok: true });
  });
  app.post("/internal/builder/stream", async (c) => {
    const body = await c.req.json<{ projectId: string }>();
    if (!body.projectId) return c.json({ error: "projectId is required" }, 400);
    const active = activeStreams.get(body.projectId);
    const encoder = new TextEncoder();
    let cleanup = () => {};
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        let open = true;
        const send = (event: AgentEvent) => {
          if (open) controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
        };
        if (!active) {
          open = false;
          controller.close();
          return;
        }
        for (const event of active.events) send(event);
        const subscriber = { send, close: () => {
          if (!open) return;
          open = false;
          controller.close();
        } };
        active.subscribers.add(subscriber);
        cleanup = () => active.subscribers.delete(subscriber);
      },
      cancel() {
        cleanup();
      },
    });
    return new Response(stream, {
      headers: { "content-type": "text/event-stream", "cache-control": "no-cache", connection: "keep-alive" },
    });
  });
  app.post("/internal/builder/turn", async (c) => {
    const parsed = z.object({
      account: accountSchema,
      projectId: z.string().min(1),
      userText: z.string().min(1).max(20_000),
      attachments: z.array(z.string()).max(12).default([]),
      mode: z.enum(["build", "chat", "plan"]).default("build"),
      implementPlan: z.boolean().default(false),
    }).safeParse(await c.req.json());
    if (!parsed.success) return c.json({ error: "Invalid builder turn", issues: parsed.error.issues }, 400);
    const input = parsed.data as BuilderTurnInput;
    if (ports.isBuilding(input.projectId) || activeStreams.has(input.projectId)) return c.json({ error: "El constructor ya está trabajando" }, 409);

    const encoder = new TextEncoder();
    const active: ActiveBuilderStream = { events: [], subscribers: new Set() };
    activeStreams.set(input.projectId, active);
    let removeSource = () => {};
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        let open = true;
        const close = () => {
          if (!open) return;
          open = false;
          controller.close();
        };
        const source = {
          send: (event: AgentEvent) => {
            if (open) controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
          },
          close,
        };
        active.subscribers.add(source);
        removeSource = () => active.subscribers.delete(source);
        const emit = (event: AgentEvent) => {
          active.events.push(event);
          for (const subscriber of active.subscribers) subscriber.send(event);
        };
        void ports.runTurn(input, emit).catch((error) => {
          emit({ type: "error", message: error instanceof Error ? error.message : String(error) });
        }).finally(() => {
          if (activeStreams.get(input.projectId) === active) activeStreams.delete(input.projectId);
          for (const subscriber of active.subscribers) subscriber.close();
          active.subscribers.clear();
        });
      },
      cancel() {
        removeSource();
      },
    });
    return new Response(stream, {
      headers: { "content-type": "text/event-stream", "cache-control": "no-cache", connection: "keep-alive" },
    });
  });
  app.post("/internal/builder/tool", async (c) => {
    const parsed = z.object({
      name: z.string().min(1),
      input: z.record(z.string(), z.unknown()),
      account: accountSchema,
      projectId: z.string().min(1),
      structured: z.boolean().default(false),
    }).safeParse(await c.req.json());
    if (!parsed.success) return c.json({ error: "Invalid builder tool request", issues: parsed.error.issues }, 400);
    const { name, input, account, projectId, structured } = parsed.data;
    try {
      const result = await ports.runTool(name, input, { account, projectId, author: "mcp" }, structured);
      return c.json(result);
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : String(error) }, 500);
    }
  });
  return app;
}
