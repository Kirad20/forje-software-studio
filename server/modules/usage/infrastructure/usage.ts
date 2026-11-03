import { one, q } from "../../../shared/database/index.js";
import type { UsageRepository } from "../application/service.js";

/** Build actions: one per builder tool call, from the studio chat or MCP, counted per account per day. */
async function countAction(accountId: string) {
  await q(
    `insert into builder_actions (account_id, day, count) values ($1, current_date, 1)
     on conflict (account_id, day) do update set count = builder_actions.count + 1`,
    [accountId],
  );
}

async function actionsToday(accountId: string) {
  return (await one<{ count: number }>(`select count from builder_actions where account_id = $1 and day = current_date`, [accountId]))?.count ?? 0;
}

export const usageRepository: UsageRepository = {
  countAction, actionsToday,
  credits: (accountId) => one<{ credits: number }>(`select credits from accounts where id = $1`, [accountId]),
  spent: (accountId) => one<{ builder: number; app: number }>(
    `select coalesce(sum(credits) filter (where source = 'builder'), 0)::int as builder,
            coalesce(sum(credits) filter (where source = 'app'), 0)::int as app
     from ai_usage where account_id = $1`,
    [accountId],
  ),
  storage: (accountId) => one<{ bytes: number }>(
    `select coalesce(sum(s.size), 0)::int as bytes from storage_objects s join projects p on p.id = s.project_id where p.owner_id = $1`,
    [accountId],
  ),
  history: (accountId) => q<{ day: string; count: number }>(
    `select to_char(day, 'YYYY-MM-DD') as day, count from builder_actions where account_id = $1 and day > current_date - 14 order by day`,
    [accountId],
  ),
};
