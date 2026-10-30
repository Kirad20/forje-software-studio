import { Hono, type Context } from "hono";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";
import { aiUsage } from "../baas/ai.js";
import { listEmails, receiveEmail, sendEmail } from "../baas/email.js";
import { cancelTimer, listJobs, runJob, scheduleProject, setJobEnabled } from "../baas/jobs.js";
import { describeSchema, dumpDatabase, execSql, isAwake, projectDb } from "../baas/projectDb.js";
import { realtimeStats } from "../baas/realtime.js";
import { deleteSecret, listSecrets, setSecret } from "../baas/secrets.js";
import { deleteObject, listObjects, storageUsage } from "../baas/storage.js";
import { isBuilding, loadHistory, runBuilderTurn, stopBuilding, type AgentEvent } from "../builder/agent.js";
import * as accounts from "../platform/accounts.js";
import { projectEvents, readLogs, type ProjectEvent } from "../platform/events.js";
import * as projects from "../platform/projects.js";
import { publishProject, suggestSlug, unpublishProject } from "../runtime/publish.js";
import { appUrl, previewOrigin, previewUrl, shareToken } from "../runtime/urls.js";
import { rm } from "node:fs/promises";
import path from "node:path";
import { config } from "../config.js";
import { analyticsSummary } from "../baas/analytics.js";
import { zip } from "../lib/zip.js";
import { one } from "../platform/db.js";
import {
  INTEGRATION_TYPES,
  connectIntegration,
  createIntegration,
  deleteIntegration,
  disconnectIntegration,
  listIntegrations,
  projectIntegrationIds,
  updateIntegrationValue,
} from "../platform/integrations.js";
import { usageSummary } from "../platform/usage.js";

const quoteIdent = (name: string) => `"${name.replace(/"/g, '""')}"`;

/** Single-column primary key of a table, if it has one. */
async function primaryKeyOf(projectId: string, table: string): Promise<string | null> {
  const rows = await projectDb(projectId).query<{ column_name: string }>(
    `select kcu.column_name from information_schema.table_constraints tc
     join information_schema.key_column_usage kcu on kcu.constraint_name = tc.constraint_name and kcu.table_schema = tc.table_schema
     where tc.table_schema = 'public' and tc.table_name = $1 and tc.constraint_type = 'PRIMARY KEY'`,
    [table],
  );
  return rows.length === 1 ? rows[0]!.column_name : null;
}

/** Removes a deleted project's database and uploaded files from disk. */
async function removeProjectData(projectId: string) {
  const { closeProject } = await import("../baas/projectDb.js");
  await closeProject(projectId);
  await rm(path.join(config.dataDir, "projects", projectId), { recursive: true, force: true }).catch(() => {});
}

type Env = { Variables: { account: accounts.Account; project: projects.Project } };

export const SESSION_COOKIE = "forja_session";

export const studioApi = new Hono<Env>();

studioApi.onError((err, c) => c.json({ error: err.message }, 400));

const sse = (start: (send: (data: unknown) => void, close: () => void) => () => void) => {
  let cleanup = () => {};
  const stream = new ReadableStream({
    start(controller) {
      const enc = new TextEncoder();
      let open = true;
      const send = (data: unknown) => open && controller.enqueue(enc.encode(`data: ${JSON.stringify(data)}\n\n`));
      const close = () => {
        if (!open) return;
        open = false;
        cleanup();
        controller.close();
      };
      cleanup = start(send, close);
    },
    cancel() {
      cleanup();
    },
  });
  return new Response(stream, { headers: { "content-type": "text/event-stream", "cache-control": "no-cache", connection: "keep-alive" } });
};

// --- Auth -------------------------------------------------------------------------

studioApi.post("/auth/request", async (c) => {
  const { email } = await c.req.json<{ email: string }>();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email ?? "")) return c.json({ error: "Correo no válido" }, 400);
  await accounts.requestLoginCode(email);
  return c.json({ ok: true, hint: "Revisa la consola del servidor si no hay SMTP configurado." });
});

