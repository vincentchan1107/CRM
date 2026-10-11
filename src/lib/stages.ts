import type { CaseStage, CloseReason } from "./types";

export const STAGE_ORDER: CaseStage[] = [
  "first_interview",
  "quotation",
  "follow_up",
  "final_stage",
  "confirmation",
  "closed",
];

export const STAGE_META: Record<
  CaseStage,
  { label: string; short: string; color: string; bg: string; description: string }
> = {
  first_interview: {
    label: "首次會見",
    short: "會見",
    color: "#0f766e",
    bg: "#ccfbf1",
    description: "第一次見客、了解需求",
  },
  quotation: {
    label: "報價",
    short: "報價",
    color: "#1d4ed8",
    bg: "#dbeafe",
    description: "提交報價／方案",
  },
  follow_up: {
    label: "跟進",
    short: "跟進",
    color: "#b45309",
    bg: "#fef3c7",
    description: "報價後持續跟進",
  },
  final_stage: {
    label: "最終階段",
    short: "最終",
    color: "#7c2d12",
    bg: "#ffedd5",
    description: "接近簽單的最後磋商",
  },
  confirmation: {
    label: "確認簽單",
    short: "確認",
    color: "#15803d",
    bg: "#dcfce7",
    description: "客戶確認、準備成交",
  },
  closed: {
    label: "已關閉",
    short: "關閉",
    color: "#64748b",
    bg: "#e2e8f0",
    description: "Disqualify 或失敗關閉",
  },
};

export const CLOSE_REASON_META: Record<
  Exclude<CloseReason, null>,
  { label: string; color: string }
> = {
  disqualified: { label: "Disqualified", color: "#64748b" },
  failed: { label: "失敗", color: "#dc2626" },
};

export const SYSTEM_OPTIONS = [
  "HRM",
  "ERP",
  "CRM",
  "WORKFLOW",
  "PMS",
  "PPMS",
  "SCM",
  "BI",
  "其他",
];

export const PARTNER_OPTIONS = [
  "直銷",
  "Partner A",
  "Partner B",
  "Partner C",
  "轉介",
  "活動／展覽",
  "其他",
];
