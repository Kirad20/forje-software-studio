import { Hono } from "hono";

import { config } from "../config.js";
import type { Account } from "../platform/accounts.js";
import { cancelRun, EvalError, evalConfig, exportRun, getRun, listRuns, startRun, type RunRequest } from "./runner.js";

/**
 * /api/admin/evals/*  Mounted under studioApi's admin guard, so only platform admins get here.
 * With FORJA_EVALS unset everything but GET /config answers 404: the feature is not there.
 */
export const evalsApi = new Hono<{ Variables: { account: Account } }>();

evalsApi.onError((err, c) => {
  if (err instanceof EvalError) return c.json({ error: err.message }, err.status as 400);
  return c.json({ error: err.message }, 400);
});

evalsApi.get("/config", async (c) => c.json(await evalConfig(c.get("account"))));

evalsApi.use("*", async (c, next) => {
  if (!config.evals.enabled) return c.json({ error: "Los evals están desactivados en este servidor (FORJA_EVALS=1 los activa)." }, 404);
  await next();
});

evalsApi.get("/runs", async (c) => c.json({ runs: await listRuns() }));

evalsApi.post("/runs", async (c) => {
  const body = (await c.req.json().catch(() => ({}))) as RunRequest;
  const started = await startRun(c.get("account"), {
    cases: Array.isArray(body.cases) ? body.cases.map(String) : undefined,
    sizes: Array.isArray(body.sizes) ? body.sizes.map(String) : undefined,
    repeats: body.repeats,
    budgetUsd: body.budgetUsd,
    models: Array.isArray(body.models) ? body.models.map(String) : undefined,
    judge: body.judge,
    judgeModel: typeof body.judgeModel === "string" ? body.judgeModel : undefined,
  });
  return c.json(started, 202);
});

evalsApi.get("/runs/:id", async (c) => {
  const run = await getRun(c.req.param("id")!);
  return run ? c.json(run) : c.json({ error: "No existe esa ejecución." }, 404);
});

evalsApi.post("/runs/:id/cancel", async (c) => c.json({ ok: await cancelRun(c.req.param("id")!) }));

/** ?format=json (default) or md: the same data, to download or paste back. */
evalsApi.get("/runs/:id/export", async (c) => {
  const format = c.req.query("format") === "md" ? "md" : "json";
  const out = await exportRun(c.req.param("id")!, format);
  if (!out) return c.json({ error: "No existe esa ejecución." }, 404);
  return c.body(out.body, 200, {
    "content-type": out.type,
    "content-disposition": `attachment; filename="evals-${c.req.param("id")}.${format === "md" ? "md" : "json"}"`,
  });
});
