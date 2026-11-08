alter table projects add column runtime text not null default 'native'
  check (runtime in ('native', 'repository'));
