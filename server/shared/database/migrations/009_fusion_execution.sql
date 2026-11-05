-- Every physical Fusion call is durable, even when its draft is discarded.
create table fusion_steps (
  id text primary key,
  operation_id text not null,
  account_id text not null,
  project_id text references projects(id) on delete set null,
  role text not null,
  phase text not null check (phase in ('draft', 'judge', 'critic', 'revision', 'escalation')),
  model_id text not null,
  served_by text,
  effort text not null check (effort in ('low', 'medium', 'high')),
  stop_reason text check (stop_reason in ('tool_use', 'end', 'max_tokens', 'refusal')),
  retry_of text,
  ms double precision not null check (ms >= 0),
  usage jsonb not null,
  context jsonb check (context is null or jsonb_typeof(context) = 'object'),
  usd double precision not null check (usd >= 0),
  credits integer not null check (credits >= 0),
  payer_id text,
  source text not null,
  error text,
  created_at timestamptz not null default now()
);
create index fusion_steps_operation on fusion_steps(operation_id, created_at);
create index fusion_steps_account on fusion_steps(account_id, created_at);
alter table ai_usage add column fusion_step_id text unique references fusion_steps(id);
alter table ai_usage add column fusion_operation_id text;
alter table ai_usage add column fusion_phase text;

create table fusion_traces (
  operation_id text primary key,
  account_id text not null,
  project_id text references projects(id) on delete set null,
  role text not null,
  effort text not null check (effort in ('fast', 'standard', 'high', 'max')),
  pattern text not null check (pattern in ('single', 'cascade', 'critique')),
  status text check (status in ('running', 'completed', 'failed', 'cancelled')),
  final_model_id text,
  warnings jsonb not null,
  steps jsonb not null,
  turn_id text,
  task_id text,
  agent_id text,
  created_at timestamptz not null default now()
);
create index fusion_traces_project on fusion_traces(project_id, created_at);

-- Shared by all router processes; no provider probes are required for a decision.
create table model_health (
  provider text not null,
  model_id text not null,
  latency_ms double precision not null,
  successes bigint not null default 0,
  failures bigint not null default 0,
  consecutive_failures integer not null default 0,
  cooldown_until timestamptz,
  last_error text,
  last_status integer,
  updated_at timestamptz not null default now(),
  primary key (provider, model_id)
);

alter table model_catalog add column capabilities jsonb;
alter table model_catalog add column reasoning_effort boolean;
alter table model_catalog add constraint model_catalog_capabilities_object
  check (capabilities is null or jsonb_typeof(capabilities) = 'object');
