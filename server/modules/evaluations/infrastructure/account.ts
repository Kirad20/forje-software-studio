import type { Account } from "../../identity/index.js";
import { one, q } from "../../../shared/database/index.js";
import { removeProjectData } from "../../app-runtime/index.js";
import { evaluationResources } from "./bindings.js";

export const EVAL_EMAIL = "evals@forja.internal";
let evalAccountId: string | null = null;

/** Disabled: the disposable account cannot be used to sign in. */
export async function ensureEvalAccount(): Promise<Account> {
  if (!evalAccountId) {
    let row = await one<{ id: string }>(`select id from accounts where email = $1`, [EVAL_EMAIL]);
    if (!row) row = { id: await evaluationResources().identity.createAccount(EVAL_EMAIL, "Forja Evals", null, "user") };
    await q(`update accounts set disabled = true, credits = 0 where id = $1`, [row.id]);
    evalAccountId = row.id;
  }
  return (await evaluationResources().identity.getAccount(evalAccountId))!;
}

export async function sweepEvalProjects(olderThanMs = 30 * 60_000) {
  const acc = await one<{ id: string }>(`select id from accounts where email = $1`, [EVAL_EMAIL]);
  if (!acc) return 0;
  const stale = await q<{ id: string }>(`select id from projects where owner_id = $1 and created_at < now() - ($2::int * interval '1 millisecond')`, [acc.id, Math.round(olderThanMs)]);
  for (const p of stale) {
    await evaluationResources().projects.deleteProject(p.id).catch(() => {});
    await removeProjectData(p.id);
  }
  return stale.length;
}

/** Both callers retain spending after disposable project usage rows are deleted. */
export async function spentLast24h(): Promise<number> {
  const runs = (await one<{ n: number }>(`select coalesce(sum(spent_usd), 0)::float8 as n from eval_runs where created_at > now() - interval '24 hours'`))?.n ?? 0;
  const playground = (await one<{ n: number }>(`select coalesce(sum(usd), 0)::float8 as n from ai_usage where source = 'playground' and created_at > now() - interval '24 hours'`))?.n ?? 0;
  return runs + playground;
}
