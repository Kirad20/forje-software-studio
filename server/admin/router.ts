import { meanOf } from "../llm/bandit.js";
import { q } from "../platform/db.js";

/**
 * What the router has learned (router_stats: a Beta posterior per task class and model) and the
 * choices it made lately (router_decisions), for the admin panel.
 */
export interface RouterStats {
  classes: { taskClass: string; uses: number; models: { modelId: string; alpha: number; beta: number; mean: number; uses: number; usdPerUse: number }[] }[];
  decisions: { id: number; at: string; projectId: string | null; projectName: string | null; role: string; taskClass: string; modelId: string; reason: string }[];
}

export async function routerStats(limit = 100): Promise<RouterStats> {
  const rows = await q<{ task_class: string; model_id: string; alpha: number; beta: number; uses: number; usd: number }>(
    `select task_class, model_id, alpha, beta, uses, usd from router_stats order by task_class, model_id`,
  );
  const byClass = new Map<string, RouterStats["classes"][number]>();
  for (const r of rows) {
    const c = byClass.get(r.task_class) ?? { taskClass: r.task_class, uses: 0, models: [] };
    c.uses += r.uses;
    c.models.push({ modelId: r.model_id, alpha: r.alpha, beta: r.beta, mean: meanOf(r), uses: r.uses, usdPerUse: r.uses ? r.usd / r.uses : 0 });
    byClass.set(r.task_class, c);
  }
  for (const c of byClass.values()) c.models.sort((a, b) => b.mean - a.mean);
  const decisions = await q<RouterStats["decisions"][number]>(
    `select d.id, d.created_at as at, d.project_id as "projectId", p.name as "projectName", d.role, d.task_class as "taskClass", d.model_id as "modelId", d.reason
     from router_decisions d left join projects p on p.id = d.project_id order by d.id desc limit $1`,
    [limit],
  );
  return { classes: [...byClass.values()].sort((a, b) => b.uses - a.uses), decisions };
}

/** Forgets what was learned, for one task class, one model, both, or everything. Returns the rows removed. */
export async function resetRouter(f: { taskClass?: string; modelId?: string }): Promise<number> {
  const rows = await q(
    `delete from router_stats where ($1::text is null or task_class = $1) and ($2::text is null or model_id = $2) returning 1`,
    [f.taskClass || null, f.modelId || null],
  );
  return rows.length;
}
