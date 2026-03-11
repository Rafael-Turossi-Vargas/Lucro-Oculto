import { categorizeTransaction } from "../categorizer"
import type { RawTransaction } from "@/types/transactions"

export interface Anomaly {
  category: string
  growthPercent: number
  severity: "moderate" | "severe"
  avgFirst: number
  avgSecond: number
  extraMonthly: number
}

export interface AnomaliesResult {
  anomalies: Anomaly[]
  riskCategories: string[]
}

export function detectAnomalies(transactions: Array<RawTransaction>): AnomaliesResult {
  const expenses = transactions.filter((t) => (t.amount as number) < 0)
  if (expenses.length < 4) return { anomalies: [], riskCategories: [] }

  // Sort by date
  const sorted = [...expenses].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const midpoint = Math.floor(sorted.length * 0.5)
  const firstHalf = sorted.slice(0, midpoint)
  const secondHalf = sorted.slice(midpoint)

  // Group by category
  const groupFirst = new Map<string, number[]>()
  const groupSecond = new Map<string, number[]>()

  for (const t of firstHalf) {
    const cat = categorizeTransaction(t.description)
    if (!groupFirst.has(cat)) groupFirst.set(cat, [])
    groupFirst.get(cat)!.push(Math.abs(t.amount as number))
  }
  for (const t of secondHalf) {
    const cat = categorizeTransaction(t.description)
    if (!groupSecond.has(cat)) groupSecond.set(cat, [])
    groupSecond.get(cat)!.push(Math.abs(t.amount as number))
  }

  const anomalies: Anomaly[] = []
  const IGNORE_CATEGORIES = ["impostos", "pessoal"] // expected to vary

  for (const [cat, firstAmounts] of groupFirst) {
    if (IGNORE_CATEGORIES.includes(cat)) continue
    const secondAmounts = groupSecond.get(cat)
    if (!secondAmounts || secondAmounts.length === 0) continue

    const avgFirst = firstAmounts.reduce((a, b) => a + b, 0) / firstAmounts.length
    const avgSecond = secondAmounts.reduce((a, b) => a + b, 0) / secondAmounts.length

    if (avgFirst === 0) continue
    const growth = (avgSecond - avgFirst) / avgFirst

    if (growth >= 0.5) {
      anomalies.push({
        category: cat,
        growthPercent: Math.round(growth * 100),
        severity: "severe",
        avgFirst,
        avgSecond,
        extraMonthly: avgSecond - avgFirst,
      })
    } else if (growth >= 0.2) {
      anomalies.push({
        category: cat,
        growthPercent: Math.round(growth * 100),
        severity: "moderate",
        avgFirst,
        avgSecond,
        extraMonthly: avgSecond - avgFirst,
      })
    }
  }

  const riskCategories = anomalies
    .filter((a) => a.severity === "severe")
    .map((a) => a.category)

  return { anomalies, riskCategories }
}
