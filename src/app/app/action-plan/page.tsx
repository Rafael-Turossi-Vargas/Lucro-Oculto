"use client"

import { useState } from "react"
import Link from "next/link"
import { CheckCircle, Circle, Clock, ChevronDown, ChevronUp, Upload, ClipboardList } from "lucide-react"
import { useAnalysisData } from "@/hooks/useAnalysisData"
import { CardSkeleton } from "@/components/ui/skeletons"
import { AccessGuard } from "@/components/auth/AccessGuard"

const IMPACT_COLOR: Record<string, string> = { high: "#FF4D4F", medium: "#F59E0B", low: "#8B8FA8" }
const URGENCY_LABEL: Record<string, string> = { immediate: "Imediato", soon: "Em breve", monitor: "Monitorar" }
const URGENCY_COLOR: Record<string, string> = { immediate: "#FF4D4F", soon: "#F59E0B", monitor: "#8B8FA8" }
const DIFF_LABEL: Record<string, string> = { easy: "Fácil", medium: "Médio", hard: "Difícil" }

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })
}

type ItemStatus = "pending" | "in_progress" | "done"

function ActionPlanContent() {
  const { data, loading } = useAnalysisData()
  const [statuses, setStatuses] = useState<Record<string, ItemStatus>>({})
  const [expanded, setExpanded] = useState<string | null>(null)

  const toggleStatus = (id: string) => {
    setStatuses((prev) => {
      const current = prev[id] ?? "pending"
      const next: ItemStatus = current === "pending" ? "in_progress" : current === "in_progress" ? "done" : "pending"
      return { ...prev, [id]: next }
    })
  }

  if (loading) {
    return (
      <div className="px-6 py-8 space-y-4">
        <CardSkeleton rows={5} />
        <CardSkeleton rows={3} />
      </div>
    )
  }

  if (!data?.analysis) {
    return (
      <div className="px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-black" style={{ color: "#F4F4F5" }}>Plano de ação</h1>
        </div>
        <div className="rounded-2xl p-12 text-center" style={{ background: "#1A1D27", border: "1px solid #2A2D3A" }}>
          <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.15)" }}>
            <ClipboardList className="w-8 h-8" style={{ color: "#3B82F6" }} />
          </div>
          <p className="text-base font-bold mb-1" style={{ color: "#F4F4F5" }}>Nenhum plano de ação gerado</p>
          <p className="text-sm mb-2" style={{ color: "#8B8FA8" }}>Faça upload do extrato bancário para receber um plano de ação personalizado.</p>
          <p className="text-xs mb-6 px-4" style={{ color: "#4B4F6A" }}>Empresas que usam o Lucro Oculto economizam em média <span style={{ color: "#00D084", fontWeight: 700 }}>R$4.800/mês</span></p>
          <Link
            href="/app/upload"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm"
            style={{ background: "#00D084", color: "#0F1117" }}
          >
            <Upload className="w-4 h-4" />
            Fazer primeiro upload
          </Link>
        </div>
      </div>
    )
  }

  const actions = data.analysis.recommendations.map((r) => ({
    id: r.id,
    title: r.title,
    description: r.description,
    rationale: r.rationale ?? "",
    impact: r.impact ?? "medium",
    urgency: r.urgency ?? "soon",
    difficulty: r.difficulty ?? "medium",
    savingsEstimate: parseFloat(String(r.savingsEstimate ?? "0")),
    category: r.category ?? "",
    priority: r.priority,
  }))

  const doneCount = actions.filter((a) => (statuses[a.id] ?? "pending") === "done").length
  const totalSavings = actions.reduce((s, a) => s + a.savingsEstimate, 0)
  const capturedSavings = actions
    .filter((a) => (statuses[a.id] ?? "pending") === "done")
    .reduce((s, a) => s + a.savingsEstimate, 0)

  return (
    <div className="px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-black" style={{ color: "#F4F4F5" }}>Plano de ação</h1>
        <p className="text-sm mt-0.5" style={{ color: "#8B8FA8" }}>
          {actions.length} ações prioritárias para maximizar sua economia
        </p>
      </div>

      {actions.length === 0 ? (
        <div className="rounded-2xl p-10 text-center" style={{ background: "#1A1D27", border: "1px solid #2A2D3A" }}>
          <CheckCircle className="w-10 h-10 mx-auto mb-3" style={{ color: "#2A2D3A" }} />
          <p className="text-sm font-medium" style={{ color: "#8B8FA8" }}>Nenhuma ação recomendada</p>
          <p className="text-xs mt-1" style={{ color: "#4B4F6A" }}>Sua gestão financeira está em boa forma</p>
        </div>
      ) : (
        <>
          {/* Progress */}
          <div className="rounded-2xl p-5 mb-6" style={{ background: "#1A1D27", border: "1px solid #2A2D3A" }}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-semibold" style={{ color: "#F4F4F5" }}>
                  {doneCount} de {actions.length} ações concluídas
                </p>
                <p className="text-xs mt-0.5" style={{ color: "#8B8FA8" }}>
                  Economia capturada: {formatCurrency(capturedSavings)}/mês
                </p>
              </div>
              <p className="text-2xl font-black" style={{ color: "#00D084" }}>
                {totalSavings > 0 ? Math.round((capturedSavings / totalSavings) * 100) : 0}%
              </p>
            </div>
            <div className="h-2 rounded-full" style={{ background: "#2A2D3A" }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${totalSavings > 0 ? (capturedSavings / totalSavings) * 100 : 0}%`,
                  background: "#00D084",
                }}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            {actions.map((action, index) => {
              const status = statuses[action.id] ?? "pending"
              const isExpanded = expanded === action.id

              return (
                <div
                  key={action.id}
                  className="rounded-2xl overflow-hidden transition-all"
                  style={{
                    background: status === "done" ? "rgba(0,208,132,0.04)" : "#1A1D27",
                    border: status === "done" ? "1px solid rgba(0,208,132,0.2)" : "1px solid #2A2D3A",
                  }}
                >
                  <div className="p-5">
                    <div className="flex items-start gap-4">
                      <button onClick={() => toggleStatus(action.id)} className="shrink-0 mt-0.5 transition-colors">
                        {status === "done" ? (
                          <CheckCircle className="w-5 h-5" style={{ color: "#00D084" }} />
                        ) : status === "in_progress" ? (
                          <Clock className="w-5 h-5" style={{ color: "#F59E0B" }} />
                        ) : (
                          <Circle className="w-5 h-5" style={{ color: "#2A2D3A" }} />
                        )}
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold" style={{ color: "#4B4F6A" }}>#{index + 1}</span>
                          <p
                            className="text-sm font-semibold"
                            style={{
                              color: status === "done" ? "#8B8FA8" : "#F4F4F5",
                              textDecoration: status === "done" ? "line-through" : "none",
                            }}
                          >
                            {action.title}
                          </p>
                        </div>
                        <p className="text-xs" style={{ color: "#8B8FA8" }}>{action.description}</p>

                        <div className="flex items-center gap-2 mt-3 flex-wrap">
                          <span
                            className="text-xs px-2 py-0.5 rounded-full"
                            style={{ background: `${URGENCY_COLOR[action.urgency]}14`, color: URGENCY_COLOR[action.urgency] }}
                          >
                            {URGENCY_LABEL[action.urgency] ?? action.urgency}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "#212435", color: "#8B8FA8" }}>
                            {DIFF_LABEL[action.difficulty] ?? action.difficulty}
                          </span>
                          <span className="ml-auto text-sm font-bold" style={{ color: "#00D084" }}>
                            +{formatCurrency(action.savingsEstimate)}/mês
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => setExpanded(isExpanded ? null : action.id)}
                        className="shrink-0 p-1"
                        style={{ color: "#4B4F6A" }}
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {isExpanded && action.rationale && (
                    <div className="px-5 pb-5 border-t" style={{ borderColor: "#2A2D3A" }}>
                      <div className="pt-4 space-y-3">
                        <div>
                          <p className="text-xs font-semibold mb-1" style={{ color: "#F4F4F5" }}>Por que é importante:</p>
                          <p className="text-xs" style={{ color: "#8B8FA8" }}>{action.rationale}</p>
                        </div>
                        <div className="flex gap-4">
                          <div>
                            <p className="text-xs font-semibold" style={{ color: "#8B8FA8" }}>Impacto</p>
                            <p className="text-xs mt-0.5" style={{ color: IMPACT_COLOR[action.impact] }}>
                              {action.impact === "high" ? "Alto" : action.impact === "medium" ? "Médio" : "Baixo"}
                            </p>
                          </div>
                          {action.category && (
                            <div>
                              <p className="text-xs font-semibold" style={{ color: "#8B8FA8" }}>Categoria</p>
                              <p className="text-xs mt-0.5" style={{ color: "#F4F4F5" }}>{action.category}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

export default function ActionPlanPage() {
  return (
    <AccessGuard permission="action_plan:view">
      <ActionPlanContent />
    </AccessGuard>
  )
}
