-- Skills an organization shares with every project of it (see server/builder/skills.ts):
-- how the team builds things, loaded by the builder agents on demand.
create table if not exists org_skills (
  org_id text not null references organizations(id) on delete cascade,
  name text not null,
  description text not null,
  body text not null,
  enabled boolean not null default true,
  updated_by text references accounts(id) on delete set null,
  updated_at timestamptz not null default now(),
  primary key (org_id, name)
);
