import { mkdirSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { paths } from "../config.js";

/**
 * The platform's own database: accounts, projects, their source files, checkpoints,
 * publish snapshots, chat history, secrets and every service log. Each project's
 * app data lives in a separate database (see baas/projectDb.ts).
 */
let db: PGlite | undefined;

const SCHEMA = /* sql */ `
create table if not exists accounts (
  id text primary key,
  email text not null unique,
  name text,
  credits integer not null default 0,
  created_at timestamptz not null default now()
);
create table if not exists account_sessions (
  token_hash text primary key,
  account_id text not null references accounts(id) on delete cascade,
  expires_at timestamptz not null
);
create table if not exists login_codes (
  email text primary key,
  code_hash text not null,
  attempts integer not null default 0,
  expires_at timestamptz not null
);
create table if not exists api_tokens (
  id text primary key,
  account_id text not null references accounts(id) on delete cascade,
  name text not null,
  token_hash text not null unique,
  last_used_at timestamptz,
  created_at timestamptz not null default now()
);
create table if not exists projects (
  id text primary key,
  owner_id text not null references accounts(id) on delete cascade,
  name text not null,
  description text not null default '',
  slug text unique,
  visibility text not null default 'public',
  ai_enabled boolean not null default true,
  email_domain text,
  email_domain_verified boolean not null default false,
  published_version_id text,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists project_files (
  project_id text not null references projects(id) on delete cascade,
  path text not null,
  content text not null,
  updated_at timestamptz not null default now(),
  primary key (project_id, path)
);
create table if not exists published_versions (
  id text primary key,
  project_id text not null references projects(id) on delete cascade,
  files jsonb not null,
  created_at timestamptz not null default now()
);
create table if not exists chat_messages (
  id serial primary key,
  project_id text not null references projects(id) on delete cascade,
  role text not null,
  content jsonb not null,
  created_at timestamptz not null default now()
);
create table if not exists project_secrets (
  project_id text not null references projects(id) on delete cascade,
  name text not null,
  value_enc text,
  description text not null default '',
  created_at timestamptz not null default now(),
  primary key (project_id, name)
);
create table if not exists emails (
  id serial primary key,
  project_id text not null references projects(id) on delete cascade,
  direction text not null default 'out',
  to_address text not null,
  intended_to text,
  from_address text not null,
  subject text not null,
  html text not null,
  status text not null,
  created_at timestamptz not null default now()
);
create table if not exists ai_usage (
  id serial primary key,
  project_id text references projects(id) on delete cascade,
  account_id text not null,
  source text not null,
  model text not null,
  input_tokens integer not null,
  output_tokens integer not null,
  credits integer not null,
  created_at timestamptz not null default now()
);
create table if not exists job_timers (
  id text primary key,
  project_id text not null references projects(id) on delete cascade,
  env text not null,
  job text not null,
  payload jsonb not null,
  run_at timestamptz not null,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);
create table if not exists job_runs (
  id serial primary key,
  project_id text not null references projects(id) on delete cascade,
  job text not null,
  trigger text not null,
  status text not null,
  error text,
  started_at timestamptz not null default now(),
  finished_at timestamptz
);
create table if not exists job_settings (
  project_id text not null references projects(id) on delete cascade,
  job text not null,
  enabled boolean not null default true,
  primary key (project_id, job)
);
create table if not exists folders (
  id text primary key,
  account_id text not null references accounts(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);
alter table projects add column if not exists favorite boolean not null default false;
alter table projects add column if not exists archived boolean not null default false;
alter table projects add column if not exists folder_id text references folders(id) on delete set null;
alter table projects add column if not exists last_opened_at timestamptz not null default now();
alter table projects add column if not exists system_prompt text not null default '';
alter table projects add column if not exists design_prompt text not null default '';
alter table projects add column if not exists seo jsonb not null default '{}';
alter table projects add column if not exists share_epoch integer not null default 0;
-- One row per write, holding what each touched file looked like before, so any point can be restored.
create table if not exists project_changes (
  id serial primary key,
  project_id text not null references projects(id) on delete cascade,
  kind text not null,
  paths jsonb not null,
  author text not null,
  label text,
  description text,
  before jsonb not null default '{}',
  created_at timestamptz not null default now()
);
alter table project_changes add column if not exists actor text;
create index if not exists project_changes_project on project_changes (project_id, id desc);
create table if not exists account_integrations (
  id text primary key,
  account_id text not null references accounts(id) on delete cascade,
  type text not null,
  name text not null,
  description text not null default '',
  env_name text not null,
  value_enc text not null,
  created_at timestamptz not null default now()
);
create table if not exists project_integrations (
  project_id text not null references projects(id) on delete cascade,
  integration_id text not null references account_integrations(id) on delete cascade,
  primary key (project_id, integration_id)
);
create table if not exists page_views (
  id serial primary key,
  project_id text not null references projects(id) on delete cascade,
  visitor text not null,
  path text not null,
  referrer text,
  browser text,
  device text,
  created_at timestamptz not null default now()
);
create index if not exists page_views_project on page_views (project_id, created_at desc);
create table if not exists builder_actions (
  account_id text not null references accounts(id) on delete cascade,
  day date not null default current_date,
  count integer not null default 0,
  primary key (account_id, day)
);
create table if not exists project_members (
  project_id text not null references projects(id) on delete cascade,
  account_id text not null references accounts(id) on delete cascade,
  role text not null default 'editor',
  created_at timestamptz not null default now(),
  primary key (project_id, account_id)
);
create table if not exists project_invites (
  project_id text not null references projects(id) on delete cascade,
  email text not null,
  role text not null default 'editor',
  invited_by text not null,
  created_at timestamptz not null default now(),
  primary key (project_id, email)
);
create table if not exists storage_objects (
  project_id text not null references projects(id) on delete cascade,
  key text not null,
  filename text not null,
  content_type text not null,
  size integer not null,
  created_at timestamptz not null default now(),
  primary key (project_id, key)
);

-- Models: catalog synced from providers, and the account/project whitelists.
create table if not exists model_catalog (
  id text primary key,
  provider text not null,
  model text not null,
  label text not null,
  in_price double precision not null,
  out_price double precision not null,
  cache_read_price double precision,
  context integer not null,
  tools boolean not null,
  vision boolean not null,
  tier integer not null,
  speed integer not null,
  synced_at timestamptz not null default now()
);
create table if not exists account_models (
  account_id text not null references accounts(id) on delete cascade,
  model_id text not null,
  primary key (account_id, model_id)
);
alter table accounts add column if not exists models_customized boolean not null default false;
create table if not exists project_models (
  project_id text not null references projects(id) on delete cascade,
  model_id text not null,
  primary key (project_id, model_id)
);
alter table projects add column if not exists model_mode text not null default 'balanced';
alter table projects add column if not exists agent_concurrency integer not null default 3;

-- Router learning: Beta posterior per (task class, model), shared across the platform.
create table if not exists router_stats (
  task_class text not null,
  model_id text not null,
  alpha double precision not null,
  beta double precision not null,
  uses integer not null default 0,
  usd double precision not null default 0,
  primary key (task_class, model_id)
);
create table if not exists router_decisions (
  id serial primary key,
  project_id text references projects(id) on delete cascade,
  turn_id text,
  task_id text,
  role text not null,
  task_class text not null,
  model_id text not null,
  reason text not null,
  candidates jsonb not null,
  created_at timestamptz not null default now()
);
create index if not exists router_decisions_project on router_decisions (project_id, id desc);

-- One row per agent task in a builder turn: what the lanes in the chat show.
create table if not exists agent_tasks (
  id text primary key,
  project_id text not null references projects(id) on delete cascade,
  turn_id text not null,
  role text not null,
  goal text not null,
  model_id text,
  status text not null default 'pending',
  depends_on jsonb not null default '[]',
  files jsonb not null default '[]',
  steps jsonb not null default '[]',
  summary text,
  input_tokens integer not null default 0,
  output_tokens integer not null default 0,
  cache_read_tokens integer not null default 0,
  usd double precision not null default 0,
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists agent_tasks_turn on agent_tasks (project_id, turn_id);
alter table chat_messages add column if not exists turn_id text;

-- Rolling summary of older chat turns, so each turn sends a short context.
create table if not exists conversation_summaries (
  project_id text primary key references projects(id) on delete cascade,
  upto_message_id integer not null,
  summary text not null,
  updated_at timestamptz not null default now()
);

alter table ai_usage add column if not exists cache_read_tokens integer not null default 0;
alter table ai_usage add column if not exists cache_write_tokens integer not null default 0;
alter table ai_usage add column if not exists usd double precision not null default 0;
alter table ai_usage add column if not exists role text;
`;

export async function platformDb(): Promise<PGlite> {
  if (!db) {
    mkdirSync(paths.platformDb, { recursive: true });
    db = await PGlite.create(paths.platformDb);
    await db.exec(SCHEMA);
  }
  return db;
}

export async function q<T = Record<string, unknown>>(sql: string, params: unknown[] = []): Promise<T[]> {
  const res = await (await platformDb()).query<T>(sql, params);
  return res.rows;
}

export async function one<T = Record<string, unknown>>(sql: string, params: unknown[] = []): Promise<T | undefined> {
  return (await q<T>(sql, params))[0];
}
