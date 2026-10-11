import { promises as fs } from "fs";
import path from "path";
import type { Case, CaseInput, CaseStage, DashboardStats, MonthForecast } from "./types";
import { STAGE_ORDER } from "./stages";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "cases.json");

const seedCases: Case[] = [
  {
    id: "case-001",
    customerName: "新里程製造",
    partner: "Partner A",
    systems: ["ERP", "SCM"],
    requirements: "需要整合生產與庫存，並支援多廠區",
    quantity: "3 個模組",
    budget: 450000,
    amount: 520000,
    successRate: 65,
    targetClosingDate: nextMonthDate(1, 15),
    stage: "quotation",
    closeReason: null,
    notes: "已完成第一次會見，等待報價回覆",
    createdAt: daysAgo(18),
    updatedAt: daysAgo(2),
  },
  {
    id: "case-002",
    customerName: "藍海物流",
    partner: "轉介",
    systems: ["CRM", "BI"],
    requirements: "銷售跟進流程數位化，報表要可自訂",
    quantity: "20 用戶",
    budget: 180000,
    amount: 210000,
    successRate: 45,
    targetClosingDate: nextMonthDate(2, 8),
    stage: "follow_up",
    closeReason: null,
    notes: "對方 IT 正在評估",
    createdAt: daysAgo(30),
    updatedAt: daysAgo(5),
  },
  {
    id: "case-003",
    customerName: "卓然顧問",
    partner: "直銷",
    systems: ["HRM", "WORKFLOW"],
    requirements: "人事系統 + 請假審批流程",
    quantity: "50 用戶",
    budget: 120000,
    amount: 135000,
    successRate: 80,
    targetClosingDate: nextMonthDate(0, 22),
    stage: "final_stage",
    closeReason: null,
    notes: "法務審約中",
    createdAt: daysAgo(40),
    updatedAt: daysAgo(1),
  },
  {
    id: "case-004",
    customerName: "星河零售",
    partner: "Partner B",
    systems: ["ERP", "CRM", "BI"],
    requirements: "門市與電商訂單統一",
    quantity: "全套",
    budget: 800000,
    amount: 920000,
    successRate: 55,
    targetClosingDate: nextMonthDate(3, 5),
    stage: "first_interview",
    closeReason: null,
    notes: "首次會見氣氛良好",
    createdAt: daysAgo(3),
    updatedAt: daysAgo(3),
  },
  {
    id: "case-005",
    customerName: "明德學校",
    partner: "活動／展覽",
    systems: ["PMS"],
    requirements: "專案與預算管控",
    quantity: "1 套",
    budget: 90000,
    amount: 95000,
    successRate: 90,
    targetClosingDate: nextMonthDate(0, 28),
    stage: "confirmation",
    closeReason: null,
    notes: "等待董事會最後確認",
    createdAt: daysAgo(55),
    updatedAt: daysAgo(0),
  },
  {
    id: "case-006",
    customerName: "舊城餐飲",
    partner: "Partner C",
    systems: ["CRM"],
    requirements: "會員系統",
    quantity: "10 店",
    budget: 60000,
    amount: 70000,
    successRate: 0,
    targetClosingDate: daysAgo(10).slice(0, 10),
    stage: "closed",
    closeReason: "disqualified",
    notes: "預算不足，已 DQ",
    createdAt: daysAgo(60),
    updatedAt: daysAgo(10),
  },
];

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

function nextMonthDate(monthsAhead: number, day: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() + monthsAhead, Math.min(day, 28));
  return d.toISOString().slice(0, 10);
}

async function ensureStore(): Promise<Case[]> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw) as Case[];
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  } catch {
    // create seed
  }
  await fs.writeFile(DATA_FILE, JSON.stringify(seedCases, null, 2), "utf8");
  return structuredClone(seedCases);
}

async function writeStore(cases: Case[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(cases, null, 2), "utf8");
}

