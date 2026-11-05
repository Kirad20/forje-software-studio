-- Only identifiers and numeric measurements: never prompts, tool payloads or credentials.
create table execution_context_events (
  id bigserial primary key,
  project_id text not null references projects(id) on delete cascade,
  task_id text,
  turn_id text,
  trace_id text,
  agent_id text,
  kind text not null check (kind in ('file_read', 'compaction')),
  measured boolean not null,
  before_tokens bigint check (before_tokens >= 0),
  after_tokens bigint check (after_tokens >= 0),
  bytes bigint check (bytes >= 0),
  count bigint check (count >= 0),
  created_at timestamptz not null default now()
);
create index execution_context_events_project_at on execution_context_events(project_id, created_at desc, id desc);
create index execution_context_events_at on execution_context_events(created_at desc, id desc);
create index fusion_steps_project_at on fusion_steps(project_id, created_at desc, id desc);
create index fusion_steps_at on fusion_steps(created_at desc, id desc);
create index ai_usage_project_at on ai_usage(project_id, created_at desc);
create index ai_usage_at on ai_usage(created_at desc);
