import { q } from "./database/index.js";

export interface OperationalEvent {
  service: "project-db" | "compiler";
  event: "open_failed" | "query_failed" | "migration_failed" | "preview_copy_failed" | "clone_failed" | "compiler_stopped";
  projectId?: string;
  env?: "preview" | "published";
  error?: unknown;
}

function safeIdentifier(value: unknown): string | null {
  return typeof value === "string" && /^[A-Za-z0-9_.-]{1,80}$/.test(value) ? value : null;
}

let nextCleanup = 0;

export async function cleanupOperationalEvents(): Promise<void> {
  if (Date.now() < nextCleanup) return;
  nextCleanup = Date.now() + 60 * 60 * 1000;
  try {
    await q("delete from operational_events where created_at < now() - interval '30 days'");
  } catch (error) {
    nextCleanup = 0;
    console.error("[operational-log] failed to clean up events:", error instanceof Error ? error.name : "unknown error");
  }
}

export async function recordOperationalEvent(event: OperationalEvent): Promise<void> {
  const error = event.error;
  const allowedNames = ["Error", "TypeError", "RangeError", "RuntimeError", "AggregateError"];
  const name = error instanceof Error ? (allowedNames.includes(error.name) ? error.name : "OtherError") : null;
  const rawCode = error && typeof error === "object" && "code" in error ? error.code : null;
  const code = typeof rawCode === "string" && /^(?:[0-9A-Z]{5}|E[A-Z_]{1,30})$/.test(rawCode) ? rawCode : null;
  try {
    await q(
      "insert into operational_events (service, event, project_id, env, error_name, error_code, level) values ($1, $2, $3, $4, $5, $6, 'error')",
      [event.service, event.event, safeIdentifier(event.projectId), event.env ?? null, name, code],
    );
    await cleanupOperationalEvents();
  } catch (writeError) {
    console.error("[operational-log] failed to persist event:", writeError instanceof Error ? writeError.name : "unknown error");
  }
}

export async function readOperationalEvents(filter: {
  projectId?: string; service?: string; env?: string; level?: string; source?: string;
  from?: string; to?: string; limit?: number; offset?: number;
}) {
  return q(
    `select id, created_at, service, event, project_id, env, level, source, error_name, error_code
     from operational_events
     where ($1::text is null or project_id = $1) and ($2::text is null or service = $2)
       and ($3::text is null or env = $3) and ($4::text is null or level = $4)
       and ($5::text is null or source = $5)
       and ($6::timestamptz is null or created_at >= $6) and ($7::timestamptz is null or created_at <= $7)
     order by created_at desc, id desc limit $8 offset $9`,
    [filter.projectId ?? null, filter.service ?? null, filter.env ?? null, filter.level ?? null, filter.source ?? null,
      filter.from ?? null, filter.to ?? null, filter.limit ?? 50, filter.offset ?? 0],
  );
}
