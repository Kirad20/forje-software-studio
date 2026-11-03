import { randomUUID } from "node:crypto";
import { Hono } from "hono";
import { isInternalServiceRequest } from "../../../shared/internalServiceAuth.js";
import type { ProjectDb } from "../ports/database.js";
import type { SqlExecutionResult } from "./projectDbClient.js";

interface AppDataPorts {
  projectDb(projectId: string): ProjectDb;
  execSql(projectId: string, sql: string): Promise<SqlExecutionResult[]>;
  dumpDatabase(projectId: string): Promise<Blob>;
  closeProject(projectId: string): Promise<void>;
  cloneDatabase(fromProjectId: string, toProjectId: string): Promise<void>;
  closeAll(): Promise<void>;
  isAwake(projectId: string): boolean | Promise<boolean>;
}

interface TransactionSession {
  projectId: string;
  tx: Pick<ProjectDb, "query" | "one">;
  running: Promise<unknown>;
  commit(): Promise<void>;
  rollback(): Promise<void>;
}

export function createAppDataService(ports: AppDataPorts, token: string) {
  if (!token) throw new Error("APP_DATA_SERVICE_TOKEN must be configured");
  const app = new Hono();
  const transactions = new Map<string, TransactionSession>();

  app.use("/internal/data/*", async (c, next) => {
    if (!isInternalServiceRequest(c.req.header("authorization"), token)) return c.json({ error: "Unauthorized" }, 401);
    await next();
  });

  app.get("/healthz", (c) => c.json({ ok: true }));
  app.post("/internal/data/close-all", async (c) => {
    const active = [...transactions.values()];
    transactions.clear();
    await Promise.all(active.map((transaction) => transaction.rollback()));
    await ports.closeAll();
    return c.json({ ok: true });
  });
  app.post("/internal/data/:projectId/query", async (c) => {
    const { sql, params = [] } = await c.req.json<{ sql: string; params?: unknown[] }>();
    return c.json(await ports.projectDb(c.req.param("projectId")).query(sql, params));
  });
  app.post("/internal/data/:projectId/exec", async (c) => {
    const { sql } = await c.req.json<{ sql: string }>();
    await ports.projectDb(c.req.param("projectId")).exec(sql);
    return c.json({ ok: true });
  });
  app.post("/internal/data/:projectId/exec-sql", async (c) => {
    const { sql } = await c.req.json<{ sql: string }>();
    return c.json(await ports.execSql(c.req.param("projectId"), sql));
  });
  app.post("/internal/data/:projectId/dump", async (c) => {
    const dump = await ports.dumpDatabase(c.req.param("projectId"));
    return c.json({ data: Buffer.from(await dump.arrayBuffer()).toString("base64") });
  });
  app.post("/internal/data/:projectId/close", async (c) => {
    await ports.closeProject(c.req.param("projectId"));
    return c.json({ ok: true });
  });
  app.post("/internal/data/:projectId/clone", async (c) => {
    const { toProjectId } = await c.req.json<{ toProjectId: string }>();
    await ports.cloneDatabase(c.req.param("projectId"), toProjectId);
    return c.json({ ok: true });
  });
  app.post("/internal/data/:projectId/awake", async (c) => c.json(await ports.isAwake(c.req.param("projectId"))));
  app.post("/internal/data/:projectId/transaction/begin", async (c) => {
    const projectId = c.req.param("projectId");
    const transactionId = randomUUID();
    let resolveReady!: (tx: Pick<ProjectDb, "query" | "one">) => void;
    let rejectReady!: (error: unknown) => void;
    let finish!: () => void;
    let abort!: (error: Error) => void;
    const ready = new Promise<Pick<ProjectDb, "query" | "one">>((resolve, reject) => {
      resolveReady = resolve;
      rejectReady = reject;
    });
    const completion = new Promise<void>((resolve, reject) => {
      finish = resolve;
      abort = reject;
    });
    const running = ports.projectDb(projectId).transaction(async (tx) => {
      resolveReady(tx);
      await completion;
    });
    void running.catch(rejectReady);
    const tx = await ready;
    const session: TransactionSession = {
      projectId,
      tx,
      running,
      async commit() {
        finish();
        await running;
      },
      async rollback() {
        const rollback = new Error("Remote transaction rolled back");
        abort(rollback);
        try {
          await running;
        } catch (error) {
          if (error !== rollback) throw error;
        }
      },
    };
    transactions.set(transactionId, session);
    return c.json({ transactionId });
  });
  app.post("/internal/data/:projectId/transaction/:action", async (c) => {
    const { transactionId, sql, params = [] } = await c.req.json<{
      transactionId: string;
      sql?: string;
      params?: unknown[];
    }>();
    const session = transactions.get(transactionId);
    if (!session || session.projectId !== c.req.param("projectId")) return c.json({ error: "Transaction not found" }, 404);
    const action = c.req.param("action");
    if (action === "query") {
      if (typeof sql !== "string") return c.json({ error: "SQL is required" }, 400);
      return c.json(await session.tx.query(sql, params));
    }
    if (action !== "commit" && action !== "rollback") return c.json({ error: "Unknown transaction action" }, 404);
    await session[action]();
    transactions.delete(transactionId);
    return c.json({ ok: true });
  });

  return app;
}
