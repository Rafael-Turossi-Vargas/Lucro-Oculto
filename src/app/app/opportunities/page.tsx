"use client"

import { useState } from "react"
import Link from "next/link"
import { Lightbulb, CheckCircle, Upload, Download, Zap, Target, TrendingUp, ArrowRight } from "lucide-react"
import { useAnalysisData } from "@/hooks/useAnalysisData"
import { CardSkeleton } from "@/components/ui/skeletons"

const IMPACT_COLOR: Record<string, string> = { high: "#00D084", medium: "#F59E0B", low: "#8B8FA8" }
const IMPACT_LABEL: Record<string, string> = { high: "Alto", medium: "Médio", low: "Baixo" }
const DIFF_LABEL: Record<string, string> = { easy: "Fácil", medium: "Médio", hard: "Difícil" }
const DIFF_COLOR: Record<string, string> = { easy: "#00D084", medium: "#F59E0B", hard: "#FF4D4F" }
const DIFF_ORDER: Record<string, number> = { easy: 0, medium: 1, hard: 2 }
const IMPACT_ORDER: Record<string, number> = { high: 0, medium: 1, low: 2 }

function fmt(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })
}

export default function OpportunitiesPage() {
  const { data, loading } = useAnalysisData()
  const [done, setDone] = useState<Set<string>>(new Set())
  const [sortBy, setSortBy] = useState<"savings" | "difficulty" | "impact">("savings")
  const [filter, setFilter] = useState<"all" | "easy" | "pending">("all")

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
        <CardSkeleton rows={1} />
        <CardSkeleton rows={5} />
      </div>
    )
  }

  if (!data?.analysis) {
    return (
      <div className="px-6 py-8">
        <h1 className="text-2xl font-black mb-6" style={{ color: "#F4F4F5" }}>Oportunidades de economia</h1>
        <div className="rounded-2xl p-12 text-center" style={{ background: "#1A1D27", border: "1px solid #2A2D3A" }}>
          <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
            style={{ background: "rgba(0,208,132,0.08)", border: "1px solid rgba(0,208,132,0.15)" }}>
            <Lightbulb className="w-8 h-8" style={{ color: "#00D084" }} />
          </div>
          <p className="text-base font-bold mb-1" style={{ color: "#F4F4F5" }}>Nenhuma oportunidade identificada</p>
          <p className="text-sm mb-2" style={{ color: "#8B8FA8" }}>Faça upload do extrato para identificar onde você pode economizar.</p>
          <p className="text-xs mb-6 px-4" style={{ color: "#4B4F6A" }}>
            Empresas que usam o Lucro Oculto economizam em média{" "}
            <span style={{ color: "#00D084", fontWeight: 700 }}>R$4.800/mês</span>
          </p>
          <Link href="/app/upload" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm"
            style={{ background: "#00D084", color: "#0F1117" }}>
            <Upload className="w-4 h-4" /> Fazer primeiro upload
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

  const totalEstimate = opportunities.reduce((s, o) => s + o.savingsEstimate, 0)
  const capturedEstimate = opportunities.filter((o) => done.has(o.id)).reduce((s, o) => s + o.savingsEstimate, 0)
  const easyWins = opportunities.filter((o) => o.difficulty === "easy")
  const easyTotal = easyWins.reduce((s, o) => s + o.savingsEstimate, 0)
  const pendingCount = opportunities.filter((o) => !done.has(o.id)).length
  const pct = totalEstimate > 0 ? (capturedEstimate / totalEstimate) * 100 : 0

  const filtered = opportunities.filter((o) => {
    if (filter === "easy") return o.difficulty === "easy"
    if (filter === "pending") return !done.has(o.id)
    return true
  })

  const sorted = filtered.slice().sort((a, b) => {
    if (sortBy === "savings") return b.savingsEstimate - a.savingsEstimate
    if (sortBy === "difficulty") return (DIFF_ORDER[a.difficulty] ?? 1) - (DIFF_ORDER[b.difficulty] ?? 1)
    return (IMPACT_ORDER[a.impact] ?? 1) - (IMPACT_ORDER[b.impact] ?? 1)
  })

  return (
    <div className="px-6 py-8 space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black" style={{ color: "#F4F4F5" }}>Oportunidades de economia</h1>
          <p className="text-sm mt-0.5" style={{ color: "#8B8FA8" }}>
            {opportunities.length} oportunidades · potencial de{" "}
            <span style={{ color: "#00D084", fontWeight: 700 }}>{fmt(totalEstimate)}/mês</span>
            <span style={{ color: "#4B4F6A" }}> · {fmt(totalEstimate * 12)}/ano</span>
          </p>
        </div>
        {opportunities.length > 0 && (
          <a href="/api/app/export?type=opportunities" download
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium shrink-0"
            style={{ background: "#212435", color: "#8B8FA8", border: "1px solid #2A2D3A" }}>
            <Download className="w-4 h-4" /> Exportar CSV
          </a>
        )}
      </div>

      {opportunities.length === 0 ? (
        <div className="rounded-2xl p-10 text-center" style={{ background: "#1A1D27", border: "1px solid #2A2D3A" }}>
          <Lightbulb className="w-10 h-10 mx-auto mb-3" style={{ color: "#2A2D3A" }} />
          <p className="text-sm font-medium" style={{ color: "#8B8FA8" }}>Nenhuma oportunidade identificada</p>
          <p className="text-xs mt-1" style={{ color: "#4B4F6A" }}>Seus gastos parecem bem otimizados 🎉</p>
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-4">
            {/* Progress captured */}
            <div className="rounded-2xl p-5 col-span-1"
              style={{ background: "#1A1D27", border: "1px solid #2A2D3A", borderLeft: "3px solid #00D084" }}>
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4" style={{ color: "#00D084" }} />
                <span className="text-xs font-semibold" style={{ color: "#8B8FA8" }}>Economia capturada</span>
              </div>
              <p className="text-2xl font-black mb-0.5" style={{ color: "#00D084" }}>{fmt(capturedEstimate)}</p>
              <p className="text-xs mb-3" style={{ color: "#4B4F6A" }}>por mês · {fmt(capturedEstimate * 12)}/ano</p>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "#212435" }}>
                <div className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${pct}%`, background: "#00D084" }} />
              </div>
              <p className="text-[10px] mt-1.5" style={{ color: "#4B4F6A" }}>
                {done.size} de {opportunities.length} implementadas · {pct.toFixed(0)}%
              </p>
            </div>

            {/* Quick wins */}
            <div className="rounded-2xl p-5"
              style={{ background: "#1A1D27", border: "1px solid #2A2D3A", borderLeft: "3px solid #F59E0B" }}>
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-4 h-4" style={{ color: "#F59E0B" }} />
                <span className="text-xs font-semibold" style={{ color: "#8B8FA8" }}>Vitórias rápidas</span>
              </div>
              <p className="text-2xl font-black mb-0.5" style={{ color: "#F59E0B" }}>{easyWins.length}</p>
              <p className="text-xs mb-3" style={{ color: "#4B4F6A" }}>fáceis de implementar</p>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "#212435" }}>
                <div className="h-full rounded-full"
                  style={{ width: `${opportunities.length > 0 ? (easyWins.length / opportunities.length) * 100 : 0}%`, background: "#F59E0B" }} />
              </div>
              <p className="text-[10px] mt-1.5" style={{ color: "#4B4F6A" }}>{fmt(easyTotal)}/mês de potencial</p>
            </div>

            {/* Pending */}
            <div className="rounded-2xl p-5"
              style={{ background: "#1A1D27", border: "1px solid #2A2D3A", borderLeft: "3px solid #8B8FA8" }}>
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-4 h-4" style={{ color: "#8B8FA8" }} />
                <span className="text-xs font-semibold" style={{ color: "#8B8FA8" }}>Pendentes</span>
              </div>
              <p className="text-2xl font-black mb-0.5" style={{ color: "#F4F4F5" }}>{pendingCount}</p>
              <p className="text-xs mb-3" style={{ color: "#4B4F6A" }}>ainda não implementadas</p>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "#212435" }}>
                <div className="h-full rounded-full"
                  style={{ width: `${opportunities.length > 0 ? (pendingCount / opportunities.length) * 100 : 0}%`, background: "#8B8FA8" }} />
              </div>
              <p className="text-[10px] mt-1.5" style={{ color: "#4B4F6A" }}>
                {fmt(opportunities.filter(o => !done.has(o.id)).reduce((s, o) => s + o.savingsEstimate, 0))}/mês restante
              </p>
            </div>
          </div>

          {/* Quick wins banner */}
          {easyWins.filter(o => !done.has(o.id)).length > 0 && filter === "all" && (
            <div className="flex items-center gap-3 p-4 rounded-xl"
              style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.2)" }}>
              <Zap className="w-4 h-4 shrink-0" style={{ color: "#F59E0B" }} />
              <p className="text-sm flex-1" style={{ color: "#F4F4F5" }}>
                <span className="font-bold" style={{ color: "#F59E0B" }}>
                  {easyWins.filter(o => !done.has(o.id)).length} vitória{easyWins.filter(o => !done.has(o.id)).length > 1 ? "s" : ""} rápida{easyWins.filter(o => !done.has(o.id)).length > 1 ? "s" : ""}
                </span>
                {" "}disponíveis — implemente agora e capture{" "}
                <span className="font-bold">{fmt(easyWins.filter(o => !done.has(o.id)).reduce((s, o) => s + o.savingsEstimate, 0))}/mês</span> sem esforço.
              </p>
              <button onClick={() => setFilter("easy")}
                className="flex items-center gap-1 text-xs font-semibold shrink-0"
                style={{ color: "#F59E0B" }}>
                Ver só elas <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Filter + Sort bar */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 rounded-xl p-1"
              style={{ background: "#1A1D27", border: "1px solid #2A2D3A" }}>
              {([
                { value: "all", label: `Todas (${opportunities.length})` },
                { value: "easy", label: `Vitórias rápidas (${easyWins.length})` },
                { value: "pending", label: `Pendentes (${pendingCount})` },
              ] as const).map((f) => (
                <button key={f.value} onClick={() => setFilter(f.value)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                  style={{
                    background: filter === f.value ? "#212435" : "transparent",
                    color: filter === f.value ? "#F4F4F5" : "#8B8FA8",
                    border: filter === f.value ? "1px solid #2A2D3A" : "1px solid transparent",
                  }}>
                  {f.label}
                </button>
              ))}
            </div>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as "savings" | "difficulty" | "impact")}
              className="text-xs px-3 py-2 rounded-xl ml-auto outline-none"
              style={{ background: "#1A1D27", border: "1px solid #2A2D3A", color: "#8B8FA8" }}>
              <option value="savings">Maior economia</option>
              <option value="difficulty">Mais fácil primeiro</option>
              <option value="impact">Maior impacto</option>
            </select>
          </div>

          {/* Opportunity list */}
          <div className="space-y-3">
            {sorted.map((opp, idx) => {
              const isDone = done.has(opp.id)
              return (
                <div key={opp.id}
                  className="rounded-2xl p-5 transition-all"
                  style={{
                    background: isDone ? "rgba(0,208,132,0.04)" : "#1A1D27",
                    border: isDone ? "1px solid rgba(0,208,132,0.2)" : "1px solid #2A2D3A",
                    borderLeft: `3px solid ${isDone ? "#00D084" : IMPACT_COLOR[opp.impact]}`,
                    opacity: isDone ? 0.75 : 1,
                  }}>
                  <div className="flex items-start gap-4">
                    {/* Rank */}
                    <div className="flex items-center justify-center w-7 h-7 rounded-lg shrink-0 font-bold text-xs mt-0.5"
                      style={{
                        background: isDone ? "rgba(0,208,132,0.12)" : `${IMPACT_COLOR[opp.impact]}12`,
                        color: isDone ? "#00D084" : IMPACT_COLOR[opp.impact],
                      }}>
                      {isDone ? <CheckCircle className="w-4 h-4" /> : idx + 1}
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Title row */}
                      <div className="flex items-start justify-between gap-3 mb-1.5">
                        <div className="flex items-center gap-2 flex-wrap min-w-0">
                          <p className="text-sm font-semibold"
                            style={{ color: isDone ? "#8B8FA8" : "#F4F4F5", textDecoration: isDone ? "line-through" : "none" }}>
                            {opp.title}
                          </p>
                          {opp.difficulty === "easy" && !isDone && (
                            <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold"
                              style={{ background: "rgba(245,158,11,0.12)", color: "#F59E0B" }}>
                              ⚡ RÁPIDA
                            </span>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-base font-black" style={{ color: isDone ? "#8B8FA8" : "#00D084" }}>
                            +{fmt(opp.savingsEstimate)}/mês
                          </p>
                          <p className="text-[10px] font-semibold" style={{ color: isDone ? "#4B4F6A" : "#00D084", opacity: 0.6 }}>
                            +{fmt(opp.savingsEstimate * 12)}/ano
                          </p>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-xs leading-relaxed mb-3" style={{ color: "#8B8FA8" }}>{opp.description}</p>

                      {/* Action box */}
                      {opp.action && (
                        <div className="rounded-xl px-3 py-2.5 mb-3"
                          style={{ background: "#212435", border: "1px solid #2A2D3A" }}>
                          <p className="text-[10px] font-semibold mb-0.5" style={{ color: "#4B4F6A", textTransform: "uppercase", letterSpacing: "0.6px" }}>
                            Como fazer
                          </p>
                          <p className="text-xs" style={{ color: "#8B8FA8" }}>{opp.action}</p>
                        </div>
                      )}

                      {/* Badges + CTA */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                          style={{ background: `${IMPACT_COLOR[opp.impact]}14`, color: IMPACT_COLOR[opp.impact] }}>
                          {IMPACT_LABEL[opp.impact]} impacto
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                          style={{ background: `${DIFF_COLOR[opp.difficulty]}14`, color: DIFF_COLOR[opp.difficulty] }}>
                          {DIFF_LABEL[opp.difficulty] ?? opp.difficulty}
                        </span>
                        <button onClick={() => toggle(opp.id)}
                          className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                          style={{
                            background: isDone ? "rgba(0,208,132,0.1)" : "#212435",
                            color: isDone ? "#00D084" : "#8B8FA8",
                            border: isDone ? "1px solid rgba(0,208,132,0.2)" : "1px solid #2A2D3A",
                          }}>
                          <CheckCircle className="w-3.5 h-3.5" />
                          {isDone ? "Concluída — desfazer" : "Marcar como feita"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Footer summary */}
          <div className="rounded-2xl p-5 flex items-center justify-between"
            style={{ background: "rgba(0,208,132,0.04)", border: "1px solid rgba(0,208,132,0.12)" }}>
            <div>
              <p className="text-xs font-semibold mb-0.5" style={{ color: "#8B8FA8" }}>
                {done.size > 0 ? "Progresso atual" : "Potencial total"}
              </p>
              {done.size > 0 ? (
                <p className="text-sm" style={{ color: "#F4F4F5" }}>
                  Você já capturou{" "}
                  <span className="font-black" style={{ color: "#00D084" }}>{fmt(capturedEstimate)}/mês</span>
                  {" "}·{" "}
                  <span className="font-bold" style={{ color: "#00D084" }}>{fmt(capturedEstimate * 12)}/ano</span>
                  {pendingCount > 0 && (
                    <span style={{ color: "#4B4F6A" }}> · {pendingCount} ainda pendentes</span>
                  )}
                </p>
              ) : (
                <p className="text-sm" style={{ color: "#F4F4F5" }}>
                  Implementar tudo pode gerar{" "}
                  <span className="font-black" style={{ color: "#00D084" }}>{fmt(totalEstimate)}/mês</span>
                  {" "}·{" "}
                  <span className="font-bold" style={{ color: "#00D084" }}>{fmt(totalEstimate * 12)}/ano</span>
                </p>
              )}
            </div>
            <Link href={`/app/analysis/${data.analysis.id}#actions`}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold shrink-0"
              style={{ background: "#00D084", color: "#0F1117" }}>
              Ver plano completo <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </>
      )}
    </div>
  )
}
