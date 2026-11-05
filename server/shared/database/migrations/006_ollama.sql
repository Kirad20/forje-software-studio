alter table providers drop constraint providers_kind_check;
alter table providers add constraint providers_kind_check check (kind in ('anthropic', 'openai', 'ollama'));
