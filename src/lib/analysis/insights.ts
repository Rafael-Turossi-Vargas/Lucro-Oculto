import type { Leak, Opportunity, AnalysisAlert, ActionItem } from "@/types/analysis"
import type { SubscriptionsResult } from "./rules/subscriptions"
import type { AnomaliesResult } from "./rules/anomalies"
import type { DuplicatesResult } from "./rules/duplicates"
import type { ConcentrationResult } from "./rules/concentration"
import type { CashflowResult } from "./rules/cashflow"

const CATEGORY_LABELS: Record<string, string> = {
  ferramentas_software: "Ferramentas e Software",
  marketing: "Marketing",
  pessoal: "Pessoal",
  operacional: "Operacional",
  fornecedores: "Fornecedores",
  financeiro: "Financeiro",
  impostos: "Impostos",
  administrativo: "Administrativo",
  logistica: "Logística",
  outros: "Outros",
}

function catLabel(slug: string) {
  return CATEGORY_LABELS[slug] ?? slug
}

export function generateInsights(data: {
  subscriptions: SubscriptionsResult
  anomalies: AnomaliesResult
  duplicates: DuplicatesResult
  concentration: ConcentrationResult
  cashflow: CashflowResult
}): { leaks: Leak[]; opportunities: Opportunity[]; alerts: AnalysisAlert[]; actions: ActionItem[] } {
  const leaks: Leak[] = []
  const opportunities: Opportunity[] = []
  const alerts: AnalysisAlert[] = []
  const actions: ActionItem[] = []
  let idxL = 0, idxO = 0, idxA = 0, idxAc = 0

  // ─── Subscriptions ─────────────────────────────────────────────────────────

  for (const sub of data.subscriptions.possiblyUnused) {
    leaks.push({
      id: `leak_${idxL++}`,
      type: "subscription",
      title: `Assinatura possivelmente subutilizada`,
      description: `"${sub.description.substring(0, 50)}" apareceu poucas vezes e pode não estar sendo usada.`,
      impact: sub.monthlyAmount > 200 ? "high" : sub.monthlyAmount > 50 ? "medium" : "low",
      amount: sub.monthlyAmount,
      category: "ferramentas_software",
    })
    opportunities.push({
      id: `op_${idxO++}`,
      title: `Cancelar ou revisar "${sub.description.substring(0, 30)}"`,
      description: `Esta assinatura parece subutilizada. Cancele ou verifique se ainda há valor.`,
      action: "Acesse a ferramenta, verifique o uso e cancele se não houver utilização nos últimos 30 dias.",
      impact: "medium",
      urgency: "soon",
      savingsEstimate: sub.monthlyAmount,
      category: "ferramentas_software",
      difficulty: "easy",
      status: "open",
    })
  }

  for (const group of data.subscriptions.overlapping) {
    const total = group.totalMonthly
    leaks.push({
      id: `leak_${idxL++}`,
      type: "overlap",
      title: `Ferramentas sobrepostas: ${group.category}`,
      description: `Você paga por ${group.subscriptions.length} ferramentas com funções similares de "${group.category}". Total: R$ ${total.toFixed(2)}/mês.`,
      impact: total > 300 ? "high" : "medium",
      amount: total,
      category: "ferramentas_software",
    })
    const savings = total * 0.5
    opportunities.push({
      id: `op_${idxO++}`,
      title: `Consolidar ferramentas de ${group.category}`,
      description: `Unifique em uma só ferramenta de ${group.category} e elimine o restante.`,
      action: "Avalie qual ferramenta tem mais valor e cancele as demais.",
      impact: "high",
      urgency: "immediate",
      savingsEstimate: savings,
      category: "ferramentas_software",
      difficulty: "medium",
      status: "open",
    })
    alerts.push({
      id: `alert_${idxA++}`,
      type: "subscription_overlap",
      severity: "warning",
      title: "Ferramentas com funções sobrepostas detectadas",
      message: `Você paga por ${group.subscriptions.length} ferramentas de "${group.category}" simultaneamente. Isso gera R$ ${total.toFixed(2)}/mês de custo desnecessário.`,
      amount: total,
    })
    actions.push({
      id: `ac_${idxAc++}`,
      title: "Consolidar ferramentas sobrepostas",
      description: `Escolher uma única ferramenta por categoria e cancelar as demais.`,
      rationale: `Ferramentas duplicadas desperdiçam ${total.toFixed(0)}/mês sem agregar valor adicional.`,
      impact: "high",
      urgency: "immediate",
      difficulty: "medium",
      savingsEstimate: savings,
      category: "ferramentas_software",
      status: "pending",
      priority: idxAc,
    })
  }

  // ─── Anomalies ─────────────────────────────────────────────────────────────

  for (const anomaly of data.anomalies.anomalies) {
    const label = catLabel(anomaly.category)
    leaks.push({
      id: `leak_${idxL++}`,
      type: "anomaly",
      title: `Crescimento anormal em ${label}`,
      description: `Gastos com ${label} cresceram ${anomaly.growthPercent}% no segundo período da análise. Custo extra estimado: R$ ${anomaly.extraMonthly.toFixed(2)}/mês.`,
      impact: anomaly.severity === "severe" ? "high" : "medium",
      amount: anomaly.extraMonthly,
      category: anomaly.category,
    })
    alerts.push({
      id: `alert_${idxA++}`,
      type: "cost_spike",
      severity: anomaly.severity === "severe" ? "critical" : "warning",
      title: `Custo com ${label} cresceu ${anomaly.growthPercent}%`,
      message: `Seus gastos com ${label} aumentaram ${anomaly.growthPercent}% em relação ao período anterior. Isso representa um custo extra de R$ ${anomaly.extraMonthly.toFixed(2)}/mês.`,
      amount: anomaly.extraMonthly,
    })
    actions.push({
      id: `ac_${idxAc++}`,
      title: `Investigar crescimento em ${label}`,
      description: `Revisar os gastos da categoria ${label} para identificar a causa do aumento.`,
      rationale: `Crescimento de ${anomaly.growthPercent}% não justificado pode representar desperdício.`,
      impact: anomaly.severity === "severe" ? "high" : "medium",
      urgency: anomaly.severity === "severe" ? "immediate" : "soon",
      difficulty: "easy",
      savingsEstimate: anomaly.extraMonthly,
      category: anomaly.category,
      status: "pending",
      priority: idxAc,
    })
  }

  // ─── Duplicates ────────────────────────────────────────────────────────────

  for (const dup of data.duplicates.duplicateGroups) {
    leaks.push({
      id: `leak_${idxL++}`,
      type: "duplicate",
      title: `Pagamento duplicado detectado`,
      description: `"${dup.description.substring(0, 50)}" foi pago mais de uma vez no mesmo período. Valor duplicado: R$ ${dup.totalDuplicated.toFixed(2)}.`,
      impact: "high",
      amount: dup.totalDuplicated,
    })
    alerts.push({
      id: `alert_${idxA++}`,
      type: "duplicate_payment",
      severity: "critical",
      title: "Possível pagamento duplicado",
      message: `Detectamos pagamentos iguais de R$ ${dup.amount.toFixed(2)} para "${dup.description.substring(0, 40)}" em datas próximas. Verifique se foi pago em dobro.`,
      amount: dup.totalDuplicated,
    })
    actions.push({
      id: `ac_${idxAc++}`,
      title: "Verificar e estornar pagamento duplicado",
      description: `Confirmar a duplicata de "${dup.description.substring(0, 40)}" e solicitar estorno se confirmado.`,
      rationale: `Estornar duplicatas pode recuperar imediatamente R$ ${dup.totalDuplicated.toFixed(2)}.`,
      impact: "high",
      urgency: "immediate",
      difficulty: "easy",
      savingsEstimate: dup.totalDuplicated,
      category: "financeiro",
      status: "pending",
      priority: idxAc,
    })
  }

  // ─── Concentration ─────────────────────────────────────────────────────────

  for (const alert of data.concentration.alerts) {
    if (alert.type === "category") {
      leaks.push({
        id: `leak_${idxL++}`,
        type: "concentration",
        title: `Concentração excessiva em ${catLabel(alert.name)}`,
        description: `${alert.percentage}% de todas as despesas estão concentradas em ${catLabel(alert.name)}. Alta dependência de uma categoria aumenta o risco financeiro.`,
        impact: "medium",
        amount: alert.amount,
        category: alert.name,
      })
    } else {
      alerts.push({
        id: `alert_${idxA++}`,
        type: "vendor_concentration",
        severity: "warning",
        title: `Alta dependência do fornecedor "${alert.name}"`,
        message: `${alert.percentage}% das suas despesas vão para um único fornecedor. Isso representa risco e pode indicar oportunidade de negociação.`,
        amount: alert.amount,
      })
      opportunities.push({
        id: `op_${idxO++}`,
        title: `Negociar com fornecedor "${alert.name}"`,
        description: `Este fornecedor representa ${alert.percentage}% das suas despesas. Alta concentração justifica renegociação de condições.`,
        action: "Agende uma reunião de renegociação e apresente a dependência como argumento para desconto.",
        impact: "medium",
        urgency: "soon",
        savingsEstimate: alert.amount * 0.1,
        difficulty: "medium",
        status: "open",
      })
    }
  }

  // ─── Cashflow ──────────────────────────────────────────────────────────────

  if (data.cashflow.cashPressureDays !== null) {
    alerts.push({
      id: `alert_${idxA++}`,
      type: "cash_pressure",
      severity: "critical",
      title: `Risco de pressão no caixa`,
      message: `Com base no padrão atual de receitas e despesas, seu caixa pode entrar em pressão em aproximadamente ${data.cashflow.cashPressureDays} dias.`,
      amount: data.cashflow.averageMonthlyExpenses - data.cashflow.averageMonthlyIncome,
    })
    actions.push({
      id: `ac_${idxAc++}`,
      title: "Revisar despesas para aliviar caixa",
      description: "Identificar despesas que podem ser adiadas ou eliminadas nos próximos 30 dias.",
      rationale: `Projeção indica pressão de caixa em ${data.cashflow.cashPressureDays} dias com o padrão atual.`,
      impact: "high",
      urgency: "immediate",
      difficulty: "medium",
      savingsEstimate: (data.cashflow.averageMonthlyExpenses - data.cashflow.averageMonthlyIncome) * 0.3,
      category: "operacional",
      status: "pending",
      priority: 0, // highest priority
    })
  }

  // Sort actions by priority (lower = higher priority)
  actions.sort((a, b) => {
    const urgencyOrder = { immediate: 0, soon: 1, monitor: 2 }
    const impactOrder = { high: 0, medium: 1, low: 2 }
    return (
      urgencyOrder[a.urgency] - urgencyOrder[b.urgency] ||
      impactOrder[a.impact] - impactOrder[b.impact] ||
      b.savingsEstimate - a.savingsEstimate
    )
  })
  actions.forEach((a, i) => (a.priority = i + 1))

  // Sort opportunities by savings
  opportunities.sort((a, b) => b.savingsEstimate - a.savingsEstimate)

  return { leaks, opportunities, alerts, actions }
}