studioApi.post("/auth/verify", async (c) => {
  const { email, code } = await c.req.json<{ email: string; code: string }>();
  const token = await accounts.verifyLoginCode(email, code);
  if (!token) return c.json({ error: "Código incorrecto o caducado" }, 401);
  setCookie(c, SESSION_COOKIE, token, { httpOnly: true, sameSite: "Lax", path: "/", maxAge: 3600 * 24 * 30 });
  return c.json({ ok: true });
});

studioApi.post("/auth/logout", async (c) => {
  const token = getCookie(c, SESSION_COOKIE);
  if (token) await accounts.endSession(token);
  deleteCookie(c, SESSION_COOKIE, { path: "/" });
  return c.json({ ok: true });
});

// Everything below needs a signed-in account.
studioApi.use("*", async (c, next) => {
  const account = await accounts.accountFromSession(getCookie(c, SESSION_COOKIE));
  if (!account) return c.json({ error: "No has iniciado sesión" }, 401);
  c.set("account", account);
  await next();
});

studioApi.get("/me", async (c) => {
  const id = c.get("account").id;
  return c.json({ account: { ...(await accounts.getAccount(id)), sessions: await accounts.countSessions(id) } });
});
studioApi.patch("/me", async (c) => {
  const { name } = await c.req.json<{ name: string }>();
  await accounts.updateAccountName(c.get("account").id, name ?? "");
  return c.json({ ok: true });
});
studioApi.post("/me/sign-out-others", async (c) =>
  c.json({ ended: await accounts.signOutOtherSessions(c.get("account").id, getCookie(c, SESSION_COOKIE)!) }),
);
studioApi.delete("/me", async (c) => {
  const account = c.get("account");
  const { confirmEmail } = await c.req.json<{ confirmEmail: string }>();
  if (confirmEmail?.trim().toLowerCase() !== account.email) return c.json({ error: "Escribe tu correo para confirmar." }, 400);
  for (const p of await projects.listProjects(account.id)) await unpublishProject(p.id);
  const ids = await accounts.deleteAccount(account.id);
  for (const id of ids) await removeProjectData(id);
  deleteCookie(c, SESSION_COOKIE, { path: "/" });
  return c.json({ ok: true });
});

studioApi.get("/usage", async (c) => c.json(await usageSummary(c.get("account").id)));

// Folders
studioApi.get("/folders", async (c) => c.json({ folders: await projects.listFolders(c.get("account").id) }));
studioApi.post("/folders", async (c) => {
  const { name } = await c.req.json<{ name: string }>();
  return c.json({ id: await projects.createFolder(c.get("account").id, name ?? "") });
});
studioApi.delete("/folders/:id", async (c) => {
  await projects.deleteFolder(c.get("account").id, c.req.param("id"));
  return c.json({ ok: true });
});

// Account-level integrations
studioApi.get("/integrations", async (c) => c.json({ integrations: await listIntegrations(c.get("account").id), types: INTEGRATION_TYPES }));
studioApi.post("/integrations", async (c) => c.json({ id: await createIntegration(c.get("account").id, await c.req.json()) }));
studioApi.put("/integrations/:id", async (c) => {
  const { value } = await c.req.json<{ value: string }>();
  await updateIntegrationValue(c.get("account").id, c.req.param("id"), value ?? "");
  return c.json({ ok: true });
});
studioApi.delete("/integrations/:id", async (c) => {
  await deleteIntegration(c.get("account").id, c.req.param("id"));
  return c.json({ ok: true });
});

studioApi.get("/tokens", async (c) => c.json({ tokens: await accounts.listApiTokens(c.get("account").id) }));
studioApi.post("/tokens", async (c) => {
  const { name } = await c.req.json<{ name?: string }>();
  return c.json({ token: await accounts.createApiToken(c.get("account").id, name || "Cliente MCP") });
});
studioApi.delete("/tokens/:id", async (c) => {
  await accounts.deleteApiToken(c.get("account").id, c.req.param("id"));
  return c.json({ ok: true });
});

// --- Projects -------------------------------------------------------------------------

