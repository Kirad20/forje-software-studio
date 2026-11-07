create table if not exists github_apps (
  account_id text primary key references accounts(id) on delete cascade,
  app_id bigint not null unique,
  slug text not null,
  name text not null,
  owner text not null,
  credentials_enc text not null,
  created_at timestamptz not null default now()
);
create table if not exists github_app_installations (
  account_id text not null references github_apps(account_id) on delete cascade,
  installation_id bigint not null,
  login text not null,
  primary key (account_id, installation_id)
);
create table if not exists github_app_states (
  nonce_hash text primary key,
  account_id text not null references accounts(id) on delete cascade,
  session_hash text not null,
  purpose text not null check (purpose in ('manifest', 'install')),
  expires_at timestamptz not null
);
alter table project_github add column if not exists installation_id bigint;
create index if not exists project_github_installation on project_github(account_id, installation_id);
