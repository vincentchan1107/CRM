-- 見客通 CaseFlow CRM — 一鍵重建 Database
-- 請在 Supabase Dashboard → SQL Editor → New query 貼上並 Run

-- 1) 清走舊表（舊 CRM）
drop table if exists public.reminders cascade;
drop table if exists public.opportunities cascade;
drop table if exists public.meetings cascade;
drop table if exists public.sales_cases cascade;
drop table if exists public.customers cascade;
drop table if exists public.profiles cascade;
drop table if exists public.crm_cases cascade;

-- 2) 新建案件表
create table public.crm_cases (
  id text primary key,
  customer_name text not null,
  partner text not null default '直銷',
  systems text[] not null default '{}',
  requirements text not null default '',
  quantity text not null default '',
  budget numeric not null default 0,
  amount numeric not null default 0,
  success_rate int not null default 30,
  target_closing_date date,
  stage text not null default 'first_interview'
    check (stage in (
      'first_interview','quotation','follow_up',
      'final_stage','confirmation','closed'
    )),
  close_reason text check (close_reason in ('disqualified','failed') or close_reason is null),
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index crm_cases_stage_idx on public.crm_cases (stage);
create index crm_cases_closing_idx on public.crm_cases (target_closing_date);

-- 3) 開放 anon 讀寫（HTML 前端直接用）
alter table public.crm_cases enable row level security;

create policy "crm_cases_select_anon"
  on public.crm_cases for select to anon, authenticated
  using (true);

create policy "crm_cases_insert_anon"
  on public.crm_cases for insert to anon, authenticated
  with check (true);

create policy "crm_cases_update_anon"
  on public.crm_cases for update to anon, authenticated
  using (true) with check (true);

create policy "crm_cases_delete_anon"
  on public.crm_cases for delete to anon, authenticated
  using (true);

-- 4) 示範資料
insert into public.crm_cases (
  id, customer_name, partner, systems, requirements, quantity,
  budget, amount, success_rate, target_closing_date, stage, close_reason, notes
) values
(
  'case-001', '新里程製造', 'Partner A', array['ERP','SCM'],
  '需要整合生產與庫存，並支援多廠區', '3 個模組',
  450000, 520000, 65, (current_date + 45), 'quotation', null,
  '已完成第一次會見，等待報價回覆'
),
(
  'case-002', '藍海物流', '轉介', array['CRM','BI'],
  '銷售跟進流程數位化，報表要可自訂', '20 用戶',
  180000, 210000, 45, (current_date + 70), 'follow_up', null,
  '對方 IT 正在評估'
),
(
  'case-003', '卓然顧問', '直銷', array['HRM','WORKFLOW'],
  '人事系統 + 請假審批流程', '50 用戶',
  120000, 135000, 80, (current_date + 20), 'final_stage', null,
  '法務審約中'
),
(
  'case-004', '星河零售', 'Partner B', array['ERP','CRM','BI'],
  '門市與電商訂單統一', '全套',
  800000, 920000, 55, (current_date + 95), 'first_interview', null,
  '首次會見氣氛良好'
),
(
  'case-005', '明德學校', '活動／展覽', array['PMS'],
  '專案與預算管控', '1 套',
  90000, 95000, 90, (current_date + 18), 'confirmation', null,
  '等待董事會最後確認'
),
(
  'case-006', '舊城餐飲', 'Partner C', array['CRM'],
  '會員系統', '10 店',
  60000, 70000, 0, (current_date - 10), 'closed', 'disqualified',
  '預算不足，已 DQ'
);

notify pgrst, 'reload schema';
