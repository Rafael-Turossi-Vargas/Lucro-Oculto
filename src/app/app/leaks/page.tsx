"use client"

import { useState } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { TrendingDown, Upload, Download, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react"
import { useAnalysisData } from "@/hooks/useAnalysisData"
import { CardSkeleton } from "@/components/ui/skeletons"
import { can } from "@/lib/roles"

const IMPACT_COLOR: Record<string, string> = { high: "#FF4D4F", medium: "#F59E0B", low: "var(--text-muted)" }
const IMPACT_LABEL: Record<string, string> = { high: "Alto", medium: "Médio", low: "Baixo" }
const TYPE_LABEL: Record<string, string> = {
  subscription: "Assinatura",
  overlap: "Sobreposição",
  anomaly: "Anomalia",
  duplicate: "Duplicata",
  concentration: "Concentração",
}

function fmt(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })
}

type Impact = "high" | "medium" | "low"

export default function LeaksPage() {
  const { data, loading } = useAnalysisData()
  const { data: session } = useSession()
  const canUpload = can(session?.user?.role ?? "", "upload:create")
  const [filter, setFilter] = useState<Impact | "all">("all")
  const [sortBy, setSortBy] = useState<"amount" | "impact">("amount")
  const [exportToast, setExportToast] = useState(false)

  const handleExport = () => {
    setExportToast(true)
    setTimeout(() => setExportToast(false), 3000)
  }

  if (loading) {
    return (
      <div className="px-4 sm:px-6 py-6 sm:py-8 space-y-4">
        <CardSkeleton rows={1} />
        <CardSkeleton rows={5} />
      </div>
    )
  }

  if (!data?.analysis) {
    return (
      <div className="px-4 sm:px-6 py-6 sm:py-8">
        <h1 className="text-2xl font-black mb-6" style={{ color: "var(--text-primary)" }}>Vazamentos detectados</h1>
        <div className="rounded-2xl p-12 text-center" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
            style={{ background: "rgba(255,77,79,0.08)", border: "1px solid rgba(255,77,79,0.15)" }}>
            <TrendingDown className="w-8 h-8" style={{ color: "#FF4D4F" }} />
          </div>
          <p className="text-base font-bold mb-1" style={{ color: "var(--text-primary)" }}>Nenhum vazamento detectado</p>
          <p className="text-sm mb-2" style={{ color: "var(--text-muted)" }}>
            {canUpload ? "Faça upload do extrato para descobrir onde seu lucro está escapando." : "Aguardando análise."}
          </p>
          <p className="text-xs mb-6 px-4" style={{ color: "var(--text-faint)" }}>
            Empresas que usam o Lucro Oculto economizam em média{" "}
            <span style={{ color: "#00D084", fontWeight: 700 }}>R$4.800/mês</span>
          </p>
          {canUpload && (
            <Link href="/app/upload" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm"
              style={{ background: "#00D084", color: "var(--bg-page)" }}>
              <Upload className="w-4 h-4" /> Fazer primeiro upload
            </Link>
          )}
        </div>
      </div>
    )
  }

  const impactOrder: Record<Impact, number> = { high: 0, medium: 1, low: 2 }

  const leaks = data.analysis.insights
    .filter((i) => i.type === "leak")
    .map((i) => ({
      id: i.id,
      type: ((i.metadata as Record<string, unknown>)?.type as string) ?? "anomaly",
      title: i.title,
      description: i.description,
      impact: (i.impact ?? "low") as Impact,
      amount: parseFloat(String(i.amount ?? "0")),
    }))

  const filtered = (filter === "all" ? leaks : leaks.filter((l) => l.impact === filter))
    .slice()
    .sort((a, b) => {
      if (sortBy === "amount") return b.amount - a.amount
      return impactOrder[a.impact] - impactOrder[b.impact]
    })

  const totalImpact = leaks.reduce((s, l) => s + l.amount, 0)
  const highCount = leaks.filter(l => l.impact === "high").length
  const highTotal = leaks.filter(l => l.impact === "high").reduce((s, l) => s + l.amount, 0)

  return (
    <div className="px-4 sm:px-6 py-6 sm:py-8 space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl shrink-0 mt-0.5"
            style={{ background: "rgba(255,77,79,0.08)", border: "1px solid rgba(255,77,79,0.18)" }}>
            <TrendingDown className="w-5 h-5" style={{ color: "#FF4D4F" }} />
          </div>
          <div>
            <h1 className="text-2xl font-black" style={{ color: "var(--text-primary)" }}>Vazamentos detectados</h1>
            <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
              {leaks.length} vazamentos · impacto total de{" "}
              <span style={{ color: "#FF4D4F", fontWeight: 700 }}>{fmt(totalImpact)}/mês</span>
              <span style={{ color: "var(--text-faint)" }}> · {fmt(totalImpact * 12)}/ano</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {leaks.length > 0 && (
            <a href="/api/app/export?type=leaks" download onClick={handleExport}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium"
              style={{ background: "var(--bg-subtle)", color: "var(--text-muted)", border: "1px solid var(--border)" }}>
              <Download className="w-4 h-4" /> Exportar CSV
            </a>
          )}
        </div>
      </div>

      {leaks.length === 0 ? (
        <div className="rounded-2xl p-10 text-center" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <TrendingDown className="w-10 h-10 mx-auto mb-3" style={{ color: "var(--border)" }} />
          <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>Nenhum vazamento detectado</p>
          <p className="text-xs mt-1" style={{ color: "var(--text-faint)" }}>Sua situação financeira está saudável 🎉</p>
        </div>
      ) : (
        <>
          {/* Summary cards with progress bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {(["high", "medium", "low"] as Impact[]).map((impact) => {
              const count = leaks.filter((l) => l.impact === impact).length
              const total = leaks.filter((l) => l.impact === impact).reduce((s, l) => s + l.amount, 0)
              const pct = totalImpact > 0 ? (total / totalImpact) * 100 : 0
              return (
                <button key={impact}
                  onClick={() => setFilter(filter === impact ? "all" : impact)}
                  className="rounded-2xl p-5 text-left transition-all"
                  style={{
                    background: "var(--bg-card)",
                    border: filter === impact
                      ? `1px solid ${IMPACT_COLOR[impact]}50`
                      : "1px solid var(--border)",
                    borderLeft: `3px solid ${IMPACT_COLOR[impact]}`,
                  }}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
                      Impacto {IMPACT_LABEL[impact]}
                    </span>
                    {filter === impact && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold"
                        style={{ background: `${IMPACT_COLOR[impact]}14`, color: IMPACT_COLOR[impact] }}>
                        FILTRADO
                      </span>
                    )}
                  </div>
                  <p className="text-2xl font-black mb-0.5" style={{ color: IMPACT_COLOR[impact] }}>{count}</p>
                  <p className="text-xs font-medium mb-3" style={{ color: "var(--text-faint)" }}>{fmt(total)}/mês</p>
                  <div className="h-1 rounded-full overflow-hidden" style={{ background: "var(--bg-subtle)" }}>
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: IMPACT_COLOR[impact] }} />
                  </div>
                  <p className="text-[10px] mt-1.5" style={{ color: "var(--text-faint)" }}>{pct.toFixed(0)}% do impacto total</p>
                </button>
              )
            })}
          </div>

          {/* Critical alert banner when high-impact leaks exist */}
          {highCount > 0 && filter === "all" && (
            <div className="flex items-center gap-3 p-4 rounded-xl"
              style={{ background: "rgba(255,77,79,0.06)", border: "1px solid rgba(255,77,79,0.2)" }}>
              <AlertCircle className="w-4 h-4 shrink-0" style={{ color: "#FF4D4F" }} />
              <p className="text-sm flex-1" style={{ color: "var(--text-primary)" }}>
                <span className="font-bold" style={{ color: "#FF4D4F" }}>{highCount} vazamento{highCount > 1 ? "s" : ""} crítico{highCount > 1 ? "s" : ""}</span>
                {" "}com impacto de <span className="font-bold">{fmt(highTotal)}/mês</span> requerem atenção imediata.
              </p>
              <Link href={`/app/analysis/${data.analysis.id}`}
                className="flex items-center gap-1 text-xs font-semibold shrink-0"
                style={{ color: "#FF4D4F" }}>
                Ver plano <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          )}

          {/* Filter + Sort bar */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 rounded-xl p-1"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
              {(["all", "high", "medium", "low"] as const).map((f) => (
                <button key={f} onClick={() => setFilter(f)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                  style={{
                    background: filter === f ? "var(--bg-subtle)" : "transparent",
                    color: filter === f
                      ? (f === "all" ? "var(--text-primary)" : IMPACT_COLOR[f])
                      : "var(--text-muted)",
                    border: filter === f ? `1px solid ${f === "all" ? "var(--border)" : IMPACT_COLOR[f] + "40"}` : "1px solid transparent",
                  }}>
                  {f === "all" ? `Todos (${leaks.length})` : `${IMPACT_LABEL[f]} (${leaks.filter(l => l.impact === f).length})`}
                </button>
              ))}
            </div>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as "amount" | "impact")}
              className="text-xs px-3 py-2 rounded-xl ml-auto outline-none"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-muted)" }}>
              <option value="amount">Maior impacto $</option>
              <option value="impact">Severidade</option>
            </select>
          </div>

          {/* Leak list */}
          <div className="space-y-2.5">
            {filtered.map((leak, idx) => (
              <div key={leak.id} className="rounded-2xl p-5 transition-all"
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                  borderLeft: `3px solid ${IMPACT_COLOR[leak.impact]}`,
                }}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    {/* Rank number */}
                    <div className="flex items-center justify-center w-7 h-7 rounded-lg shrink-0 font-bold text-xs mt-0.5"
                      style={{ background: `${IMPACT_COLOR[leak.impact]}12`, color: IMPACT_COLOR[leak.impact] }}>
                      {idx + 1}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1.5">
                        <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{leak.title}</p>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                          style={{ background: `${IMPACT_COLOR[leak.impact]}14`, color: IMPACT_COLOR[leak.impact] }}>
                          {IMPACT_LABEL[leak.impact]} impacto
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                          style={{ background: "var(--bg-subtle)", color: "var(--text-faint)" }}>
                          {TYPE_LABEL[leak.type] ?? leak.type}
                        </span>
                      </div>
                      <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>{leak.description}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 min-w-[80px]">
                    <p className="text-lg font-black" style={{ color: "#FF4D4F" }}>−{fmt(leak.amount)}</p>
                    <p className="text-[10px]" style={{ color: "var(--text-faint)" }}>por mês</p>
                    <p className="text-[10px] font-semibold mt-0.5" style={{ color: "#FF4D4F", opacity: 0.6 }}>
                      −{fmt(leak.amount * 12)}/ano
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer summary */}
          <div className="rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-3"
            style={{ background: "rgba(255,77,79,0.04)", border: "1px solid rgba(255,77,79,0.12)" }}>
            <div>
              <p className="text-xs font-semibold mb-0.5" style={{ color: "var(--text-muted)" }}>
                {filter === "all" ? "Impacto total dos vazamentos" : `Impacto — ${IMPACT_LABEL[filter]}`}
              </p>
              <p className="text-sm" style={{ color: "var(--text-primary)" }}>
                Resolver {filter === "all" ? "todos" : "estes"} os vazamentos pode economizar{" "}
                <span className="font-black" style={{ color: "#00D084" }}>
                  {fmt(filtered.reduce((s, l) => s + l.amount, 0))} por mês
                </span>
                {" "}·{" "}
                <span className="font-bold" style={{ color: "#00D084" }}>
                  {fmt(filtered.reduce((s, l) => s + l.amount, 0) * 12)} por ano
                </span>
              </p>
            </div>
            <Link href={`/app/analysis/${data.analysis.id}#actions`}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold shrink-0"
              style={{ background: "#00D084", color: "var(--bg-page)" }}>
              Ver plano de ação <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </>
      )}
      {/* Toast de export */}
      {exportToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl"
          style={{ background: "var(--bg-card)", border: "1px solid rgba(0,208,132,0.3)" }}>
          <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: "#00D084" }} />
          <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>CSV exportado com sucesso!</span>
        </div>
      )}
    </div>
  )
}
