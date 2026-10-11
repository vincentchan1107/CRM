import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const outDir = "/opt/cursor/artifacts/screenshots";
fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

await page.goto("http://127.0.0.1:3000/", { waitUntil: "networkidle" });
await page.screenshot({ path: path.join(outDir, "01-home.png"), fullPage: true });

await page.goto("http://127.0.0.1:3000/portal", { waitUntil: "networkidle" });
const sample =
  "客戶係雲端商貿，來自 Partner A，用緊 CRM 同 BI，需求係銷售報表，數量30用戶，budget大約三十五萬";
await page.locator("textarea").first().fill(sample);
await page.getByRole("button", { name: "解析並填入表格" }).click();
await page.waitForTimeout(800);
await page.screenshot({
  path: path.join(outDir, "02-portal-parsed.png"),
  fullPage: true,
});

const customer = await page.locator('input[name="customerName"]').inputValue();
const partner = await page.locator('select[name="partner"]').inputValue();
const budget = await page.locator('input[name="budget"]').inputValue();
if (customer !== "雲端商貿" || partner !== "Partner A" || budget !== "350000") {
  console.error("Parse failed", { customer, partner, budget });
  process.exit(1);
}

await page.getByRole("button", { name: /建立案件/ }).click();
await page.waitForSelector("text=案件已建立");
await page.screenshot({
  path: path.join(outDir, "03-portal-submitted.png"),
  fullPage: true,
});

await page.goto("http://127.0.0.1:3000/admin", { waitUntil: "networkidle" });
await page.waitForTimeout(500);
await page.screenshot({
  path: path.join(outDir, "04-dashboard.png"),
  fullPage: true,
});

await page.goto("http://127.0.0.1:3000/admin/board", {
  waitUntil: "networkidle",
});
await page.waitForTimeout(500);
await page.screenshot({
  path: path.join(outDir, "05-kanban.png"),
  fullPage: true,
});

await page.goto("http://127.0.0.1:3000/admin/cases", {
  waitUntil: "networkidle",
});
await page.waitForTimeout(500);
await page.screenshot({
  path: path.join(outDir, "06-cases.png"),
  fullPage: true,
});

console.log("E2E OK", { customer, partner, budget });
await browser.close();
