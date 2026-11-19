-- Studio sign-in with social and OAuth providers (Better Auth): which provider account
-- belongs to which Forja account. The same provider account always reaches the same account.
create table if not exists account_oauth_identities (
  provider text not null,
  subject text not null,
  account_id text not null references accounts(id) on delete cascade,
  email text,
  created_at timestamptz not null default now(),
  primary key (provider, subject)
);
create index if not exists account_oauth_identities_account on account_oauth_identities (account_id);
