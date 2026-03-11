/* ─── Primitive Types ───────────────────────────────────────────────────────── */
export type InsightType = "leak" | "opportunity" | "alert" | "action"
export type Impact = "high" | "medium" | "low"
export type Urgency = "immediate" | "soon" | "monitor"
export type Difficulty = "easy" | "medium" | "hard"
export type LeakType =
  | "subscription"
  | "overlap"
  | "anomaly"
  | "duplicate"
  | "concentration"
export type AlertSeverity = "critical" | "warning" | "info"
export type ItemStatus = "pending" | "in_progress" | "done" | "skipped"
export type OpportunityStatus = "open" | "in_progress" | "done" | "skipped"

/* ─── Transaction ───────────────────────────────────────────────────────────── */
export interface Transaction {
  id: string
  date: Date
  description: string
  /** Positive = income, negative = expense */
  amount: number
  categorySlug?: string
  vendor?: string
  isRecurring: boolean
  recurrenceType?: "monthly" | "weekly" | "annual" | "irregular"
  tags?: string[]
  originalDescription?: string
  source?: string
}

/* ─── Leak ──────────────────────────────────────────────────────────────────── */
export interface Leak {
  id: string
  type: LeakType
  title: string
  description: string
  impact: Impact
  /** Total financial impact (absolute value) */
  amount: number
  category?: string
  /** IDs of related transactions */
  transactions?: string[]
  /** Additional structured data about the leak */
  metadata?: Record<string, unknown>
}

/* ─── Opportunity ───────────────────────────────────────────────────────────── */
export interface Opportunity {
  id: string
  title: string
  description: string
  /** Recommended action to capture this opportunity */
  action: string
  impact: Impact
  urgency: Urgency
  /** Estimated monthly savings in BRL */
  savingsEstimate: number
  category?: string
  difficulty: Difficulty
  status: OpportunityStatus
}

/* ─── Alert ─────────────────────────────────────────────────────────────────── */
export interface AnalysisAlert {
  id: string
  type: string
  severity: AlertSeverity
  title: string
  message: string
  /** Optional monetary amount associated with the alert */
  amount?: number
}

/* ─── Action Item ───────────────────────────────────────────────────────────── */
export interface ActionItem {
  id: string
  title: string
  description: string
  /** Why this action is important */
  rationale: string
  impact: Impact
  urgency: Urgency
  difficulty: Difficulty
  /** Estimated monthly savings in BRL */
  savingsEstimate: number
  category: string
  status: ItemStatus
  /** Lower = higher priority */
  priority: number
}

/* ─── Subscores ─────────────────────────────────────────────────────────────── */
export interface Subscores {
  /** Score for subscription health (0–100) */
  subscriptions: number
  /** Score for vendor concentration (0–100) */
  vendors: number
  /** Score for recurring expenses ratio (0–100) */
  recurring: number
  /** Score for expense concentration risk (0–100) */
  concentration: number
  /** Score for cash flow consistency (0–100) */
  cashflow: number
}

/* ─── Category Breakdown ────────────────────────────────────────────────────── */
export interface CategoryBreakdown {
  category: string
  amount: number
  percentage: number
  count: number
  trend?: "up" | "down" | "stable"
}

/* ─── Monthly Trend ─────────────────────────────────────────────────────────── */
export interface MonthlyTrend {
  month: string
  amount: number
  income?: number
  expenses?: number
}

/* ─── Top Vendor ────────────────────────────────────────────────────────────── */
export interface TopVendor {
  vendor: string
  amount: number
  count: number
  percentage?: number
  categorySlug?: string
  isRecurring?: boolean
}

/* ─── Analysis Result ───────────────────────────────────────────────────────── */
export interface AnalysisResult {
  /** Overall financial health score (0–100) */
  score: number
  subscores: Subscores
  /** Total expenses in the period */
  totalExpenses: number
  /** Total income in the period */
  totalIncome: number
  /** Net result (income - expenses) */
  netResult: number
  periodStart: Date
  periodEnd: Date
  leaks: Leak[]
  opportunities: Opportunity[]
  alerts: AnalysisAlert[]
  actions: ActionItem[]
  /** Conservative savings estimate (BRL/month) */
  savingsMin: number
  /** Optimistic savings estimate (BRL/month) */
  savingsMax: number
  categoryBreakdown: CategoryBreakdown[]
  monthlyTrend: MonthlyTrend[]
  topVendors: TopVendor[]
  /** ISO timestamp of when analysis was created */
  createdAt?: string
  /** Analysis version/algorithm identifier */
  version?: string
}

/* ─── Analysis Summary (lighter version for lists) ─────────────────────────── */
export interface AnalysisSummary {
  id: string
  score: number
  totalExpenses: number
  totalIncome: number
  netResult: number
  periodStart: Date
  periodEnd: Date
  leaksCount: number
  savingsMin: number
  savingsMax: number
  createdAt: Date
}

/* ─── Analysis Request ──────────────────────────────────────────────────────── */
export interface AnalysisRequest {
  uploadId: string
  companyId: string
  nicheSlug?: string
  options?: {
    includeAI?: boolean
    includeBenchmarks?: boolean
    period?: {
      start: Date
      end: Date
    }
  }
}

/* ─── Score Breakdown ───────────────────────────────────────────────────────── */
export interface ScoreBreakdown {
  total: number
  subscores: Subscores
  details: {
    label: string
    score: number
    maxScore: number
    description: string
  }[]
}
