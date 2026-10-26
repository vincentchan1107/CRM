-- 資料庫管理欄位（可重跑）
-- 在 Supabase SQL Editor 執行此檔，唔會刪除現有資料

alter table public.crm_cases
  add column if not exists next_follow_up_at date;

alter table public.crm_cases
  add column if not exists team_leader text not null default '';

-- 本公司銷售員（Vincent / Tim / Andrew / Kelly / Sophia）
-- 注意：ricoh_sales 係 Partner Sales，唔係本公司銷售員
alter table public.crm_cases
  add column if not exists company_sales text not null default '';

-- 公司地址（Customer Address）
alter table public.crm_cases
  add column if not exists customer_address text not null default '';

-- 客戶名片圖片（Portal 影相／上載）
create table if not exists public.crm_case_cards (
  id text primary key,
  case_id text not null references public.crm_cases(id) on delete cascade,
  contact_id text references public.crm_contacts(id) on delete set null,
  image_data text not null default '',
  ocr_text text not null default '',
  created_at timestamptz not null default now()
);
create index if not exists crm_case_cards_case_idx on public.crm_case_cards(case_id);
alter table public.crm_case_cards enable row level security;
drop policy if exists crm_case_cards_all on public.crm_case_cards;
create policy crm_case_cards_all on public.crm_case_cards for all to anon, authenticated using (true) with check (true);

-- 允許成功簽單 close_reason = won
alter table public.crm_cases drop constraint if exists crm_cases_close_reason_check;
alter table public.crm_cases
  add constraint crm_cases_close_reason_check
  check (close_reason in ('disqualified', 'failed', 'won') or close_reason is null);

create index if not exists crm_cases_partner_idx on public.crm_cases(partner);
create index if not exists crm_cases_followup_idx on public.crm_cases(next_follow_up_at);
create index if not exists crm_cases_team_leader_idx on public.crm_cases(team_leader);
create index if not exists crm_cases_company_sales_idx on public.crm_cases(company_sales);

-- 由 ricoh_house 自動填 team_leader（只填空值）
-- 例：MA (Polly Lee Team) → Polly Lee
update public.crm_cases
set team_leader = trim(both from regexp_replace(ricoh_house, '.*\(([^)]+) Team\).*', '\1'))
where coalesce(team_leader, '') = ''
  and ricoh_house ~ '\([^)]+ Team\)';
