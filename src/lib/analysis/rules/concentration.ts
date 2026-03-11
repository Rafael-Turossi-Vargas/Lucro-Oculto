import { categorizeTransaction, extractVendor } from "../categorizer"
import type { RawTransaction } from "@/types/transactions"

export interface ConcentrationItem {
  name: string
  amount: number
  percentage: number
  isAlert: boolean
}

export interface ConcentrationAlert {
  type: "category" | "vendor"
  name: string
  percentage: number
  amount: number
}

export interface ConcentrationResult {
  categoryConcentration: ConcentrationItem[]
  vendorConcentration: ConcentrationItem[]
  alerts: ConcentrationAlert[]
}

export function detectConcentration(transactions: Array<RawTransaction>): ConcentrationResult {
  const expenses = transactions.filter((t) => (t.amount as number) < 0)
  if (expenses.length === 0) {
    return { categoryConcentration: [], vendorConcentration: [], alerts: [] }
  }

  const total = expenses.reduce((s, t) => s + Math.abs(t.amount as number), 0)

  // By category
  const catMap = new Map<string, number>()
  for (const t of expenses) {
    const cat = categorizeTransaction(t.description)
    catMap.set(cat, (catMap.get(cat) ?? 0) + Math.abs(t.amount as number))
  }

  // By vendor
  const vendorMap = new Map<string, number>()
  for (const t of expenses) {
    const vendor = extractVendor(t.description)
    if (!vendor || vendor.length < 3) continue
    vendorMap.set(vendor, (vendorMap.get(vendor) ?? 0) + Math.abs(t.amount as number))
  }

  const CATEGORY_THRESHOLD = 0.35
  const VENDOR_THRESHOLD = 0.20

  const categoryConcentration: ConcentrationItem[] = [...catMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([name, amount]) => {
      const pct = total > 0 ? amount / total : 0
      return { name, amount, percentage: Math.round(pct * 100), isAlert: pct > CATEGORY_THRESHOLD }
    })

  const vendorConcentration: ConcentrationItem[] = [...vendorMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([name, amount]) => {
      const pct = total > 0 ? amount / total : 0
      return { name, amount, percentage: Math.round(pct * 100), isAlert: pct > VENDOR_THRESHOLD }
    })

  const alerts: ConcentrationAlert[] = [
    ...categoryConcentration
      .filter((c) => c.isAlert)
      .map((c) => ({ type: "category" as const, name: c.name, percentage: c.percentage, amount: c.amount })),
    ...vendorConcentration
      .filter((v) => v.isAlert)
      .map((v) => ({ type: "vendor" as const, name: v.name, percentage: v.percentage, amount: v.amount })),
  ]

  return { categoryConcentration, vendorConcentration, alerts }
}
