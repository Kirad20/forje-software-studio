alter table projects alter column model_mode set default 'standard';

update projects
set model_mode = case model_mode
  when 'saving' then 'standard'
  when 'balanced' then 'high'
  when 'quality' then 'max'
  else model_mode
end;

alter table projects drop constraint if exists projects_model_mode_check;
alter table projects add constraint projects_model_mode_check
  check (model_mode in ('standard', 'high', 'max'));
