-- 只加 CALLER 欄（可單獨 Run）
alter table public.crm_cases add column if not exists caller text not null default '';
create index if not exists crm_cases_caller_idx on public.crm_cases(caller);
