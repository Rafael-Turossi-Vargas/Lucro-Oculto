import type { RawTransaction } from "@/types/transactions"

export interface MonthlyData {
  month: string
  income: number
  expenses: number
  net: number
}

export interface CashflowResult {
  averageMonthlyExpenses: number
  averageMonthlyIncome: number
  projectedBalance: number
  cashPressureDays: number | null
  monthlyTrend: MonthlyData[]
  cashflowScore: number
}

export function analyzeCashflow(transactions: Array<RawTransaction>): CashflowResult {
  if (transactions.length === 0) {
    return { averageMonthlyExpenses: 0, averageMonthlyIncome: 0, projectedBalance: 0, cashPressureDays: null, monthlyTrend: [], cashflowScore: 100 }
  }

  // Group by month
  const monthMap = new Map<string, { income: number; expenses: number }>()
  for (const t of transactions) {
    const d = new Date(t.date)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
    if (!monthMap.has(key)) monthMap.set(key, { income: 0, expenses: 0 })
    const entry = monthMap.get(key)!
    const amount = t.amount as number
    if (amount > 0) entry.income += amount
    else entry.expenses += Math.abs(amount)
  }

  const months = [...monthMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, data]) => ({
      month,
      income: data.income,
      expenses: data.expenses,
      net: data.income - data.expenses,
    }))

  const n = months.length || 1
  const avgExpenses = months.reduce((s, m) => s + m.expenses, 0) / n
  const avgIncome = months.reduce((s, m) => s + m.income, 0) / n

  const projectedBalance = avgIncome - avgExpenses
  const coverageRatio = avgIncome > 0 ? avgExpenses / avgIncome : 1

  let cashPressureDays: number | null = null
  if (coverageRatio > 0.9) {
    cashPressureDays = Math.max(5, Math.round(30 * (1 - coverageRatio) * 10))
  }

  // Score: 100 if expenses < 70% of income, degrade from there
  let cashflowScore = 100
  if (coverageRatio > 1) cashflowScore = 0
  else if (coverageRatio > 0.9) cashflowScore = Math.round((1 - coverageRatio) * 100 / 0.1 * 20)
  else if (coverageRatio > 0.7) cashflowScore = Math.round(50 + (0.9 - coverageRatio) / 0.2 * 50)
  cashflowScore = Math.max(0, Math.min(100, cashflowScore))

  return { averageMonthlyExpenses: avgExpenses, averageMonthlyIncome: avgIncome, projectedBalance, cashPressureDays, monthlyTrend: months, cashflowScore }
}