const projectView = async (p: projects.Project) => ({
  ...p,
  previewUrl: previewUrl(p.id),
  previewOrigin: previewOrigin(p.id),
  // A private app's link carries the share token, like the preview's.
  appUrl: p.slug ? (p.visibility === "private" ? `${appUrl(p.slug)}/?share=${shareToken(p.id)}` : appUrl(p.slug)) : null,
  suggestedSlug: p.slug ?? suggestSlug(p.name),
  building: isBuilding(p.id),
  hasUnpublishedChanges: p.slug ? await projects.hasUnpublishedChanges(p.id) : false,
});

studioApi.get("/projects", async (c) => {
  const list = await projects.listProjects(c.get("account").id);
  return c.json({ projects: list.map((p) => ({ ...p, appUrl: p.slug ? appUrl(p.slug) : null })) });
});

/** The dashboard's prompt box: the project is named from the idea, and the studio then sends the idea to the builder. */
studioApi.post("/projects", async (c) => {
  const { name, prompt } = await c.req.json<{ name?: string; prompt?: string }>();
  const title = (name ?? prompt ?? "").trim().split(/\s+/).slice(0, 5).join(" ").replace(/[.,;:]+$/, "") || "Proyecto nuevo";
  const p = await projects.createProject(c.get("account").id, title.slice(0, 60), (prompt ?? "").slice(0, 2000));
  return c.json({ project: await projectView(p) });
});

studioApi.use("/projects/:id/*", async (c, next) => {
  const p = await projects.getProject(c.req.param("id")!);
  if (!p || p.ownerId !== c.get("account").id) return c.json({ error: "Proyecto no encontrado" }, 404);
  c.set("project", p);
  await next();
});
studioApi.use("/projects/:id", async (c, next) => {
  const p = await projects.getProject(c.req.param("id")!);
  if (!p || p.ownerId !== c.get("account").id) return c.json({ error: "Proyecto no encontrado" }, 404);
  c.set("project", p);
  await next();
});

const pid = (c: Context<Env>) => c.get("project").id;

studioApi.get("/projects/:id", async (c) => {
  await projects.markOpened(pid(c));
  return c.json({ project: await projectView(c.get("project")) });
});
studioApi.patch("/projects/:id", async (c) => {
  const patch = await c.req.json<projects.ProjectPatch>();
  if (patch.folderId) {
    const mine = await projects.listFolders(c.get("account").id);
    if (!mine.some((f) => f.id === patch.folderId)) return c.json({ error: "Carpeta no encontrada" }, 404);
  }
  await projects.updateProject(pid(c), patch);
  return c.json({ project: await projectView((await projects.getProject(pid(c)))!) });
});
studioApi.delete("/projects/:id", async (c) => {
  await unpublishProject(pid(c));
  await projects.deleteProject(pid(c));
  await removeProjectData(pid(c));
  return c.json({ ok: true });
});
studioApi.post("/projects/:id/duplicate", async (c) => {
  const copy = await projects.duplicateProject(c.get("account").id, pid(c));
  return c.json({ project: await projectView(copy) });
});

/** "Get code": the project's source as a zip, without the builder's working notes. */
studioApi.get("/projects/:id/export-code", async (c) => {
  const files = Object.fromEntries(Object.entries(await projects.readAllFiles(pid(c))).filter(([p]) => !projects.isDevFile(p)));
  const slug = suggestSlug(c.get("project").name);
  return new Response(new Uint8Array(zip(Object.fromEntries(Object.entries(files).map(([p, v]) => [`${slug}/${p}`, v])))), {
    headers: { "content-type": "application/zip", "content-disposition": `attachment; filename="${slug}.zip"` },
  });
});

studioApi.get("/projects/:id/stats", async (c) => {
  const files = await projects.readAllFiles(pid(c));
  const code = Object.entries(files).filter(([p]) => !projects.isDevFile(p) && /\.(tsx?|css)$/.test(p));
  const credits = await one<{ n: number }>(`select coalesce(sum(credits), 0)::int as n from ai_usage where project_id = $1`, [pid(c)]);
  return c.json({
    files: code.length,
    linesOfCode: code.reduce((n, [, v]) => n + v.split("\n").length, 0),
    creditsUsed: credits?.n ?? 0,
  });
});

