create table mcp_oauth_clients (
  client_id text primary key,
  client_name text not null,
  redirect_uris jsonb not null,
  created_at timestamptz not null default now()
);

create table mcp_oauth_codes (
  code_hash text primary key,
  client_id text not null references mcp_oauth_clients(client_id) on delete cascade,
  account_id text not null references accounts(id) on delete cascade,
  redirect_uri text not null,
  code_challenge text not null,
  scope text not null,
  expires_at timestamptz not null,
  consumed_at timestamptz
);

create table mcp_oauth_tokens (
  access_token_hash text primary key,
  refresh_token_hash text not null unique,
  client_id text not null references mcp_oauth_clients(client_id) on delete cascade,
  account_id text not null references accounts(id) on delete cascade,
  scope text not null,
  expires_at timestamptz not null,
  refresh_expires_at timestamptz not null,
  revoked_at timestamptz,
  last_used_at timestamptz,
  created_at timestamptz not null default now()
);

create index mcp_oauth_codes_expiry on mcp_oauth_codes (expires_at);
create index mcp_oauth_tokens_account on mcp_oauth_tokens (account_id, created_at desc);
