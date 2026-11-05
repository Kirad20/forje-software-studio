alter table api_tokens
  add column purpose text not null default 'project',
  add column expires_at timestamptz,
  add column revoked_at timestamptz,
  add constraint api_tokens_purpose check (purpose in ('project', 'admin')),
  add constraint api_tokens_admin_scope check (purpose <> 'admin' or (org_id is null and expires_at is not null));

create index api_tokens_account_purpose on api_tokens (account_id, purpose);