/** Which services this project already uses: the services nav lists those first and dims the rest. */
studioApi.get("/projects/:id/services", async (c) => {
  const id = pid(c);
  const files = Object.keys(await projects.readAllFiles(id));
  const tables = Object.keys(await describeSchema(id));
  const count = async (sql: string) => (await one<{ n: number }>(sql, [id]))?.n ?? 0;
  const secrets = await listSecrets(id);
  const users = await projectDb(id).one<{ n: number }>(`select count(*)::int as n from _forja_users`);
  return c.json({
    data: tables.length > 0,
    users: (users?.n ?? 0) > 0,
    ai: (await count(`select count(*)::int as n from ai_usage where project_id = $1`)) > 0,
    integrations: secrets.length > 0 || (await projectIntegrationIds(id)).length > 0,
    analytics: !!c.get("project").slug,
    docs: files.some(projects.isDevFile),
    jobs: files.some((f) => f.startsWith("jobs/")),
    storage: (await count(`select count(*)::int as n from storage_objects where project_id = $1`)) > 0,
    email: (await count(`select count(*)::int as n from emails where project_id = $1`)) > 0,
    payments: secrets.some((s) => s.name === "STRIPE_SECRET_KEY" && s.isSet),
  });
});

studioApi.get("/projects/:id/analytics", async (c) => c.json(await analyticsSummary(pid(c), Number(c.req.query("days") ?? 7))));

// Integrations connected to this project
studioApi.get("/projects/:id/integrations", async (c) =>
  c.json({ all: await listIntegrations(c.get("account").id), connected: await projectIntegrationIds(pid(c)) }),
);
studioApi.post("/projects/:id/integrations/:iid", async (c) => {
  await connectIntegration(c.get("account").id, pid(c), c.req.param("iid"));
  return c.json({ ok: true });
});
studioApi.delete("/projects/:id/integrations/:iid", async (c) => {
  await disconnectIntegration(pid(c), c.req.param("iid"));
  return c.json({ ok: true });
});

/** Live feed for the studio: file changes, publishes and log lines. */
studioApi.get("/projects/:id/events", (c) => {
  const id = pid(c);
  return sse((send) => {
    const on = (e: ProjectEvent) => send(e);
    projectEvents.on(id, on);
    const ping = setInterval(() => send({ type: "ping" }), 25_000);
    return () => {
      projectEvents.off(id, on);
      clearInterval(ping);
    };
  });
});

// Files
studioApi.get("/projects/:id/files", async (c) => c.json({ files: await projects.listFiles(pid(c)) }));
studioApi.get("/projects/:id/file", async (c) => {
  const content = await projects.readFile(pid(c), c.req.query("path") ?? "");
  return content === undefined ? c.json({ error: "No existe" }, 404) : c.json({ content });
});
studioApi.put("/projects/:id/file", async (c) => {
  const { path, content } = await c.req.json<{ path: string; content: string }>();
  await projects.writeFile(pid(c), path, content);
  return c.json({ ok: true });
});

// Chat with the builder
studioApi.get("/projects/:id/chat", async (c) => c.json({ messages: await loadHistory(pid(c)), building: isBuilding(pid(c)) }));
studioApi.post("/projects/:id/chat", async (c) => {
  const { message } = await c.req.json<{ message: string }>();
  if (!message?.trim()) return c.json({ error: "Mensaje vacío" }, 400);
  if (isBuilding(pid(c))) return c.json({ error: "El constructor ya está trabajando" }, 409);
  const account = c.get("account");
  const id = pid(c);
  return sse((send, close) => {
    void runBuilderTurn(account, id, message, (e: AgentEvent) => send(e)).finally(close);
    return () => {};
  });
});
studioApi.post("/projects/:id/chat/stop", (c) => {
  stopBuilding(pid(c));
  return c.json({ ok: true });
});

