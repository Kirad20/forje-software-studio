create table if not exists rate_limit_windows (
  key text primary key,
  count integer not null,
  reset_at timestamptz not null
);
create index if not exists rate_limit_windows_reset_at on rate_limit_windows (reset_at);
