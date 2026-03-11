"use client"

import { useState } from "react"
import Link from "next/link"
import { Lightbulb, CheckCircle, Upload, Download } from "lucide-react"
import { useAnalysisData } from "@/hooks/useAnalysisData"
import { CardSkeleton } from "@/components/ui/skeletons"

const IMPACT_COLOR: Record<string, string> = { high: "#00D084", medium: "#F59E0B", low: "#8B8FA8" }
const IMPACT_LABEL: Record<string, string> = { high: "Alto", medium: "Médio", low: "Baixo" }
const DIFF_LABEL: Record<string, string> = { easy: "Fácil", medium: "Médio", hard: "Difícil" }
const DIFF_COLOR: Record<string, string> = { easy: "#00D084", medium: "#F59E0B", hard: "#FF4D4F" }
const DIFF_ORDER: Record<string, number> = { easy: 0, medium: 1, hard: 2 }
const IMPACT_ORDER: Record<string, number> = { high: 0, medium: 1, low: 2 }

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })
}

export default function OpportunitiesPage() {
  const { data, loading } = useAnalysisData()
  const [done, setDone] = useState<Set<string>>(new Set())
  const [sortBy, setSortBy] = useState<"savings" | "difficulty" | "impact">("savings")

  const toggle = (id: string) =>
    setDone((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

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
          <h1 className="text-2xl font-black" style={{ color: "#F4F4F5" }}>Oportunidades de economia</h1>
        </div>
        <div className="rounded-2xl p-12 text-center" style={{ background: "#1A1D27", border: "1px solid #2A2D3A" }}>
          <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: "rgba(0,208,132,0.08)", border: "1px solid rgba(0,208,132,0.15)" }}>
            <Lightbulb className="w-8 h-8" style={{ color: "#00D084" }} />
          </div>
          <p className="text-base font-bold mb-1" style={{ color: "#F4F4F5" }}>Nenhuma oportunidade identificada</p>
          <p className="text-sm mb-2" style={{ color: "#8B8FA8" }}>Faça upload do extrato para identificar onde você pode economizar.</p>
          <p className="text-xs mb-6 px-4" style={{ color: "#4B4F6A" }}>Empresas que usam o Lucro Oculto economizam em média <span style={{ color: "#00D084", fontWeight: 700 }}>R$4.800/mês</span></p>
          <Link href="/app/upload" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm" style={{ background: "#00D084", color: "#0F1117" }}>
            <Upload className="w-4 h-4" />
            Fazer primeiro upload
          </Link>
        </div>
      </div>
    )
  }

  const opportunities = data.analysis.insights
    .filter((i) => i.type === "opportunity")
    .map((i) => {
      const meta = i.metadata as Record<string, unknown>
      return {
        id: i.id,
        title: i.title,
        description: i.description,
        action: (meta?.action as string) ?? "",
        impact: i.impact ?? "medium",
        difficulty: (meta?.difficulty as string) ?? "medium",
        savingsEstimate: parseFloat(String(i.amount ?? "0")),
      }
    })

  const sorted = opportunities.slice().sort((a, b) => {
    if (sortBy === "savings") return b.savingsEstimate - a.savingsEstimate
    if (sortBy === "difficulty") return (DIFF_ORDER[a.difficulty] ?? 1) - (DIFF_ORDER[b.difficulty] ?? 1)
    return (IMPACT_ORDER[a.impact] ?? 1) - (IMPACT_ORDER[b.impact] ?? 1)
  })

  const totalEstimate = opportunities.reduce((s, o) => s + o.savingsEstimate, 0)
  const capturedEstimate = opportunities
    .filter((o) => done.has(o.id))
    .reduce((s, o) => s + o.savingsEstimate, 0)

  return (
    <div className="px-6 py-8">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black" style={{ color: "#F4F4F5" }}>Oportunidades de economia</h1>
          <p className="text-sm mt-0.5" style={{ color: "#8B8FA8" }}>
            {opportunities.length} oportunidades · até {formatCurrency(totalEstimate)}/mês de economia
          </p>
        </div>
        {opportunities.length > 0 && (
          <a
            href="/api/app/export?type=opportunities"
            download
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium shrink-0"
            style={{ background: "#212435", color: "#8B8FA8", border: "1px solid #2A2D3A" }}
          >
            <Download className="w-4 h-4" />
            Exportar CSV
          </a>
        )}
      </div>

      {opportunities.length === 0 ? (
        <div className="rounded-2xl p-10 text-center" style={{ background: "#1A1D27", border: "1px solid #2A2D3A" }}>
          <Lightbulb className="w-10 h-10 mx-auto mb-3" style={{ color: "#2A2D3A" }} />
          <p className="text-sm font-medium" style={{ color: "#8B8FA8" }}>Nenhuma oportunidade identificada</p>
          <p className="text-xs mt-1" style={{ color: "#4B4F6A" }}>Seus gastos parecem bem otimizados</p>
        </div>
      ) : (
        <>
          {/* Progress bar */}
          <div className="rounded-2xl p-5 mb-6" style={{ background: "#1A1D27", border: "1px solid #2A2D3A" }}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold" style={{ color: "#F4F4F5" }}>Economia capturada</p>
              <p className="text-sm font-bold" style={{ color: "#00D084" }}>{formatCurrency(capturedEstimate)}/mês</p>
            </div>
            <div className="h-2 rounded-full mb-2" style={{ background: "#2A2D3A" }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${totalEstimate > 0 ? (capturedEstimate / totalEstimate) * 100 : 0}%`, background: "#00D084" }}
              />
            </div>
            <p className="text-xs" style={{ color: "#4B4F6A" }}>
              {done.size} de {opportunities.length} oportunidades implementadas
            </p>
          </div>

          {/* Sort controls */}
          <div className="flex items-center gap-2 mb-5">
            <span className="text-xs" style={{ color: "#4B4F6A" }}>Ordenar por:</span>
            {(["savings", "difficulty", "impact"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSortBy(s)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={{
                  background: sortBy === s ? "rgba(0,208,132,0.1)" : "#1A1D27",
                  border: sortBy === s ? "1px solid #00D084" : "1px solid #2A2D3A",
                  color: sortBy === s ? "#00D084" : "#8B8FA8",
                }}
              >
                {s === "savings" ? "Economia" : s === "difficulty" ? "Facilidade" : "Impacto"}
              </button>
            ))}
          </div>

          {/* List */}
          <div className="space-y-4">
            {sorted.map((opp) => {
              const isDone = done.has(opp.id)
              return (
                <div
                  key={opp.id}
                  className="rounded-2xl p-5 transition-all"
                  style={{
                    background: isDone ? "rgba(0,208,132,0.04)" : "#1A1D27",
                    border: isDone ? "1px solid rgba(0,208,132,0.2)" : "1px solid #2A2D3A",
                    opacity: isDone ? 0.8 : 1,
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl shrink-0" style={{ background: "#212435" }}>
                      <Lightbulb className="w-5 h-5" style={{ color: IMPACT_COLOR[opp.impact] }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="text-sm font-semibold" style={{ color: isDone ? "#8B8FA8" : "#F4F4F5", textDecoration: isDone ? "line-through" : "none" }}>
                          {opp.title}
                        </p>
                        <p className="text-base font-black shrink-0" style={{ color: "#00D084" }}>
                          +{formatCurrency(opp.savingsEstimate)}/mês
                        </p>
                      </div>
                      <p className="text-xs leading-relaxed mb-3" style={{ color: "#8B8FA8" }}>{opp.description}</p>
                      {opp.action && (
                        <div
                          className="rounded-xl px-3 py-2.5 mb-3 text-xs"
                          style={{ background: "#212435", color: "#8B8FA8" }}
                        >
                          <span className="font-medium" style={{ color: "#F4F4F5" }}>Ação: </span>{opp.action}
                        </div>
                      )}
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${IMPACT_COLOR[opp.impact]}14`, color: IMPACT_COLOR[opp.impact] }}>
                          {IMPACT_LABEL[opp.impact]} impacto
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${DIFF_COLOR[opp.difficulty]}14`, color: DIFF_COLOR[opp.difficulty] }}>
                          Dificuldade {DIFF_LABEL[opp.difficulty] ?? opp.difficulty}
                        </span>
                        <button
                          onClick={() => toggle(opp.id)}
                          className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                          style={{
                            background: isDone ? "rgba(0,208,132,0.1)" : "#212435",
                            color: isDone ? "#00D084" : "#8B8FA8",
                            border: isDone ? "1px solid rgba(0,208,132,0.2)" : "1px solid #2A2D3A",
                          }}
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          {isDone ? "Concluída" : "Marcar como feita"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
