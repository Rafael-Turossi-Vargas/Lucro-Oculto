import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/* ─── Class Name Merge ──────────────────────────────────────────────────────── */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

/* ─── Currency Formatting ───────────────────────────────────────────────────── */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export function formatCurrencyCompact(value: number): string {
  if (Math.abs(value) >= 1_000_000) {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value)
  }
  if (Math.abs(value) >= 1_000) {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value)
  }
  return formatCurrency(value)
}

/* ─── Percent Formatting ────────────────────────────────────────────────────── */
export function formatPercent(value: number, decimals = 1): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "percent",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value / 100)
}

/* ─── Date Formatting ───────────────────────────────────────────────────────── */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "America/Sao_Paulo",
  }).format(d)
}

export function formatDateShort(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    timeZone: "America/Sao_Paulo",
  }).format(d)
}

export function formatDateFull(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "America/Sao_Paulo",
  }).format(d)
}

export function formatMonthYear(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  return new Intl.DateTimeFormat("pt-BR", {
    month: "short",
    year: "numeric",
    timeZone: "America/Sao_Paulo",
  }).format(d)
}

/* ─── Score Utilities ───────────────────────────────────────────────────────── */

/** Returns a Tailwind CSS color class based on score (0–100) */
export function getScoreColor(score: number): string {
  if (score <= 40) return "text-danger"
  if (score <= 70) return "text-warning"
  if (score <= 85) return "text-primary"
  return "text-primary"
}

/** Returns a Tailwind CSS background color class based on score (0–100) */
export function getScoreBgColor(score: number): string {
  if (score <= 40) return "bg-danger"
  if (score <= 70) return "bg-warning"
  return "bg-primary"
}

/** Returns hex color string based on score (0–100) */
export function getScoreHexColor(score: number): string {
  if (score <= 40) return "#FF4D4F"
  if (score <= 70) return "#F59E0B"
  return "#00D084"
}

/** Returns human-readable label based on score */
export function getScoreLabel(score: number): string {
  if (score <= 40) return "Crítico"
  if (score <= 60) return "Atenção"
  if (score <= 80) return "Bom"
  return "Excelente"
}

/* ─── Impact Utilities ──────────────────────────────────────────────────────── */
export function getImpactColor(impact: string): string {
  switch (impact.toLowerCase()) {
    case "high":
      return "text-danger"
    case "medium":
      return "text-warning"
    case "low":
      return "text-info"
    default:
      return "text-text-muted"
  }
}

export function getImpactBadgeVariant(
  impact: string
): "danger" | "warning" | "info" | "secondary" {
  switch (impact.toLowerCase()) {
    case "high":
      return "danger"
    case "medium":
      return "warning"
    case "low":
      return "info"
    default:
      return "secondary"
  }
}

export function getImpactLabel(impact: string): string {
  switch (impact.toLowerCase()) {
    case "high":
      return "Alto Impacto"
    case "medium":
      return "Médio Impacto"
    case "low":
      return "Baixo Impacto"
    default:
      return impact
  }
}

/* ─── Urgency Utilities ─────────────────────────────────────────────────────── */
export function getUrgencyLabel(urgency: string): string {
  switch (urgency.toLowerCase()) {
    case "immediate":
      return "Imediato"
    case "soon":
      return "Em breve"
    case "monitor":
      return "Monitorar"
    default:
      return urgency
  }
}

export function getUrgencyColor(urgency: string): string {
  switch (urgency.toLowerCase()) {
    case "immediate":
      return "text-danger"
    case "soon":
      return "text-warning"
    case "monitor":
      return "text-info"
    default:
      return "text-text-muted"
  }
}

/* ─── Difficulty Utilities ──────────────────────────────────────────────────── */
export function getDifficultyLabel(difficulty: string): string {
  switch (difficulty.toLowerCase()) {
    case "easy":
      return "Fácil"
    case "medium":
      return "Médio"
    case "hard":
      return "Difícil"
    default:
      return difficulty
  }
}

/* ─── String Utilities ──────────────────────────────────────────────────────── */
export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return text.slice(0, length - 3) + "..."
}

export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}

export function titleCase(text: string): string {
  return text
    .split(" ")
    .map((word) => capitalize(word))
    .join(" ")
}

export function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("")
}

/* ─── Savings Estimate ──────────────────────────────────────────────────────── */
interface LeakWithAmount {
  amount: number
  impact?: string
  [key: string]: unknown
}

export function calculateSavingsEstimate(leaks: LeakWithAmount[]): {
  min: number
  max: number
} {
  if (!leaks || leaks.length === 0) return { min: 0, max: 0 }

  const total = leaks.reduce((sum, leak) => {
    const amount = Math.abs(leak.amount ?? 0)
    return sum + amount
  }, 0)

  // Conservative estimate: 40–70% of identified leaks can be recovered
  const min = total * 0.4
  const max = total * 0.7

  return { min, max }
}

/* ─── Number Utilities ──────────────────────────────────────────────────────── */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

export function roundToDecimals(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals)
  return Math.round(value * factor) / factor
}

export function parseAmount(value: string | number): number {
  if (typeof value === "number") return value
  // Handle Brazilian number format: "1.234,56" → 1234.56
  const cleaned = value
    .replace(/\./g, "")
    .replace(",", ".")
    .replace(/[^\d.-]/g, "")
  return parseFloat(cleaned) || 0
}

/* ─── Array Utilities ───────────────────────────────────────────────────────── */
export function groupBy<T>(
  array: T[],
  key: keyof T | ((item: T) => string)
): Record<string, T[]> {
  return array.reduce(
    (groups, item) => {
      const group =
        typeof key === "function" ? key(item) : String(item[key])
      if (!groups[group]) groups[group] = []
      groups[group].push(item)
      return groups
    },
    {} as Record<string, T[]>
  )
}

export function sumBy<T>(array: T[], key: keyof T | ((item: T) => number)): number {
  return array.reduce((sum, item) => {
    const val = typeof key === "function" ? key(item) : Number(item[key])
    return sum + (isNaN(val) ? 0 : val)
  }, 0)
}

export function sortBy<T>(
  array: T[],
  key: keyof T | ((item: T) => number | string),
  direction: "asc" | "desc" = "asc"
): T[] {
  return [...array].sort((a, b) => {
    const va = typeof key === "function" ? key(a) : a[key]
    const vb = typeof key === "function" ? key(b) : b[key]
    if (va < vb) return direction === "asc" ? -1 : 1
    if (va > vb) return direction === "asc" ? 1 : -1
    return 0
  })
}

export function uniqueBy<T>(array: T[], key: keyof T | ((item: T) => string)): T[] {
  const seen = new Set<string>()
  return array.filter((item) => {
    const k = typeof key === "function" ? key(item) : String(item[key])
    if (seen.has(k)) return false
    seen.add(k)
    return true
  })
}

/* ─── Date Utilities ────────────────────────────────────────────────────────── */
export function daysBetween(start: Date, end: Date): number {
  const ms = Math.abs(end.getTime() - start.getTime())
  return Math.floor(ms / (1000 * 60 * 60 * 24))
}

export function isWithinDays(date: Date, days: number): boolean {
  const now = new Date()
  const diff = Math.abs(now.getTime() - date.getTime())
  return diff <= days * 24 * 60 * 60 * 1000
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

export function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0)
}

/* ─── Misc ──────────────────────────────────────────────────────────────────── */
export function generateId(): string {
  return Math.random().toString(36).slice(2, 11)
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
