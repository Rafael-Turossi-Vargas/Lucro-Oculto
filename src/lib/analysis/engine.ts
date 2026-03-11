import type { Prisma } from "@prisma/client"
import { db } from "@/lib/db"
import { sendAnalysisReadyEmail } from "@/lib/email/templates"
import type { RawTransaction } from "@/types/transactions"
import { categorizeTransaction, extractVendor, detectRecurrence } from "./categorizer"
import { detectSubscriptions } from "./rules/subscriptions"
import { detectAnomalies } from "./rules/anomalies"
import { detectDuplicates } from "./rules/duplicates"
import { detectConcentration } from "./rules/concentration"
import { analyzeCashflow } from "./rules/cashflow"
import { calculateScore } from "./score"
import { generateInsights } from "./insights"

function toJsonValue(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue
}

type EnrichedTransaction = RawTransaction & {
  id: string
  amount: number
  categorySlug: string
  vendor: string
}

export async function runAnalysis(
  rawTransactions: RawTransaction[],
  organizationId: string,
  uploadId: string,
  analysisId: string
): Promise<void> {
  try {
    await db.analysis.update({
      where: { id: analysisId },
      data: { status: "running" },
    })

    const enriched: EnrichedTransaction[] = rawTransactions.map((transaction, index) => ({
      ...transaction,
      id: `t_${index}`,
      amount:
        typeof transaction.amount === "string"
          ? Number(String(transaction.amount).replace(",", "."))
          : Number(transaction.amount),
      categorySlug: categorizeTransaction(transaction.description),
      vendor: extractVendor(transaction.description),
    }))

    const recurrence = detectRecurrence(enriched)
    const recurrenceMap = new Map(recurrence.map((item) => [item.id, item]))

    await db.transaction.createMany({
      data: enriched.map((transaction) => ({
        organizationId,
        uploadId,
        date: new Date(transaction.date),
        description: transaction.description,
        amount: transaction.amount,
        categorySlug: transaction.categorySlug,
        vendor: transaction.vendor,
        isRecurring: recurrenceMap.get(transaction.id)?.isRecurring ?? false,
        recurrenceType: recurrenceMap.get(transaction.id)?.recurrenceType,
        rawData: toJsonValue(transaction),
      })),
    })

    const subscriptions = detectSubscriptions(enriched)
    const anomalies = detectAnomalies(enriched)
    const duplicates = detectDuplicates(enriched)
    const concentration = detectConcentration(enriched)
    const cashflow = analyzeCashflow(enriched)

    const scoreResult = calculateScore({
      subscriptions,
      anomalies,
      duplicates,
      concentration,
      cashflow,
    })

    const insights = generateInsights({
      subscriptions,
      anomalies,
      duplicates,
      concentration,
      cashflow,
    })

    const totalExpenses = enriched
      .filter((transaction) => transaction.amount < 0)
      .reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0)

    const totalIncome = enriched
      .filter((transaction) => transaction.amount > 0)
      .reduce((sum, transaction) => sum + transaction.amount, 0)

    const netResult = totalIncome - totalExpenses

    const savingsMin = insights.opportunities.reduce(
      (sum, opportunity) => sum + opportunity.savingsEstimate * 0.5,
      0
    )

    const savingsMax = insights.opportunities.reduce(
      (sum, opportunity) => sum + opportunity.savingsEstimate,
      0
    )

    const dates = enriched
      .map((transaction) => new Date(transaction.date))
      .filter((date) => !Number.isNaN(date.getTime()))
      .sort((a, b) => a.getTime() - b.getTime())

    const periodStart = dates[0] ?? null
    const periodEnd = dates[dates.length - 1] ?? null

    const categoryMap = new Map<string, number>()
    for (const transaction of enriched.filter((t) => t.amount < 0)) {
      const current = categoryMap.get(transaction.categorySlug) ?? 0
      categoryMap.set(transaction.categorySlug, current + Math.abs(transaction.amount))
    }

    const categoryBreakdown = [...categoryMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100) : 0,
      }))

    const vendorMap = new Map<string, { amount: number; count: number }>()
    for (const transaction of enriched.filter((t) => t.amount < 0)) {
      const vendor = transaction.vendor || "Desconhecido"
      const current = vendorMap.get(vendor) ?? { amount: 0, count: 0 }

      vendorMap.set(vendor, {
        amount: current.amount + Math.abs(transaction.amount),
        count: current.count + 1,
      })
    }

    const topVendors = [...vendorMap.entries()]
      .sort((a, b) => b[1].amount - a[1].amount)
      .slice(0, 10)
      .map(([vendor, data]) => ({
        vendor,
        amount: data.amount,
        count: data.count,
      }))

    await Promise.all([
      db.analysis.update({
        where: { id: analysisId },
        data: {
          status: "done",
          totalExpenses,
          totalIncome,
          netResult,
          score: scoreResult.total,
          savingsMin,
          savingsMax,
          periodStart,
          periodEnd,
          summary: toJsonValue({
            categoryBreakdown,
            topVendors,
            monthlyTrend: cashflow.monthlyTrend,
          }),
          completedAt: new Date(),
        },
      }),

      db.insight.createMany({
        data: [
          ...insights.leaks.map((leak) => ({
            analysisId,
            type: "leak",
            category: leak.category,
            title: leak.title,
            description: leak.description,
            impact: leak.impact,
            amount: leak.amount,
            metadata: toJsonValue(leak),
          })),
          ...insights.opportunities.map((opportunity) => ({
            analysisId,
            type: "opportunity",
            title: opportunity.title,
            description: opportunity.description,
            impact: opportunity.impact,
            urgency: opportunity.urgency,
            amount: opportunity.savingsEstimate,
            metadata: toJsonValue(opportunity),
          })),
        ],
      }),

      db.alert.createMany({
        data: insights.alerts.map((alert) => ({
          organizationId,
          analysisId,
          type: alert.type,
          severity: alert.severity,
          title: alert.title,
          message: alert.message,
          amount: alert.amount,
        })),
      }),

      db.recommendation.createMany({
        data: insights.actions.map((action) => ({
          organizationId,
          analysisId,
          title: action.title,
          description: action.description,
          rationale: action.rationale,
          impact: action.impact,
          urgency: action.urgency,
          difficulty: action.difficulty,
          savingsEstimate: action.savingsEstimate,
          category: action.category,
          priority: action.priority,
        })),
      }),

      db.scoreSnapshot.create({
        data: {
          organizationId,
          analysisId,
          score: scoreResult.total,
          subscores: toJsonValue(scoreResult.subscores),
        },
      }),
    ])

    // Envia email de análise pronta para todos os membros da org (fire-and-forget)
    db.membership.findFirst({
      where: { organizationId, role: "owner" },
      include: { user: { select: { email: true, name: true } } },
    }).then(membership => {
      if (membership?.user?.email) {
        sendAnalysisReadyEmail(
          membership.user.email,
          membership.user.name ?? "usuário",
          analysisId,
          scoreResult.total,
          savingsMin,
          savingsMax
        ).catch(err => console.error("Failed to send analysis ready email:", err))
      }
    }).catch(() => undefined)
  } catch (error) {
    console.error("Analysis engine error:", error)

    await db.analysis
      .update({
        where: { id: analysisId },
        data: { status: "error" },
      })
      .catch(() => undefined)

    throw error
  }
}