// Data
studioApi.get("/projects/:id/db/schema", async (c) =>
  c.json({ tables: await describeSchema(pid(c), c.req.query("internal") === "1"), awake: isAwake(pid(c)) }),
);
studioApi.get("/projects/:id/db/rows", async (c) => {
  const table = c.req.query("table") ?? "";
  const schema = await describeSchema(pid(c), true);
  if (!schema[table]) return c.json({ error: "Tabla no encontrada" }, 404);
  const limit = Math.min(Number(c.req.query("limit") ?? 50), 500);
  const offset = Number(c.req.query("offset") ?? 0);
  const search = (c.req.query("search") ?? "").trim();
  const db = projectDb(pid(c));
  const ident = quoteIdent(table);
  // Search matches any column's text form; column names come from the catalog, not the request.
  const where = search ? `where ${schema[table]!.map((col) => `${quoteIdent(col.name)}::text ilike $3`).join(" or ")}` : "";
  const params = search ? [limit, offset, `%${search}%`] : [limit, offset];
  const primaryKey = await primaryKeyOf(pid(c), table);
  const order = primaryKey ? `order by ${quoteIdent(primaryKey)}` : "";
  const rows = await db.query(`select * from ${ident} ${where} ${order} limit $1 offset $2`, params);
  const total = (await db.one<{ n: number }>(`select count(*)::int as n from ${ident} ${search ? where.replace(/\$3/g, "$1") : ""}`, search ? [`%${search}%`] : []))!.n;
  // Never show password hashes in the studio.
  const safe = table === "_forja_users" ? rows.map(({ password_hash, ...r }) => ({ ...r, password_hash: password_hash ? "••••" : null })) : rows;
  return c.json({ columns: schema[table], rows: safe, total, primaryKey });
});

studioApi.post("/projects/:id/db/rows", async (c) => {
  const { table, values } = await c.req.json<{ table: string; values: Record<string, unknown> }>();
  const schema = await describeSchema(pid(c), true);
  const cols = schema[table];
  if (!cols) return c.json({ error: "Tabla no encontrada" }, 404);
  // Empty fields are left out so column defaults (ids, timestamps) apply.
  const entries = Object.entries(values ?? {}).filter(([k, v]) => cols.some((col) => col.name === k) && v !== "" && v !== undefined);
  const sql = entries.length
    ? `insert into ${quoteIdent(table)} (${entries.map(([k]) => quoteIdent(k)).join(", ")}) values (${entries.map((_, i) => `$${i + 1}`).join(", ")}) returning *`
    : `insert into ${quoteIdent(table)} default values returning *`;
  try {
    return c.json({ row: await projectDb(pid(c)).one(sql, entries.map(([, v]) => v)) });
  } catch (e) {
    return c.json({ error: (e as Error).message }, 400);
  }
});

studioApi.post("/projects/:id/db/rows/delete", async (c) => {
  const { table, keys } = await c.req.json<{ table: string; keys: unknown[] }>();
  const schema = await describeSchema(pid(c), true);
  if (!schema[table]) return c.json({ error: "Tabla no encontrada" }, 404);
  const pk = await primaryKeyOf(pid(c), table);
  if (!pk) return c.json({ error: "La tabla no tiene clave primaria; bórralas con SQL." }, 400);
  try {
    const rows = await projectDb(pid(c)).query(`delete from ${quoteIdent(table)} where ${quoteIdent(pk)}::text = any($1::text[]) returning 1`, [
      (keys ?? []).map(String),
    ]);
    return c.json({ deleted: rows.length });
  } catch (e) {
    return c.json({ error: (e as Error).message }, 400);
  }
});
studioApi.post("/projects/:id/db/sql", async (c) => {
  const { sql } = await c.req.json<{ sql: string }>();
  try {
    return c.json({ results: await execSql(pid(c), sql) });
  } catch (e) {
    return c.json({ error: (e as Error).message }, 400);
  }
});
studioApi.get("/projects/:id/db/export", async (c) => {
  const blob = await dumpDatabase(pid(c));
  return new Response(blob, {
    headers: {
      "content-type": "application/gzip",
      "content-disposition": `attachment; filename="${suggestSlug(c.get("project").name)}-db.tar.gz"`,
    },
  });
});

// App users
studioApi.get("/projects/:id/users", async (c) =>
  c.json({
    users: await projectDb(pid(c)).query(
      `select id, email, name, role, password_hash is not null as "hasPassword", created_at as "createdAt" from _forja_users order by created_at desc limit 500`,
    ),
  }),
);

