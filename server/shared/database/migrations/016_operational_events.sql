create table if not exists operational_events (
  id bigserial primary key,
  event_key uuid unique,
  created_at timestamptz not null default now(),
  service text not null,
  event text not null,
  project_id text,
  env text,
  level text,
  source text,
  error_name text,
  error_code text
);
create index if not exists operational_events_created_at_idx on operational_events (created_at desc, id desc);
create index if not exists operational_events_project_created_idx on operational_events (project_id, created_at desc, id desc);
