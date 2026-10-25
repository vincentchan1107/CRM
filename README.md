# 見客通 CaseFlow CRM（HTML + Supabase）

GitHub 放網頁程式，Supabase 做 Database。

## 一次過啟用／匯入 Ricoh Excel（必須）

Anon key **唔可以**建表。請你做呢一步：

1. 打開 [Supabase SQL Editor](https://supabase.com/dashboard/project/xdjzkcqhwamfajsjyclq/sql)
2. 貼上並 **Run** 整個 [`supabase/ricoh_import.sql`](./supabase/ricoh_import.sql)  
   Raw：https://raw.githubusercontent.com/vincentchan1107/CRM/main/supabase/ricoh_import.sql
   - 刪除舊 sample cases
   - 新建 `crm_cases` / `crm_contacts` / `crm_activity_logs`
   - 匯入 Ricoh Event Excel（同一公司合併為 1 個 case，多聯絡人 + log）
3. 打開 https://vincentchan1107.github.io/CRM/

完成後可管理：聯絡 log（含聯絡不到）、約見／確認、會面完成／會後 comment、跟進機會與後續 stage。

### 資料庫管理欄位升級（建議）

若已跑過舊版 `ricoh_import.sql`，請再 Run [`supabase/mgmt_alter.sql`](./supabase/mgmt_alter.sql)（唔會刪資料）：

Raw：https://raw.githubusercontent.com/vincentchan1107/CRM/main/supabase/mgmt_alter.sql

- 新增 `next_follow_up_at`（下次跟進日期）
- 新增 `team_leader`
- 允許 `close_reason = won`（成功簽單）

## 在瀏覽器打開（GitHub）

PR / 分支 Preview（無需自己 host）：

- https://htmlpreview.github.io/?https://github.com/vincentchan1107/CRM/blob/cursor/crm-mobile-portal-backend-f9da/index.html
- 或 raw：https://cdn.jsdelivr.net/gh/vincentchan1107/CRM@cursor/crm-mobile-portal-backend-f9da/index.html

本地：用瀏覽器直接開 `index.html`，或任意靜態 server。

## 功能

- **手機 Portal**：語音（Web Speech）／文字解析 → 客戶、Partner、系統、需求、數量、Budget
- **Kanban**：首次會見 → 報價 → 跟進 → 最終階段 → 確認簽單 → 已關閉（DQ／失敗）
- **列表**：details、target closing date、amount
- **Dashboard**：未來 6 個月 closing 額與成功機率

## 設定

`index.html` 內已寫入：

- `SUPABASE_URL = https://xdjzkcqhwamfajsjyclq.supabase.co`
- anon key

（正式環境建議之後輪換 key，並改用環境注入；公開 HTML 只能用 anon key + RLS。）

## 可選：Next.js 版

Repo 內仍保留先前 Next.js 實作（`src/`）。日常請用根目錄 `index.html` + Supabase。
