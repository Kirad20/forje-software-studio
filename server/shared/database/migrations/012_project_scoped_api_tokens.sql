alter table api_tokens
  add column project_id text references projects(id) on delete cascade,
  add constraint api_tokens_scope_check check (project_id is null or org_id is null);

create index api_tokens_project_scope on api_tokens (project_id) where project_id is not null;
