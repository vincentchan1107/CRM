export type CaseStage =
  | "first_interview"
  | "quotation"
  | "follow_up"
  | "final_stage"
  | "confirmation"
  | "closed";

export type CloseReason = "disqualified" | "failed" | null;

export interface Case {
  id: string;
  customerName: string;
  partner: string;
  systems: string[];
  requirements: string;
  quantity: string;
  budget: number;
  amount: number;
  successRate: number;
  targetClosingDate: string;
  stage: CaseStage;
  closeReason: CloseReason;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface CaseInput {
  customerName: string;
  partner?: string;
  systems?: string[];
  requirements?: string;
  quantity?: string;
  budget?: number;
  amount?: number;
  successRate?: number;
  targetClosingDate?: string;
  stage?: CaseStage;
  closeReason?: CloseReason;
  notes?: string;
}

export interface VoiceParseResult {
  customerName?: string;
  partner?: string;
  systems?: string[];
  requirements?: string;
  quantity?: string;
  budget?: number;
  transcript: string;
}

export interface MonthForecast {
  month: string;
  label: string;
  caseCount: number;
  totalAmount: number;
  weightedAmount: number;
  avgSuccessRate: number;
  cases: Pick<Case, "id" | "customerName" | "amount" | "successRate" | "stage" | "targetClosingDate">[];
}

export interface DashboardStats {
  openCases: number;
  closedCases: number;
  pipelineAmount: number;
  weightedPipeline: number;
  avgSuccessRate: number;
  byStage: Record<CaseStage, number>;
  months: MonthForecast[];
}
