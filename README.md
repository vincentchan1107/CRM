# 見客通 CaseFlow CRM（HTML + Supabase）

GitHub 放網頁程式，Supabase 做 Database。

## 一次過啟用（必須）

Anon key **唔可以**建表／刪舊 schema。請你做呢一步：

1. 打開 [Supabase SQL Editor](https://supabase.com/dashboard/project/xdjzkcqhwamfajsjyclq/sql)
2. 貼上並 **Run** 整個 [`supabase/setup.sql`](./supabase/setup.sql)
   - 會刪除舊表（`profiles` / `customers` / `meetings` / `sales_cases` 等）
   - 新建 `crm_cases`，開放 anon 讀寫，並插入示範案件
3. 打開 [`index.html`](./index.html)（或下面 Preview 連結）

完成後，Portal／Kanban／Dashboard／列表都會直接讀寫 Supabase。

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
