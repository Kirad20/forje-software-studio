import { randomUUID } from "node:crypto";
import { Hono } from "hono";
import { isInternalServiceRequest } from "../../../shared/internalServiceAuth.js";
import type { ProjectDb } from "../ports/database.js";
import type { AppEnv } from "../domain/contracts.js";
import type { SqlExecutionResult } from "./projectDbClient.js";
import type { ProjectMigration } from "./projectDb.js";

interface AppDataPorts {
  projectDb(projectId: string, env?: AppEnv): ProjectDb;
  execSql(projectId: string, sql: string, env?: AppEnv): Promise<SqlExecutionResult[]>;
  applyProjectMigrations(projectId: string, migrations: ProjectMigration[], env?: AppEnv): Promise<{ applied: string[] }>;
  dumpDatabase(projectId: string, env?: AppEnv): Promise<Blob>;
  closeProject(projectId: string, env?: AppEnv): Promise<void>;
  cloneDatabase(fromProjectId: string, toProjectId: string): Promise<void>;
  closeAll(): Promise<void>;
  isAwake(projectId: string, env?: AppEnv): boolean | Promise<boolean>;
  dbMetrics(projectId: string, env?: AppEnv): unknown | Promise<unknown>;
}

interface TransactionSession {
  projectId: string;
  env: AppEnv;
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
    const { sql, params = [], env = "published" } = await c.req.json<{ sql: string; params?: unknown[]; env?: AppEnv }>();
    return c.json(await ports.projectDb(c.req.param("projectId"), env).query(sql, params));
  });
  app.post("/internal/data/:projectId/exec", async (c) => {
    const { sql, env = "published" } = await c.req.json<{ sql: string; env?: AppEnv }>();
    await ports.projectDb(c.req.param("projectId"), env).exec(sql);
    return c.json({ ok: true });
  });
  app.post("/internal/data/:projectId/exec-sql", async (c) => {
    const { sql, env = "preview" } = await c.req.json<{ sql: string; env?: AppEnv }>();
    return c.json(await ports.execSql(c.req.param("projectId"), sql, env));
  });
  app.post("/internal/data/:projectId/migrations/apply", async (c) => {
    const { migrations, env = "preview" } = await c.req.json<{ migrations: ProjectMigration[]; env?: AppEnv }>();
    return c.json(await ports.applyProjectMigrations(c.req.param("projectId"), migrations, env));
  });
  app.post("/internal/data/:projectId/dump", async (c) => {
    const { env = "preview" } = await c.req.json<{ env?: AppEnv }>();
    const dump = await ports.dumpDatabase(c.req.param("projectId"), env);
    return c.json({ data: Buffer.from(await dump.arrayBuffer()).toString("base64") });
  });
  app.post("/internal/data/:projectId/close", async (c) => {
    const { env } = await c.req.json<{ env?: AppEnv }>();
    await ports.closeProject(c.req.param("projectId"), env);
    return c.json({ ok: true });
  });
  app.post("/internal/data/:projectId/clone", async (c) => {
    const { toProjectId } = await c.req.json<{ toProjectId: string }>();
    await ports.cloneDatabase(c.req.param("projectId"), toProjectId);
    return c.json({ ok: true });
  });
  app.post("/internal/data/:projectId/awake", async (c) => {
    const { env } = await c.req.json<{ env?: AppEnv }>();
    return c.json(await ports.isAwake(c.req.param("projectId"), env));
  });
  app.post("/internal/data/:projectId/metrics", async (c) => {
    const { env = "preview" } = await c.req.json<{ env?: AppEnv }>();
    return c.json(await ports.dbMetrics(c.req.param("projectId"), env));
  });
  app.post("/internal/data/:projectId/transaction/begin", async (c) => {
    const projectId = c.req.param("projectId");
    const { env = "published" } = await c.req.json<{ env?: AppEnv }>();
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
    const running = ports.projectDb(projectId, env).transaction(async (tx) => {
      resolveReady(tx);
      await completion;
    });
    void running.catch(rejectReady);
    const tx = await ready;
    const session: TransactionSession = {
      projectId, env,
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
