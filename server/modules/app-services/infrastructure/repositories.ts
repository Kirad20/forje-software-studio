import { one, q } from "../../../shared/database/index.js";
import { projectDb } from "./projectDb.js";
import type { AuthRepository, QueryRepository } from "../ports/repositories.js";
import type { ProjectDb, DatabasePorts } from "../ports/database.js";
import type { AppEnv } from "../domain/contracts.js";

const statements: Record<string, string> = {
  authEmailExists: `select 1 from _forja_users where email = $1`,
  authCreateUser: `insert into _forja_users (id, email, name, password_hash) values ($1, $2, $3, $4) on conflict (email) do nothing returning id, email, name, role`,
  authSignInUser: `select id, email, name, role, password_hash, coalesce(locked_until > now(), false) as locked from _forja_users where email = $1`,
  authFailedLogin: `update _forja_users set failed_logins = failed_logins + 1,
    locked_until = case when failed_logins + 1 >= $2 then now() + ($3 || ' minutes')::interval else locked_until end where id = $1`,
  authClearFailures: `update _forja_users set failed_logins = 0, locked_until = null where id = $1`,
  authCreateSession: `insert into _forja_sessions (token_hash, user_id, expires_at) values ($1, $2, now() + ($3 || ' days')::interval)`,
  authSessionUser: `select u.id, u.email, u.name, u.role from _forja_sessions s join _forja_users u on u.id = s.user_id where s.token_hash = $1 and s.expires_at > now()`,
  authDeleteSession: `delete from _forja_sessions where token_hash = $1`,
  authResetUser: `select id from _forja_users where email = $1`,
  authRecentResets: `select count(*)::int as n from _forja_reset_codes where user_id = $1 and created_at > now() - interval '1 hour'`,
  authInvalidateResets: `update _forja_reset_codes set used = true where user_id = $1 and not used`,
  authCreateReset: `insert into _forja_reset_codes (user_id, code_hash, expires_at) values ($1, $2, now() + interval '15 minutes')`,
  authLatestReset: `select c.id, c.user_id, c.code_hash, c.attempts from _forja_reset_codes c join _forja_users u on u.id = c.user_id
    where u.email = $1 and not c.used and c.expires_at > now() order by c.created_at desc limit 1`,
  authFailedReset: `update _forja_reset_codes set attempts = attempts + 1 where id = $1`,
  authUseReset: `update _forja_reset_codes set used = true where id = $1`,
  authChangePassword: `update _forja_users set password_hash = $2, failed_logins = 0, locked_until = null where id = $1 returning id, email, name, role`,
  authRevokeUserSessions: `delete from _forja_sessions where user_id = $1`,
  authCreateAdmin: `insert into _forja_users (id, email, role) values ($1, $2, 'admin') on conflict (email) do nothing returning id`,
  authProjectOwner: `select a.email from projects p join accounts a on a.id = p.owner_id where p.id = $1`,
  authFindUser: `select id, email, name, role from _forja_users where email = $1`,
  authCreateTestSession: `insert into _forja_sessions (token_hash, user_id, expires_at) values ($1, $2, now() + interval '5 minutes')`,
  authTemporaryPassword: `update _forja_users set password_hash = $2, failed_logins = 0, locked_until = null where email = $1 returning id`,
  aiProject: `select p.owner_id, p.ai_enabled, a.credits from projects p join accounts a on a.id = p.owner_id where p.id = $1`,
  aiUsage: `select source, model, sum(input_tokens + cache_read_tokens + cache_write_tokens)::int as "inputTokens", sum(output_tokens)::int as "outputTokens",
    sum(cache_read_tokens)::int as "cachedTokens", round(sum(usd)::numeric, 4)::float as usd,
    sum(credits)::int as credits, count(*)::int as calls from ai_usage where project_id = $1 group by source, model order by sum(usd) desc`,
  emailProject: `select a.email as owner_email, p.name, p.email_domain, p.email_domain_verified from projects p join accounts a on a.id = p.owner_id where p.id = $1`,
  emailRecordOutbound: `insert into emails (project_id, to_address, intended_to, from_address, subject, html, status, env) values ($1, $2, $3, $4, $5, $6, $7, $8)`,
  emailRecordInbound: `insert into emails (project_id, direction, to_address, from_address, subject, html, status, env) values ($1, 'in', $2, $3, $4, $5, 'received', $6)`,
  emailList: `select id, direction, env, to_address as "to", intended_to as "intendedTo", from_address as "from", subject, html, status, created_at as "createdAt" from emails
    where project_id = $1 and ($2::text is null or env = $2 or env is null) order by created_at desc, id desc limit 200`,
  secretRequest: `insert into project_secrets (project_id, name, description) values ($1, $2, $3) on conflict (project_id, name) do update set description = excluded.description`,
  secretSet: `insert into project_secrets (project_id, name, value_enc) values ($1, $2, $3) on conflict (project_id, name) do update set value_enc = excluded.value_enc`,
  secretDelete: `delete from project_secrets where project_id = $1 and name = $2`,
  secretList: `select name, description, value_enc is not null as "isSet" from project_secrets where project_id = $1 order by name`,
  secretValues: `select name, value_enc from project_secrets where project_id = $1 and value_enc is not null`,
  storagePut: `insert into storage_objects (project_id, key, filename, content_type, size) values ($1, $2, $3, $4, $5)
    on conflict (project_id, key) do update set filename = excluded.filename, content_type = excluded.content_type, size = excluded.size, created_at = now()`,
  storageGet: `select filename, content_type, size from storage_objects where project_id = $1 and key = $2`,
  storageDelete: `delete from storage_objects where project_id = $1 and key = $2`,
  storageList: `select key, filename, content_type as "contentType", size, created_at as "createdAt" from storage_objects where project_id = $1 order by created_at desc`,
  storageUsage: `select coalesce(sum(size), 0)::int as bytes from storage_objects where project_id = $1`,
  jobCreateRun: `insert into job_runs (project_id, job, trigger, status, env) values ($1, $2, $3, 'running', $4) returning id`,
  jobEnqueue: `with capacity as (
    insert into job_queue_capacity (project_id, pending) values ($2, 1)
    on conflict (project_id) do update set pending = job_queue_capacity.pending + 1
    where job_queue_capacity.pending < $8 returning project_id
  ) insert into job_queue (id, project_id, env, job, payload, trigger, max_attempts, service)
    select $1, project_id, $3, $4, $5::jsonb, $6, $7, $9 from capacity returning id`,
  jobClaimQueue: `with claim as (
    select id from job_queue
    where ((status = 'queued' and available_at <= now())
      or (status = 'running' and lease_until <= now() and attempts < max_attempts))
      and ($4::text[] is null or service = any($4::text[]))
      and ($5::text is null or project_id = $5)
    order by available_at, created_at for update skip locked limit $1
  ) update job_queue j set status = 'running', attempts = attempts + 1,
    lease_token = $2, lease_until = now() + ($3::int * interval '1 millisecond')
    from claim where j.id = claim.id returning j.*`,
  jobRenewLease: `update job_queue set lease_until = now() + ($3::int * interval '1 millisecond')
    where id = $1 and lease_token = $2 and status = 'running' returning id`,
  jobCompleteQueue: `with done as (
    update job_queue set status = 'completed', finished_at = now(), lease_token = null, lease_until = null
    where id = $1 and lease_token = $2 and status = 'running' returning id, project_id
  ), released as (
    update job_queue_capacity c set pending = pending - 1 from done where c.project_id = done.project_id
  ) select id from done`,
  jobFailQueue: `with failed as (
    update job_queue set status = case when attempts >= max_attempts then 'dead' else 'queued' end,
      error = $3, available_at = now() + ($4::int * interval '1 millisecond'),
      finished_at = case when attempts >= max_attempts then now() else null end,
      lease_token = null, lease_until = null
    where id = $1 and lease_token = $2 and status = 'running' returning id, project_id, status
  ), released as (
    update job_queue_capacity c set pending = pending - 1 from failed
    where c.project_id = failed.project_id and failed.status = 'dead'
  ) select id, status from failed`,
  jobRecoverQueue: `with exhausted as (
    update job_queue set status = 'dead', finished_at = now(), error = 'Worker lease expired after final attempt',
      lease_token = null, lease_until = null
    where status = 'running' and lease_until <= now() and attempts >= max_attempts
    returning id, project_id, env, job
  ), counts as (select project_id, count(*)::int as n from exhausted group by project_id),
  released as (
    update job_queue_capacity c set pending = pending - counts.n from counts where c.project_id = counts.project_id
  ) select * from exhausted`,
  jobPromoteTimers: `with due as materialized (
    select * from job_timers where status = 'pending' and run_at <= now()
    order by run_at for update skip locked limit 20
  ), counts as (select project_id, count(*)::int as n from due group by project_id),
  capacity as (
    insert into job_queue_capacity (project_id, pending)
      select project_id, n from counts order by project_id
    on conflict (project_id) do update set pending = job_queue_capacity.pending + excluded.pending
      where job_queue_capacity.pending + excluded.pending <= $2 returning project_id
  ), queued as (
    insert into job_queue (id, project_id, env, job, payload, trigger, max_attempts, service)
    select 'timer:' || due.id, due.project_id, due.env, due.job, coalesce(due.payload, 'null'::jsonb), 'timer', $1, due.service
      from due join capacity using (project_id) returning id
  ) update job_timers set status = 'fired'
    where 'timer:' || id in (select id from queued) returning project_id, env, job`,
  jobPruneQueue: `delete from job_queue where id in (
    select id from job_queue where finished_at < now() - interval '7 days'
    order by finished_at limit 100
  )`,
  jobQueue: `select id, job, service, env, trigger, status, attempts, max_attempts as "maxAttempts", error,
    available_at as "availableAt", lease_until as "leaseUntil", created_at as "createdAt",
    finished_at as "finishedAt" from job_queue where project_id = $1 order by created_at desc limit 100`,
  jobProjectSlug: `select slug from projects where id = $1`,
  jobCompleteRun: `update job_runs set status = 'ok', finished_at = now() where id = $1`,
  jobFailRun: `update job_runs set status = 'error', error = $2, finished_at = now() where id = $1`,
  jobPendingCount: `select count(*)::int as n from job_timers where project_id = $1 and status = 'pending'`,
  jobCreateTimer: `insert into job_timers (id, project_id, env, job, payload, run_at, service) values ($1, $2, $3, $4, $5, $6, $7)`,
  jobClaimTimers: `update job_timers set status = 'fired' where id in (select id from job_timers where status = 'pending' and run_at <= now() limit 20) returning id, project_id, env, job, payload`,
  jobDisabled: `select job from job_settings where project_id = $1 and not enabled`,
  jobSettings: `select job, enabled from job_settings where project_id = $1`,
  jobRuns: `select id, job, env, trigger, status, error, started_at as "startedAt", finished_at as "finishedAt" from job_runs
    where project_id = $1 and ($2::text is null or env = $2 or env is null) order by id desc limit 50`,
  jobTimers: `select id, job, env, run_at as "runAt", status from job_timers where project_id = $1 and status = 'pending' and ($2::text is null or env = $2) order by run_at`,
  jobSetEnabled: `insert into job_settings (project_id, job, enabled) values ($1, $2, $3) on conflict (project_id, job) do update set enabled = excluded.enabled`,
  jobCancelTimer: `update job_timers set status = 'cancelled' where project_id = $1 and id = $2 and status = 'pending'`,
  jobPublishedProjects: `select id from projects where published_version_id is not null`,
  analyticsRecord: `insert into page_views (project_id, visitor, path, referrer, browser, device) values ($1, $2, $3, $4, $5, $6)`,
  analyticsTotals: `select count(distinct visitor)::int as visitors, count(*)::int as views from page_views where project_id = $1 and created_at > now() - ($2::int * interval '1 day')`,
  analyticsCurrent: `select count(distinct visitor)::int as n from page_views where project_id = $1 and created_at > now() - interval '5 minutes'`,
  analyticsTrend: `select to_char(d, 'YYYY-MM-DD') as day,
    (select count(distinct visitor)::int from page_views where project_id = $1 and created_at::date = d) as visitors,
    (select count(*)::int from page_views where project_id = $1 and created_at::date = d) as views
    from generate_series(current_date - ($2::int - 1), current_date, interval '1 day') as d`,
  projectSchema: `select table_name, column_name, data_type, is_nullable, column_default from information_schema.columns where table_schema = 'public' order by table_name, ordinal_position`,
};
function statement(operation: string) {
  if (operation.startsWith("analyticsTop:")) {
    const column = operation.slice("analyticsTop:".length);
    if (!["path", "referrer", "browser", "device"].includes(column)) throw new Error("Unknown analytics dimension");
    return `select coalesce(${column}, 'Directo') as label, count(*)::int as count from page_views
      where project_id = $1 and created_at > now() - ($2::int * interval '1 day') group by 1 order by 2 desc limit 8`;
  }
  const sql = statements[operation];
  if (!sql) throw new Error(`Unknown app service repository operation: ${operation}`);
  return sql;
}
export function createQueryRepository(driver: DatabasePorts): QueryRepository {
  return {
    q: (operation, params) => driver.q(statement(operation), params),
    one: (operation, params) => driver.one(statement(operation), params),
  };
}
export const platformRepository = createQueryRepository({ q, one });
export function authRepository(projectId: string, env: AppEnv = "published"): AuthRepository {
  return createAuthRepository(projectDb(projectId, env));
}
export function createAuthRepository(db: ProjectDb): AuthRepository {
  return {
    query: (operation, params) => db.query(statement(operation), params),
    one: (operation, params) => db.one(statement(operation), params),
    transaction: (fn) => db.transaction((tx) => fn({
      query: (operation, params) => tx.query(statement(operation), params),
      one: (operation, params) => tx.one(statement(operation), params),
    })),
  };
}
export function schemaRows(projectId: string, env: AppEnv = "preview") {
  return projectDb(projectId, env).query<{ table_name: string; column_name: string; data_type: string; is_nullable: string; column_default: string | null }>(statement("projectSchema"));
}
