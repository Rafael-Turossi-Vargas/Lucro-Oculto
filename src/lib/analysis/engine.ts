import type { Prisma } from "@prisma/client"
import Anthropic from "@anthropic-ai/sdk"
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

type AILeak = {
  title: string
  description: string
  category: string
  impact: "high" | "medium" | "low"
  amount: number
}

type AIOpportunity = {
  title: string
  description: string
  savingsEstimate: number
  impact: "high" | "medium" | "low"
  urgency: "immediate" | "soon" | "monitor"
}

type AIAlert = {
  type: string
  severity: "critical" | "warning" | "info"
  title: string
  message: string
  amount: number
}

type AIRecommendation = {
  title: string
  description: string
  urgency: "immediate" | "soon" | "monitor"
  difficulty: "easy" | "medium" | "hard"
  savingsEstimate: number
  impact: "high" | "medium" | "low"
  category: string
  priority: number
}

type AIAnalysisResult = {
  leaks: AILeak[]
  opportunities: AIOpportunity[]
  alerts: AIAlert[]
  recommendations: AIRecommendation[]
  aiUnavailable?: boolean
}

async function analyzeWithAI(
  transactions: EnrichedTransaction[],
  orgName: string,
  niche: string | null
): Promise<AIAnalysisResult> {
  const empty: AIAnalysisResult = { leaks: [], opportunities: [], alerts: [], recommendations: [] }

  if (!process.env.ANTHROPIC_API_KEY || transactions.length === 0) return empty

  try {
    // Sanitize user-supplied text to prevent prompt injection via transaction descriptions
    const sanitizeDesc = (s: string) =>
      s.replace(/[\n\r\t]/g, " ").replace(/[^\x20-\x7E\u00C0-\u024F]/g, "").slice(0, 120)

    // Pre-compute financial summary to enrich the prompt
    const expenses = transactions.filter((t) => t.amount < 0)
    const income = transactions.filter((t) => t.amount > 0)
    const totalExpenses = expenses.reduce((s, t) => s + Math.abs(t.amount), 0)
    const totalIncome = income.reduce((s, t) => s + t.amount, 0)
    const netResult = totalIncome - totalExpenses

    // Top vendors by spend
    const vendorMap = new Map<string, { total: number; count: number; dates: string[] }>()
    for (const t of expenses) {
      const key = t.vendor || t.description.slice(0, 50)
      const cur = vendorMap.get(key) ?? { total: 0, count: 0, dates: [] }
      vendorMap.set(key, {
        total: cur.total + Math.abs(t.amount),
        count: cur.count + 1,
        dates: [...cur.dates, t.date.slice(0, 10)].slice(-5),
      })
    }
    const topVendors = [...vendorMap.entries()]
      .sort((a, b) => b[1].total - a[1].total)
      .slice(0, 20)
      .map(([v, d]) => `  • ${sanitizeDesc(v)}: R$ ${d.total.toFixed(2)} (${d.count}x) — datas: ${d.dates.join(", ")}`)
      .join("\n")

    // Category totals
    const catMap = new Map<string, number>()
    for (const t of expenses) {
      catMap.set(t.categorySlug, (catMap.get(t.categorySlug) ?? 0) + Math.abs(t.amount))
    }
    const catSummary = [...catMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([c, v]) => `  • ${c}: R$ ${v.toFixed(2)} (${totalExpenses > 0 ? ((v / totalExpenses) * 100).toFixed(1) : 0}%)`)
      .join("\n")

    // Date range
    const sortedDates = transactions
      .map((t) => new Date(t.date))
      .sort((a, b) => a.getTime() - b.getTime())
    const periodStart = sortedDates[0]?.toLocaleDateString("pt-BR") ?? "?"
    const periodEnd = sortedDates[sortedDates.length - 1]?.toLocaleDateString("pt-BR") ?? "?"
    const periodDays =
      sortedDates.length > 1
        ? Math.ceil((sortedDates[sortedDates.length - 1].getTime() - sortedDates[0].getTime()) / 86400000)
        : 1

    // All individual transactions (send all if ≤500, otherwise top vendors + sample)
    let transactionList: string
    if (transactions.length <= 500) {
      transactionList = transactions
        .map((t) => `${t.date.slice(0, 10)} | ${sanitizeDesc(t.description)} | ${t.amount >= 0 ? "+" : ""}${t.amount.toFixed(2)}`)
        .join("\n")
    } else {
      transactionList =
        `[RESUMO — ${transactions.length} transações — exibindo top 150 por valor]\n` +
        [...transactions]
          .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount))
          .slice(0, 150)
          .map((t) => `${t.date.slice(0, 10)} | ${sanitizeDesc(t.description)} | ${t.amount >= 0 ? "+" : ""}${t.amount.toFixed(2)}`)
          .join("\n")
    }

    const prompt = `Você é um CFO sênior com 20 anos de experiência em diagnóstico financeiro para PMEs brasileiras. Sua análise deve ser precisa, baseada em dados reais e extremamente útil para o gestor tomar decisões.

═══════════════════════════════════════════
DADOS DA EMPRESA
═══════════════════════════════════════════
Empresa: ${orgName}${niche ? ` | Setor: ${niche}` : ""}
Período analisado: ${periodStart} a ${periodEnd} (${periodDays} dias)
Total de transações: ${transactions.length}

RESUMO FINANCEIRO:
  • Total despesas:  R$ ${totalExpenses.toFixed(2)}
  • Total receitas:  R$ ${totalIncome.toFixed(2)}
  • Resultado líquido: R$ ${netResult.toFixed(2)} ${netResult < 0 ? "⚠️ DÉFICIT" : "✓ superávit"}
  • Média diária de gastos: R$ ${(totalExpenses / periodDays).toFixed(2)}

MAIORES FORNECEDORES / BENEFICIÁRIOS (despesas):
${topVendors || "  (nenhum)"}

GASTOS POR CATEGORIA:
${catSummary || "  (nenhum)"}

═══════════════════════════════════════════
TODAS AS TRANSAÇÕES (DATA | DESCRIÇÃO | VALOR)
═══════════════════════════════════════════
${transactionList}

═══════════════════════════════════════════
INSTRUÇÕES DE ANÁLISE
═══════════════════════════════════════════
Analise CADA transação individualmente e com atenção ao contexto. Seja específico: cite valores reais, nomes de fornecedores e datas quando relevante.

Identifique obrigatoriamente:

1. VAZAMENTOS FINANCEIROS (leaks):
   - Gastos recorrentes desnecessários (apostas, jogos, entretenimento excessivo)
   - Cobranças duplicadas (mesmo valor, mesmo fornecedor em datas próximas)
   - Assinaturas que aparecem 1x apenas (possivelmente esquecidas)
   - Transferências para pessoas físicas sem padrão claro
   - Gastos que comprometem > 15% da receita em categoria única
   - Compras impulsivas ou fora do padrão do negócio

2. OPORTUNIDADES DE ECONOMIA (opportunities):
   - Fornecedores com alta recorrência onde é possível negociar desconto
   - Categorias com potencial de redução (ex: alimentação, entretenimento)
   - Consolidação de gastos fragmentados
   - Substituição por alternativas mais econômicas
   - Automatização de pagamentos para evitar juros/multas

3. ALERTAS CRÍTICOS (alerts):
   - Déficit de caixa (despesas > receitas)
   - Concentração excessiva em único fornecedor (> 25% das despesas)
   - Padrão suspeito de apostas/jogos de azar
   - Saldo negativo recorrente
   - Transferências grandes sem identificação clara

4. PLANO DE AÇÃO PRIORITÁRIO (recommendations):
   - Ações concretas com passo a passo
   - Ordenadas por impacto financeiro e urgência
   - Com estimativa realista de economia

REGRAS:
- Seja ESPECÍFICO: cite "SUPREMA BET LTDA gastou R$ X em Y ocasiões" e não apenas "apostas"
- Calcule valores REAIS baseados nos dados
- Descrições devem ter pelo menos 2 frases detalhadas
- Recomendações devem ter passos acionáveis
- Não invente dados que não estão nas transações

Responda SOMENTE com JSON válido (sem markdown, sem texto extra):
{
  "leaks": [
    {
      "title": "Título claro e específico (máx 60 chars)",
      "description": "Descrição detalhada citando fornecedores, valores e frequência. Mínimo 2 frases com dados concretos.",
      "category": "ferramentas_software|marketing|pessoal|operacional|fornecedores|financeiro|impostos|administrativo|logistica|outros",
      "impact": "high|medium|low",
      "amount": 0
    }
  ],
  "opportunities": [
    {
      "title": "Título da oportunidade (máx 60 chars)",
      "description": "Explicação detalhada: como economizar, com quem negociar, qual alternativa usar. Cite valores e percentuais.",
      "savingsEstimate": 0,
      "impact": "high|medium|low",
      "urgency": "immediate|soon|monitor"
    }
  ],
  "alerts": [
    {
      "type": "cash_deficit|gambling|duplicate_charge|concentration|unknown_transfer|overdraft|other",
      "severity": "critical|warning|info",
      "title": "Título do alerta",
      "message": "Mensagem de alerta detalhada com dados específicos: valores, fornecedores, datas. Explique o risco claramente.",
      "amount": 0
    }
  ],
  "recommendations": [
    {
      "title": "Ação recomendada (máx 60 chars)",
      "description": "Passo a passo detalhado: o que fazer, como fazer, quando fazer. Seja específico e acionável.",
      "urgency": "immediate|soon|monitor",
      "difficulty": "easy|medium|hard",
      "savingsEstimate": 0,
      "impact": "high|medium|low",
      "category": "ferramentas_software|marketing|pessoal|operacional|fornecedores|financeiro|impostos|administrativo|logistica|outros",
      "priority": 1
    }
  ]
}`

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 8096,
      messages: [{ role: "user", content: prompt }],
    })

    const raw = response.content.find((b) => b.type === "text")?.text ?? "{}"
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return empty

    const parsed = JSON.parse(jsonMatch[0]) as Partial<AIAnalysisResult>
    return {
      leaks: Array.isArray(parsed.leaks) ? parsed.leaks : [],
      opportunities: Array.isArray(parsed.opportunities) ? parsed.opportunities : [],
      alerts: Array.isArray(parsed.alerts) ? parsed.alerts : [],
      recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
    }
  } catch (err) {
    console.error("AI analysis error:", err)
    return { ...empty, aiUnavailable: true }
  }
}