// Storage
studioApi.get("/projects/:id/storage", async (c) =>
  c.json({ objects: await listObjects(pid(c)), bytes: await storageUsage(pid(c)), origin: previewOrigin(pid(c)) }),
);
studioApi.delete("/projects/:id/storage/:key{.+}", async (c) => {
  await deleteObject(pid(c), c.req.param("key"));
  return c.json({ ok: true });
});

// Email
studioApi.get("/projects/:id/emails", async (c) => c.json({ emails: await listEmails(pid(c)) }));
studioApi.post("/projects/:id/emails/test", async (c) => {
  const { to } = await c.req.json<{ to: string }>();
  return c.json({ results: await sendEmail(pid(c), { to, subject: "Correo de prueba", html: "<p>Funciona 🎉</p>" }) });
});
studioApi.post("/projects/:id/emails/inbound", async (c) => {
  await receiveEmail(pid(c), await c.req.json());
  return c.json({ ok: true });
});

// Jobs
studioApi.get("/projects/:id/jobs", async (c) => c.json(await listJobs(pid(c))));
studioApi.post("/projects/:id/jobs/:name/run", async (c) => {
  try {
    await runJob(pid(c), "preview", c.req.param("name"), null, "manual");
    return c.json({ ok: true });
  } catch (e) {
    return c.json({ error: (e as Error).message }, 400);
  }
});
studioApi.post("/projects/:id/jobs/:name/enabled", async (c) => {
  const { enabled } = await c.req.json<{ enabled: boolean }>();
  await setJobEnabled(pid(c), c.req.param("name"), enabled);
  return c.json({ ok: true, note: "Se aplica a la app publicada en la próxima publicación." });
});
studioApi.delete("/projects/:id/timers/:timerId", async (c) => {
  await cancelTimer(pid(c), c.req.param("timerId"));
  return c.json({ ok: true });
});

// Secrets
studioApi.get("/projects/:id/secrets", async (c) => c.json({ secrets: await listSecrets(pid(c)) }));
studioApi.put("/projects/:id/secrets", async (c) => {
  const { name, value } = await c.req.json<{ name: string; value: string }>();
  try {
    await setSecret(pid(c), name, value);
    return c.json({ ok: true });
  } catch (e) {
    return c.json({ error: (e as Error).message }, 400);
  }
});
studioApi.delete("/projects/:id/secrets/:name", async (c) => {
  await deleteSecret(pid(c), c.req.param("name"));
  return c.json({ ok: true });
});

// AI usage, realtime, logs
studioApi.get("/projects/:id/ai", async (c) => c.json({ usage: await aiUsage(pid(c)), enabled: c.get("project").aiEnabled }));
studioApi.get("/projects/:id/realtime", async (c) => c.json({ channels: realtimeStats(pid(c)) }));
studioApi.get("/projects/:id/logs", (c) => c.json({ logs: readLogs(pid(c), { limit: 300, level: c.req.query("level") }) }));

// Change timeline and named checkpoints
studioApi.get("/projects/:id/changes", async (c) => c.json({ changes: await projects.listChanges(pid(c)) }));
studioApi.post("/projects/:id/checkpoints", async (c) => {
  const { label, description } = await c.req.json<{ label: string; description?: string }>();
  return c.json({ id: await projects.createCheckpoint(pid(c), label || "Checkpoint", "owner", description) });
});
studioApi.post("/projects/:id/changes/:cid/restore", async (c) => {
  await projects.restoreToChange(pid(c), Number(c.req.param("cid")), "owner");
  return c.json({ ok: true });
});

// Publishing
studioApi.post("/projects/:id/publish", async (c) => {
  const { slug } = await c.req.json<{ slug?: string }>().catch(() => ({ slug: undefined }));
  try {
    return c.json(await publishProject(pid(c), slug));
  } catch (e) {
    return c.json({ error: (e as Error).message }, 400);
  }
});
studioApi.post("/projects/:id/unpublish", async (c) => {
  await unpublishProject(pid(c));
  await scheduleProject(pid(c));
  return c.json({ ok: true });
});
