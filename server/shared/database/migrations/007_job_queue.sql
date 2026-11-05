create table job_queue_capacity (
  project_id text primary key references projects(id) on delete cascade,
  pending integer not null check (pending >= 0)
);

create table job_queue (
  id text primary key,
  project_id text not null references projects(id) on delete cascade,
  env text not null check (env in ('preview', 'published')),
  job text not null,
  service text not null default 'monolith',
  payload jsonb not null default 'null',
  trigger text not null,
  status text not null default 'queued' check (status in ('queued', 'running', 'completed', 'dead')),
  attempts integer not null default 0 check (attempts >= 0),
  max_attempts integer not null default 3 check (max_attempts between 1 and 10),
  available_at timestamptz not null default now(),
  lease_until timestamptz,
  lease_token text,
  error text,
  created_at timestamptz not null default now(),
  finished_at timestamptz
);
create index job_queue_ready on job_queue (available_at, created_at) where status = 'queued';
create index job_queue_leases on job_queue (lease_until) where status = 'running';
create index job_queue_project on job_queue (project_id, created_at);
create index job_queue_service on job_queue (service, project_id, available_at) where status in ('queued', 'running');
alter table job_timers add column service text not null default 'monolith';