async function _runAnalysisPipeline(
  enriched: EnrichedTransaction[],
  organizationId: string,
  analysisId: string
): Promise<void> {
  try {
    const organization = await db.organization.findUnique({
      where: { id: organizationId },
      select: { name: true, niche: true },
    })

    const [
      subscriptions,
      anomalies,
      duplicates,
      concentration,
      cashflow,
      aiResult,
    ] = await Promise.all([
      Promise.resolve(detectSubscriptions(enriched)),
      Promise.resolve(detectAnomalies(enriched)),
      Promise.resolve(detectDuplicates(enriched)),
      Promise.resolve(detectConcentration(enriched)),
      Promise.resolve(analyzeCashflow(enriched)),
      analyzeWithAI(enriched, organization?.name ?? "Empresa", organization?.niche ?? null),
    ])

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

    // Merge AI insights with rule-based (AI supplements, not duplicates)
    const allLeaks = [...insights.leaks, ...aiResult.leaks]
    const allOpportunities = [...insights.opportunities, ...aiResult.opportunities]
    const baseAlerts = [...insights.alerts, ...aiResult.alerts]

    // If AI was unavailable, add an info alert so user knows detailed analysis is partial
    if (aiResult.aiUnavailable) {
      baseAlerts.push({
        type: "other",
        severity: "info",
        title: "Análise por IA temporariamente indisponível",
        message: "A análise detalhada por inteligência artificial não pôde ser concluída neste momento. O score e os insights exibidos são baseados na análise automática de padrões. Tente gerar uma nova análise em alguns minutos.",
        amount: 0,
      })
    }

    const allAlerts = baseAlerts
    // Merge recommendations: AI gets priority numbers starting after rule-based ones
    const ruleRecCount = insights.actions.length
    const aiRecs = aiResult.recommendations.map((r, i) => ({
      ...r,
      priority: ruleRecCount + i + 1,
    }))
    const allActions = [...insights.actions, ...aiRecs]

    const savingsMin = allOpportunities.reduce(
      (sum, opportunity) => sum + opportunity.savingsEstimate * 0.5,
      0
    )

    const savingsMax = allOpportunities.reduce(
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
          ...allLeaks.map((leak) => ({
            analysisId,
            type: "leak",
            category: leak.category,
            title: leak.title,
            description: leak.description,
            impact: leak.impact,
            amount: leak.amount,
            metadata: toJsonValue(leak),
          })),
          ...allOpportunities.map((opportunity) => ({
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
        data: allAlerts.map((alert) => ({
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
        data: allActions.map((action) => ({
          organizationId,
          analysisId,
          title: action.title,
          description: action.description,
          rationale: "rationale" in action ? (action as { rationale?: string }).rationale : undefined,
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
      .update({ where: { id: analysisId }, data: { status: "error" } })
      .catch(() => undefined)
    throw error
  }
}

export async function runAnalysis(
  rawTransactions: RawTransaction[],
  organizationId: string,
  uploadId: string,
  analysisId: string
): Promise<void> {
  await db.analysis.update({ where: { id: analysisId }, data: { status: "running" } })

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

  await _runAnalysisPipeline(enriched, organizationId, analysisId)
}

/**
 * Runs analysis for a bank sync upload where transactions are already in the DB.
 * Reads existing transactions, enriches them in memory, and runs the full pipeline
 * without re-inserting into the database.
 */
export async function runAnalysisFromUpload(
  uploadId: string,
  organizationId: string,
  analysisId: string
): Promise<void> {
  await db.analysis.update({ where: { id: analysisId }, data: { status: "running" } })

  const dbTxs = await db.transaction.findMany({
    where: { uploadId, organizationId },
  })

  if (dbTxs.length === 0) {
    await db.analysis.update({
      where: { id: analysisId },
      data: { status: "done", totalExpenses: 0, totalIncome: 0, netResult: 0, score: 50, completedAt: new Date() },
    })
    return
  }

  const enriched: EnrichedTransaction[] = dbTxs.map((tx) => ({
    id: tx.id,
    date: tx.date.toISOString(),
    description: tx.description,
    amount: Number(tx.amount),
    // Re-apply our categorizer for consistent internal slugs
    categorySlug: categorizeTransaction(tx.description),
    vendor: tx.vendor ?? extractVendor(tx.description),
  }))

  await _runAnalysisPipeline(enriched, organizationId, analysisId)
}

/**
 * Runs a consolidated analysis across ALL bank transactions for the org.
 * Used after each bank sync so the resulting analysis reflects the complete
 * financial picture from all connected bank accounts, not just one upload.
 */
export async function runConsolidatedBankAnalysis(
  _uploadId: string,
  organizationId: string,
  analysisId: string
): Promise<void> {
  await db.analysis.update({ where: { id: analysisId }, data: { status: "running" } })

  // Read ALL transactions for this org (bank syncs + manual uploads) for a complete picture
  const dbTxs = await db.transaction.findMany({
    where: { organizationId },
    orderBy: { date: "asc" },
  })

  if (dbTxs.length === 0) {
    await db.analysis.update({
      where: { id: analysisId },
      data: { status: "done", totalExpenses: 0, totalIncome: 0, netResult: 0, score: 50, completedAt: new Date() },
    })
    return
  }

  const enriched: EnrichedTransaction[] = dbTxs.map((tx) => ({
    id: tx.id,
    date: tx.date.toISOString(),
    description: tx.description,
    amount: Number(tx.amount),
    categorySlug: categorizeTransaction(tx.description),
    vendor: tx.vendor ?? extractVendor(tx.description),
  }))

  await _runAnalysisPipeline(enriched, organizationId, analysisId)
}