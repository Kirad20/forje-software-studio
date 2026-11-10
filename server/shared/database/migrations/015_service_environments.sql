-- Historical records have no reliable environment; keep them visible as legacy data.
alter table emails add column env text check (env in ('preview', 'published'));
alter table job_runs add column env text check (env in ('preview', 'published'));
