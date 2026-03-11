import type { Subscores } from "@/types/analysis"
import type { SubscriptionsResult } from "./rules/subscriptions"
import type { AnomaliesResult } from "./rules/anomalies"
import type { DuplicatesResult } from "./rules/duplicates"
import type { ConcentrationResult } from "./rules/concentration"
import type { CashflowResult } from "./rules/cashflow"

export interface ScoreDeduction {
  reason: string
  points: number
}

export interface ScoreResult {
  total: number
  subscores: Subscores
  deductions: ScoreDeduction[]
}

export function calculateScore(data: {
  subscriptions: SubscriptionsResult
  anomalies: AnomaliesResult
  duplicates: DuplicatesResult
  concentration: ConcentrationResult
  cashflow: CashflowResult
}): ScoreResult {
  const deductions: ScoreDeduction[] = []

  let subscriptionsScore = 100
  const unusedPenalty = Math.min(
    20,
    data.subscriptions.possiblyUnused.length * 5
  )
  const overlapPenalty = Math.min(
    16,
    data.subscriptions.overlapping.length * 8
  )

  subscriptionsScore -= unusedPenalty + overlapPenalty

  if (unusedPenalty > 0) {
    deductions.push({
      reason: `${data.subscriptions.possiblyUnused.length} assinatura(s) subutilizada(s)`,
      points: unusedPenalty,
    })
  }

  if (overlapPenalty > 0) {
    deductions.push({
      reason: `${data.subscriptions.overlapping.length} sobreposição(ões) de ferramentas`,
      points: overlapPenalty,
    })
  }

  let recurringScore = 100
  let anomalyPenalty = 0

  for (const anomaly of data.anomalies.anomalies) {
    const points = anomaly.severity === "severe" ? 15 : 7
    anomalyPenalty += points
    deductions.push({
      reason: `Crescimento anormal em "${anomaly.category}" (+${anomaly.growthPercent}%)`,
      points,
    })
  }

  anomalyPenalty = Math.min(30, anomalyPenalty)
  recurringScore -= anomalyPenalty

  const duplicatePenalty = Math.min(
    30,
    data.duplicates.duplicateGroups.length * 15
  )

  if (duplicatePenalty > 0) {
    deductions.push({
      reason: `${data.duplicates.duplicateGroups.length} pagamento(s) duplicado(s)`,
      points: duplicatePenalty,
    })
  }

  let concentrationScore = 100
  const categoryConcentrationPenalty = Math.min(
    16,
    data.concentration.alerts.filter((alert) => alert.type === "category")
      .length * 8
  )
  const vendorConcentrationPenalty = Math.min(
    10,
    data.concentration.alerts.filter((alert) => alert.type === "vendor")
      .length * 5
  )

  concentrationScore -=
    categoryConcentrationPenalty + vendorConcentrationPenalty

  if (categoryConcentrationPenalty > 0) {
    deductions.push({
      reason: "Concentração excessiva em categorias de despesa",
      points: categoryConcentrationPenalty,
    })
  }

  if (vendorConcentrationPenalty > 0) {
    deductions.push({
      reason: "Dependência elevada de fornecedor único",
      points: vendorConcentrationPenalty,
    })
  }

  const cashflowScore = data.cashflow.cashflowScore
  const cashflowPenalty = Math.min(
    20,
    Math.round((100 - cashflowScore) * 0.2)
  )

  if (cashflowPenalty > 0) {
    deductions.push({
      reason: "Risco de pressão no caixa",
      points: cashflowPenalty,
    })
  }

  const vendorsScore = Math.max(0, 100 - vendorConcentrationPenalty * 3)

  const totalDeductions = deductions.reduce(
    (sum, deduction) => sum + deduction.points,
    0
  )

  const total = Math.max(0, Math.min(100, 100 - totalDeductions))

  return {
    total,
    subscores: {
      subscriptions: Math.max(0, Math.min(100, subscriptionsScore)),
      vendors: Math.max(0, Math.min(100, vendorsScore)),
      recurring: Math.max(0, Math.min(100, recurringScore)),
      concentration: Math.max(0, Math.min(100, concentrationScore)),
      cashflow: cashflowScore,
    },
    deductions,
  }
}