export async function listCases(): Promise<Case[]> {
  const cases = await ensureStore();
  return cases.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

export async function getCase(id: string): Promise<Case | null> {
  const cases = await ensureStore();
  return cases.find((c) => c.id === id) ?? null;
}

export async function createCase(input: CaseInput): Promise<Case> {
  const cases = await ensureStore();
  const now = new Date().toISOString();
  const item: Case = {
    id: `case-${crypto.randomUUID().slice(0, 8)}`,
    customerName: input.customerName.trim(),
    partner: input.partner?.trim() || "直銷",
    systems: input.systems ?? [],
    requirements: input.requirements?.trim() || "",
    quantity: input.quantity?.trim() || "",
    budget: Number(input.budget) || 0,
    amount: Number(input.amount) || Number(input.budget) || 0,
    successRate: clampRate(input.successRate ?? defaultRate(input.stage)),
    targetClosingDate: input.targetClosingDate || defaultClosingDate(),
    stage: input.stage || "first_interview",
    closeReason: input.stage === "closed" ? input.closeReason ?? "failed" : null,
    notes: input.notes?.trim() || "",
    createdAt: now,
    updatedAt: now,
  };
  cases.unshift(item);
  await writeStore(cases);
  return item;
}

export async function updateCase(
  id: string,
  patch: Partial<CaseInput> & { stage?: CaseStage }
): Promise<Case | null> {
  const cases = await ensureStore();
  const idx = cases.findIndex((c) => c.id === id);
  if (idx < 0) return null;
  const prev = cases[idx];
  const nextStage = patch.stage ?? prev.stage;
  const updated: Case = {
    ...prev,
    customerName:
      patch.customerName !== undefined
        ? patch.customerName.trim()
        : prev.customerName,
    partner: patch.partner !== undefined ? patch.partner.trim() : prev.partner,
    systems: patch.systems !== undefined ? patch.systems : prev.systems,
    requirements:
      patch.requirements !== undefined
        ? patch.requirements.trim()
        : prev.requirements,
    quantity:
      patch.quantity !== undefined ? patch.quantity.trim() : prev.quantity,
    budget: patch.budget !== undefined ? Number(patch.budget) || 0 : prev.budget,
    amount: patch.amount !== undefined ? Number(patch.amount) || 0 : prev.amount,
    successRate:
      patch.successRate !== undefined
        ? clampRate(patch.successRate)
        : prev.successRate,
    targetClosingDate:
      patch.targetClosingDate !== undefined
        ? patch.targetClosingDate
        : prev.targetClosingDate,
    stage: nextStage,
    closeReason:
      nextStage === "closed"
        ? patch.closeReason !== undefined
          ? patch.closeReason
          : prev.closeReason ?? "failed"
        : null,
    notes: patch.notes !== undefined ? patch.notes.trim() : prev.notes,
    updatedAt: new Date().toISOString(),
  };
  cases[idx] = updated;
  await writeStore(cases);
  return updated;
}

export async function deleteCase(id: string): Promise<boolean> {
  const cases = await ensureStore();
  const next = cases.filter((c) => c.id !== id);
  if (next.length === cases.length) return false;
  await writeStore(next);
  return true;
}

export async function getDashboard(monthsAhead = 6): Promise<DashboardStats> {
  const cases = await listCases();
  const open = cases.filter((c) => c.stage !== "closed");
  const closed = cases.filter((c) => c.stage === "closed");
  const byStage = Object.fromEntries(
    STAGE_ORDER.map((s) => [s, cases.filter((c) => c.stage === s).length])
  ) as Record<CaseStage, number>;

  const pipelineAmount = open.reduce((sum, c) => sum + c.amount, 0);
  const weightedPipeline = open.reduce(
    (sum, c) => sum + c.amount * (c.successRate / 100),
    0
  );
  const avgSuccessRate =
    open.length === 0
      ? 0
      : Math.round(
          open.reduce((sum, c) => sum + c.successRate, 0) / open.length
        );

  const months: MonthForecast[] = [];
  const now = new Date();
  for (let i = 0; i < monthsAhead; i++) {
    const cursor = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}`;
    const label = `${cursor.getFullYear()}年${cursor.getMonth() + 1}月`;
    const monthCases = open.filter((c) =>
      c.targetClosingDate?.startsWith(key)
    );
    months.push({
      month: key,
      label,
      caseCount: monthCases.length,
      totalAmount: monthCases.reduce((s, c) => s + c.amount, 0),
      weightedAmount: monthCases.reduce(
        (s, c) => s + c.amount * (c.successRate / 100),
        0
      ),
      avgSuccessRate:
        monthCases.length === 0
          ? 0
          : Math.round(
              monthCases.reduce((s, c) => s + c.successRate, 0) /
                monthCases.length
            ),
      cases: monthCases.map((c) => ({
        id: c.id,
        customerName: c.customerName,
        amount: c.amount,
        successRate: c.successRate,
        stage: c.stage,
        targetClosingDate: c.targetClosingDate,
      })),
    });
  }

  return {
    openCases: open.length,
    closedCases: closed.length,
    pipelineAmount,
    weightedPipeline,
    avgSuccessRate,
    byStage,
    months,
  };
}

function clampRate(n: number): number {
  return Math.max(0, Math.min(100, Math.round(Number(n) || 0)));
}

function defaultRate(stage?: CaseStage): number {
  switch (stage) {
    case "first_interview":
      return 25;
    case "quotation":
      return 40;
    case "follow_up":
      return 50;
    case "final_stage":
      return 70;
    case "confirmation":
      return 90;
    case "closed":
      return 0;
    default:
      return 30;
  }
}

function defaultClosingDate(): string {
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  return d.toISOString().slice(0, 10);
}
