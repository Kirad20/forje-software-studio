alter table projects add column if not exists profile jsonb;
update projects set profile = '{}'::jsonb where profile is null;
