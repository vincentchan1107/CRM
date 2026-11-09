-- 只加 DQ REASON 欄（可單獨 Run）
-- 在 Supabase SQL Editor 貼上整段執行

alter table public.crm_cases add column if not exists dq_reason text not null default '';
create index if not exists crm_cases_dq_reason_idx on public.crm_cases(dq_reason);
