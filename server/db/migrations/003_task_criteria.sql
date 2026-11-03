-- Acceptance criteria of each planned task (plan.done_when): the lanes in the chat show them.
alter table agent_tasks add column if not exists done_when jsonb not null default '[]';
