"use client"

import { useState } from "react"
import Link from "next/link"
import { CheckCircle, Circle, Clock, ChevronDown, ChevronUp, Upload, ClipboardList, Trophy, Zap } from "lucide-react"
import { useAnalysisData } from "@/hooks/useAnalysisData"
import { CardSkeleton } from "@/components/ui/skeletons"
import { AccessGuard } from "@/components/auth/AccessGuard"

const URGENCY_LABEL: Record<string, string> = { immediate: "Imediato", soon: "Em breve", monitor: "Monitorar" }
const URGENCY_COLOR: Record<string, string> = { immediate: "#FF4D4F", soon: "#F59E0B", monitor: "var(--text-muted)" }
const DIFF_LABEL: Record<string, string> = { easy: "Fácil", medium: "Médio", hard: "Difícil" }
const DIFF_COLOR: Record<string, string> = { easy: "#00D084", medium: "#F59E0B", hard: "#FF4D4F" }
const IMPACT_COLOR: Record<string, string> = { high: "#FF4D4F", medium: "#F59E0B", low: "var(--text-muted)" }

function fmt(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })
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
        <CardSkeleton rows={1} />
        <CardSkeleton rows={5} />
      </div>
    )
  }

  if (!data?.analysis) {
    return (
      <div className="px-6 py-8">
        <h1 className="text-2xl font-black mb-6" style={{ color: "var(--text-primary)" }}>Plano de ação</h1>
        <div className="rounded-2xl p-12 text-center" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
            style={{ background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.15)" }}>
            <ClipboardList className="w-8 h-8" style={{ color: "#3B82F6" }} />
          </div>
          <p className="text-base font-bold mb-1" style={{ color: "var(--text-primary)" }}>Nenhum plano de ação gerado</p>
          <p className="text-sm mb-2" style={{ color: "var(--text-muted)" }}>Faça upload do extrato bancário para receber um plano personalizado.</p>
          <p className="text-xs mb-6 px-4" style={{ color: "var(--text-faint)" }}>
            Empresas que usam o Lucro Oculto economizam em média{" "}
            <span style={{ color: "#00D084", fontWeight: 700 }}>R$4.800/mês</span>
          </p>
          <Link href="/app/upload" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm"
            style={{ background: "#00D084", color: "var(--bg-page)" }}>
            <Upload className="w-4 h-4" /> Fazer primeiro upload
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
  const inProgressCount = actions.filter((a) => (statuses[a.id] ?? "pending") === "in_progress").length
  const totalSavings = actions.reduce((s, a) => s + a.savingsEstimate, 0)
  const capturedSavings = actions
    .filter((a) => (statuses[a.id] ?? "pending") === "done")
    .reduce((s, a) => s + a.savingsEstimate, 0)
  const pct = totalSavings > 0 ? Math.round((capturedSavings / totalSavings) * 100) : 0
  const easyImmediate = actions.filter(a => a.difficulty === "easy" && a.urgency === "immediate" && (statuses[a.id] ?? "pending") !== "done")

  return (
    <div className="px-6 py-8 space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-black" style={{ color: "var(--text-primary)" }}>Plano de ação</h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
          {actions.length} ações · potencial de{" "}
          <span style={{ color: "#00D084", fontWeight: 700 }}>{fmt(totalSavings)}/mês</span>
        </p>
      </div>

      {actions.length === 0 ? (
        <div className="rounded-2xl p-10 text-center" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <Trophy className="w-10 h-10 mx-auto mb-3" style={{ color: "#00D084" }} />
          <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>Nenhuma ação recomendada</p>
          <p className="text-xs mt-1" style={{ color: "var(--text-faint)" }}>Sua gestão financeira está em boa forma</p>
        </div>
      ) : (
        <>
          {/* Progress card */}
          <div className="rounded-2xl p-5"
            style={{
              background: doneCount === actions.length && actions.length > 0
                ? "rgba(0,208,132,0.06)"
                : "var(--bg-card)",
              border: doneCount === actions.length && actions.length > 0
                ? "1px solid rgba(0,208,132,0.25)"
                : "1px solid var(--border)",
            }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                  {doneCount} de {actions.length} ações concluídas
                </p>
                <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                  Economia capturada:{" "}
                  <span style={{ color: "#00D084", fontWeight: 700 }}>{fmt(capturedSavings)}/mês</span>
                  {capturedSavings > 0 && (
                    <span style={{ color: "var(--text-faint)" }}> · {fmt(capturedSavings * 12)}/ano</span>
                  )}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black" style={{ color: pct === 100 ? "#00D084" : "var(--text-primary)" }}>{pct}%</p>
                {inProgressCount > 0 && (
                  <p className="text-[10px]" style={{ color: "#F59E0B" }}>{inProgressCount} em andamento</p>
                )}
              </div>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--bg-subtle)" }}>
              <div className="h-full rounded-full transition-all duration-700"
                style={{ width: `${pct}%`, background: "#00D084" }} />
            </div>
            {totalSavings > capturedSavings && (
              <p className="text-[10px] mt-1.5" style={{ color: "var(--text-faint)" }}>
                {fmt(totalSavings - capturedSavings)}/mês ainda disponíveis — {actions.length - doneCount} ações restantes
              </p>
            )}
          </div>

          {/* Quick wins banner */}
          {easyImmediate.length > 0 && (
            <div className="flex items-center gap-3 p-4 rounded-xl"
              style={{ background: "rgba(255,77,79,0.06)", border: "1px solid rgba(255,77,79,0.2)" }}>
              <Zap className="w-4 h-4 shrink-0" style={{ color: "#FF4D4F" }} />
              <p className="text-sm" style={{ color: "var(--text-primary)" }}>
                <span className="font-bold" style={{ color: "#FF4D4F" }}>{easyImmediate.length} ação{easyImmediate.length > 1 ? "ões" : ""} imediata{easyImmediate.length > 1 ? "s" : ""} e fácil{easyImmediate.length > 1 ? "eis" : ""}</span>
                {" "}— execute agora para resultado rápido.
              </p>
            </div>
          )}

          {/* Actions list */}
          <div className="space-y-2.5">
            {actions.map((action, index) => {
              const status = statuses[action.id] ?? "pending"
              const isExpanded = expanded === action.id
              const borderColor = status === "done" ? "#00D084" : status === "in_progress" ? "#F59E0B" : URGENCY_COLOR[action.urgency]

              return (
                <div key={action.id} className="rounded-2xl overflow-hidden transition-all"
                  style={{
                    background: status === "done" ? "rgba(0,208,132,0.04)" : "var(--bg-card)",
                    border: status === "done" ? "1px solid rgba(0,208,132,0.2)" : "1px solid var(--border)",
                    borderLeft: `3px solid ${borderColor}`,
                  }}>
                  <div className="p-5">
                    <div className="flex items-start gap-4">
                      {/* Status toggle */}
                      <button onClick={() => toggleStatus(action.id)}
                        className="shrink-0 mt-0.5 transition-transform hover:scale-110">
                        {status === "done" ? (
                          <CheckCircle className="w-5 h-5" style={{ color: "#00D084" }} />
                        ) : status === "in_progress" ? (
                          <Clock className="w-5 h-5" style={{ color: "#F59E0B" }} />
                        ) : (
                          <Circle className="w-5 h-5" style={{ color: "var(--border)" }} />
                        )}
                      </button>

                      <div className="flex-1 min-w-0">
                        {/* Title */}
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-[10px] font-black px-1.5 py-0.5 rounded"
                            style={{ background: "var(--bg-subtle)", color: "var(--text-faint)" }}>#{index + 1}</span>
                          <p className="text-sm font-semibold"
                            style={{
                              color: status === "done" ? "var(--text-muted)" : "var(--text-primary)",
                              textDecoration: status === "done" ? "line-through" : "none",
                            }}>
                            {action.title}
                          </p>
                        </div>
                        <p className="text-xs leading-relaxed mb-3" style={{ color: "var(--text-muted)" }}>{action.description}</p>

                        {/* Badges row */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                            style={{ background: `${URGENCY_COLOR[action.urgency]}14`, color: URGENCY_COLOR[action.urgency] }}>
                            {URGENCY_LABEL[action.urgency] ?? action.urgency}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                            style={{ background: `${DIFF_COLOR[action.difficulty]}14`, color: DIFF_COLOR[action.difficulty] }}>
                            {DIFF_LABEL[action.difficulty] ?? action.difficulty}
                          </span>
                          <div className="ml-auto text-right">
                            <span className="text-sm font-black" style={{ color: status === "done" ? "var(--text-muted)" : "#00D084" }}>
                              +{fmt(action.savingsEstimate)}/mês
                            </span>
                            <span className="text-[10px] ml-1.5" style={{ color: "var(--text-faint)" }}>
                              +{fmt(action.savingsEstimate * 12)}/ano
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Expand toggle */}
                      {action.rationale && (
                        <button onClick={() => setExpanded(isExpanded ? null : action.id)}
                          className="shrink-0 p-1.5 rounded-lg transition-colors"
                          style={{ color: "var(--text-faint)", background: isExpanded ? "var(--bg-subtle)" : "transparent" }}>
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Expanded rationale */}
                  {isExpanded && action.rationale && (
                    <div className="px-5 pb-5 pt-4 space-y-4"
                      style={{ borderTop: "1px solid var(--border)" }}>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--text-faint)" }}>
                          Por que é importante
                        </p>
                        <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>{action.rationale}</p>
                      </div>
                      <div className="flex gap-6">
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--text-faint)" }}>Impacto</p>
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                            style={{ background: `${IMPACT_COLOR[action.impact]}14`, color: IMPACT_COLOR[action.impact] }}>
                            {action.impact === "high" ? "Alto" : action.impact === "medium" ? "Médio" : "Baixo"}
                          </span>
                        </div>
                        {action.category && (
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--text-faint)" }}>Categoria</p>
                            <span className="text-xs px-2 py-0.5 rounded-full"
                              style={{ background: "var(--bg-subtle)", color: "var(--text-primary)" }}>
                              {action.category}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Footer */}
          <div className="rounded-2xl p-5 flex items-center justify-between"
            style={{ background: "rgba(0,208,132,0.04)", border: "1px solid rgba(0,208,132,0.12)" }}>
            <div>
              <p className="text-xs font-semibold mb-0.5" style={{ color: "var(--text-muted)" }}>Potencial total do plano</p>
              <p className="text-sm" style={{ color: "var(--text-primary)" }}>
                <span className="font-black" style={{ color: "#00D084" }}>{fmt(totalSavings)}/mês</span>
                {" "}·{" "}
                <span className="font-bold" style={{ color: "#00D084" }}>{fmt(totalSavings * 12)}/ano</span>
              </p>
            </div>
            <Link href={`/app/analysis/${data.analysis.id}`}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold shrink-0"
              style={{ background: "var(--bg-subtle)", color: "var(--text-muted)", border: "1px solid var(--border)" }}>
              Ver análise completa
            </Link>
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
