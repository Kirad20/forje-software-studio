import { one, q } from "./db.js";

/** Build actions: one per builder tool call, from the studio chat or MCP, counted per account per day. */
export const DAILY_ACTIONS = 1000;

export async function countAction(accountId: string) {
  await q(
    `insert into builder_actions (account_id, day, count) values ($1, current_date, 1)
     on conflict (account_id, day) do update set count = builder_actions.count + 1`,
    [accountId],
  );
}

export async function actionsToday(accountId: string) {
  return (await one<{ count: number }>(`select count from builder_actions where account_id = $1 and day = current_date`, [accountId]))?.count ?? 0;
}

export async function usageSummary(accountId: string) {
  const credits = await one<{ credits: number }>(`select credits from accounts where id = $1`, [accountId]);
  const spent = await one<{ builder: number; app: number }>(
    `select coalesce(sum(credits) filter (where source = 'builder'), 0)::int as builder,
            coalesce(sum(credits) filter (where source = 'app'), 0)::int as app
     from ai_usage where account_id = $1`,
    [accountId],
  );
  const storage = await one<{ bytes: number }>(
    `select coalesce(sum(s.size), 0)::int as bytes from storage_objects s join projects p on p.id = s.project_id where p.owner_id = $1`,
    [accountId],
  );
  const history = await q<{ day: string; count: number }>(
    `select to_char(day, 'YYYY-MM-DD') as day, count from builder_actions where account_id = $1 and day > current_date - 14 order by day`,
    [accountId],
  );
  return {
    actionsToday: await actionsToday(accountId),
    actionsLimit: DAILY_ACTIONS,
    actionsHistory: history,
    credits: credits?.credits ?? 0,
    creditsSpent: spent ?? { builder: 0, app: 0 },
    storageBytes: storage?.bytes ?? 0,
  };
}
