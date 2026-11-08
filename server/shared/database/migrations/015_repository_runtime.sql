create table repository_runtime_configs (
  project_id text primary key references projects(id) on delete cascade,
  state jsonb not null
);
create table repository_runtime_revisions (
  project_id text not null references repository_runtime_configs(project_id) on delete cascade,
  id text not null,
  created_at timestamptz not null,
  revision jsonb not null,
  primary key(project_id,id)
);
create table repository_runtime_deployments (
  project_id text not null references repository_runtime_configs(project_id) on delete cascade,
  env text not null check(env in ('preview','published')),
  deployment jsonb not null,
  primary key(project_id,env)
);
create table repository_runtime_secrets (
  project_id text not null references projects(id) on delete cascade,
  env text not null check(env in ('preview','published')),
  encrypted_secrets text not null,
  primary key(project_id,env)
);
