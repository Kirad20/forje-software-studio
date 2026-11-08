import { type Context, type Env, Hono } from "hono";
import { z } from "zod";
import { RepositoryRuntimeError, type RepositoryRuntime } from "../../modules/repository-runtime/index.js";

const configPatch = z.object({
  rootDirectory: z.string().max(500).optional(), dockerfile: z.string().max(500).nullable().optional(),
  port: z.number().int().min(1).max(65535).optional(), healthPath: z.string().max(500).optional(),
  postgres: z.boolean().optional(), storagePath: z.string().max(500).nullable().optional(),
}).strict();
type RepositoryApiEnv = Env & { Variables: { project: { id: string; runtime?: string }; access: string } };
/** Register only after studio authentication and project-access middleware. Gates fail closed if absent. */
export function registerRepositoryApi<E extends RepositoryApiEnv>(app: Hono<E>, runtime: RepositoryRuntime) {
  const route = "/projects/:id/repository";
  const gated = (owner: boolean, handler: (c: Context<E>, id: string) => Promise<Response>) => async (c: Context<E>) => {
    const project = c.get("project");
    const access = c.get("access");
    if (!project || project.id !== c.req.param("id") || !["owner", "editor", "viewer"].includes(access)) return c.json({ error: "Project access required" }, 403);
    if (project.runtime !== "repository") return c.json({ error: "Project does not use the repository runtime" }, 409);
    if (owner && access !== "owner") return c.json({ error: "Only the project owner can perform this operation" }, 403);
    try { return await handler(c, project.id); }
    catch (error) {
      return c.json({ error: error instanceof Error ? error.message : "Repository operation failed" }, error instanceof RepositoryRuntimeError ? error.status : 503);
    }
  };
  app.get(route, gated(false, async (c, id) => c.json(await runtime.get(id))));
  app.patch(route, gated(true, async (c, id) => {
    const parsed = configPatch.safeParse(await c.req.json().catch(() => null));
    if (!parsed.success) return c.json({ error: "Invalid repository configuration", issues: parsed.error.issues }, 400);
    return c.json(await runtime.configure(id, parsed.data));
  }));
  app.post(route + "/build", gated(false, async (c, id) => {
    if (!["owner", "editor"].includes(c.get("access"))) return c.json({ error: "Editor access required" }, 403);
    return c.json(await runtime.build(id));
  }));
  app.post(route + "/publish", gated(true, async (c, id) => {
    const parsed = z.object({ slug: z.string().min(1).max(63), revisionId: z.string().min(1).max(100) }).strict().safeParse(await c.req.json().catch(() => null));
    if (!parsed.success) return c.json({ error: "Publication requires a slug and built revisionId" }, 400);
    return c.json(await runtime.publish(id, parsed.data, "owner"));
  }));
  app.post(route + "/rollback", gated(true, async (c, id) => {
    const parsed = z.object({ revisionId: z.string().min(1).max(100) }).strict().safeParse(await c.req.json().catch(() => null));
    if (!parsed.success) return c.json({ error: "Rollback requires revisionId" }, 400);
    return c.json(await runtime.rollback(id, parsed.data.revisionId));
  }));
  app.post(route + "/stop", gated(true, async (c, id) => {
    const parsed = z.object({ env: z.enum(["preview", "published"]) }).strict().safeParse(await c.req.json().catch(() => null));
    if (!parsed.success) return c.json({ error: "Stop requires preview or published environment" }, 400);
    return c.json(await runtime.stop(id, parsed.data.env));
  }));
  app.get(route + "/logs", gated(false, async (c, id) => {
    const env = c.req.query("env") ?? "preview";
    if (env !== "preview" && env !== "published") return c.json({ error: "Invalid log environment" }, 400);
    if (env === "published" && c.get("access") !== "owner") return c.json({ error: "Published runtime logs are owner-only" }, 403);
    if (!["owner", "editor"].includes(c.get("access"))) return c.json({ error: "Editor access required" }, 403);
    return c.json({ logs: await runtime.logs(id, env) });
  }));
}
