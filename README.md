# Achiever CRM（HTML + Supabase）

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
- 新增 `company_sales`（本公司銷售員：Vincent／Tim／Andrew／Kelly／Sophia；`ricoh_sales` 仍係 Partner Sales）
- 允許 `close_reason = won`（成功簽單）

## 在瀏覽器打開（GitHub）

PR / 分支 Preview（無需自己 host）：

- https://htmlpreview.github.io/?https://github.com/vincentchan1107/CRM/blob/cursor/crm-mobile-portal-backend-f9da/index.html
- 或 raw：https://cdn.jsdelivr.net/gh/vincentchan1107/CRM@cursor/crm-mobile-portal-backend-f9da/index.html

本地：用瀏覽器直接開 `index.html`，或任意靜態 server。

## 備份

重大改版前快照：`backups/index.pre-optimize-20261025-103736.html`（可直接覆蓋返 `index.html` 還原）。

## 功能

- **手機 Portal**：語音（Web Speech）／文字解析 → 客戶、Partner、系統、需求、數量、Budget
- **Case Management**：拖曳改 stage；篩選本公司銷售員／Partner／跟進機會；卡片顯示金額、約見、下次跟進
- **列表**：欄位顯示／排序、批量改 stage／指派／跟進日、匯出 CSV／Excel
- **Dashboard**：Closing 點擊鑽取開 case；銷售員／Partner 篩選；Target $／加權 Forecast／目標額
- **會議／跟進**：逾期標示、今日約見置頂、完成會面一鍵寫 log＋推 stage、週／月曆、Webhook 提醒
- **Log History**：自動記錄欄位變更（幾時、邊個、由咩改到咩）；可篩選類型／日期；案件詳情同步顯示
- **資料庫管理**
  - **客戶管理**：VISIT、最後聯絡渠道、下次跟進、重複公司名合併
  - **Partner 管理**：DQ 率、貢獻金額排行；Team Leader 可編輯寫回 DB
  - **銷售員管理**：Pipeline 金額、加權預測、轉換率、會面／簽單統計

## 設定

`index.html` 內已寫入：

- `SUPABASE_URL = https://xdjzkcqhwamfajsjyclq.supabase.co`
- anon key

（正式環境建議之後輪換 key，並改用環境注入；公開 HTML 只能用 anon key + RLS。）

## 可選：Next.js 版

Repo 內仍保留先前 Next.js 實作（`src/`）。日常請用根目錄 `index.html` + Supabase。
