# 見客通 CaseFlow CRM

手機語音建案 Portal + 後台 Kanban／列表／成交預測 Dashboard。

## 功能

- **手機 Portal**（`/portal`）：AI 語音輸入（Web Speech API + 粵語／中文解析），自動填入客戶名稱、Partner、系統、需求、數量、Budget
- **後台 Dashboard**（`/admin`）：未來 6 個月 closing 案件數、簽單額、加權預測、成功機率
- **Kanban**（`/admin/board`）：首次會見 → 報價 → 跟進 → 最終階段 → 確認簽單 → 已關閉（DQ／失敗）
- **列表**（`/admin/cases`）：案件 details、target closing date、case amount

## 快速開始

```bash
npm install
npm run dev
```

開啟 [http://localhost:3000](http://localhost:3000)。

資料存在 `data/cases.json`（首次啟動會自動種子示範案件）。

可選：設定 `OPENAI_API_KEY` 可加強語音文字解析；無 key 時使用內建規則解析。

## Scripts

- `npm run dev` — 開發伺服器（webpack；避免 Turbopack hydration 問題）
- `npm run build` — 正式建置
- `npm run start` — 啟動正式伺服器
- `npm run test:voice` — 語音解析單元檢查
- `npm run demo:e2e` — Playwright 端到端（需先 `npm run build && npm start`）
- `npm run lint` — ESLint
