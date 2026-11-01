-- Panel de administración: ajustes globales, su auditoría y los proveedores de modelos.

-- Only what an admin changed; the defaults live in server/config.ts. Secrets go encrypted
-- (lib/crypto.ts, SECRETS_KEY) in value_enc, everything else as JSON in value.
create table if not exists settings (
  key text primary key,
  value jsonb,
  value_enc text,
  updated_by text references accounts(id) on delete set null,
  updated_at timestamptz not null default now()
);

-- Who changed what and when. Never the value: a secret must not end up here in clear.
create table if not exists settings_audit (
  id serial primary key,
  key text not null,
  actor_id text references accounts(id) on delete set null,
  action text not null check (action in ('set', 'reset', 'create', 'delete')),
  at timestamptz not null default now()
);
create index if not exists settings_audit_at on settings_audit (at desc);

-- Model providers. anthropic, openrouter and openai are builtin (seeded, never deleted); admins add
-- more OpenAI-compatible ones. A provider is usable when enabled and it has what it needs.
create table if not exists providers (
  id text primary key,
  kind text not null check (kind in ('anthropic', 'openai')),
  label text not null,
  base_url text,
  api_key_enc text,
  headers jsonb not null default '{}',
  enabled boolean not null default false,
  builtin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- The catalog now also holds the builtin (Anthropic) and custom models, each switchable.
alter table model_catalog add column if not exists source text not null default 'openrouter' check (source in ('builtin', 'openrouter', 'custom'));
alter table model_catalog add column if not exists enabled boolean not null default true;
alter table model_catalog add column if not exists long_prompt jsonb;
