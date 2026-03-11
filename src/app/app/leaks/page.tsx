"use client"

import { useState } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { TrendingDown, Filter, Upload, Download } from "lucide-react"
import { useAnalysisData } from "@/hooks/useAnalysisData"
import { CardSkeleton } from "@/components/ui/skeletons"
import { can } from "@/lib/roles"

const IMPACT_COLOR: Record<string, string> = { high: "#FF4D4F", medium: "#F59E0B", low: "#8B8FA8" }
const IMPACT_LABEL: Record<string, string> = { high: "Alto", medium: "Médio", low: "Baixo" }
const TYPE_LABEL: Record<string, string> = {
  subscription: "Assinatura",
  overlap: "Sobreposição",
  anomaly: "Anomalia",
  duplicate: "Duplicata",
  concentration: "Concentração",
}

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })
}

type Impact = "high" | "medium" | "low"

export default function LeaksPage() {
  const { data, loading } = useAnalysisData()
  const { data: session } = useSession()
  const canUpload = can(session?.user?.role ?? "", "upload:create")
  const [filter, setFilter] = useState<Impact | "all">("all")
  const [sortBy, setSortBy] = useState<"amount" | "impact">("amount")

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
          <h1 className="text-2xl font-black" style={{ color: "#F4F4F5" }}>Vazamentos detectados</h1>
        </div>
        <div className="rounded-2xl p-12 text-center" style={{ background: "#1A1D27", border: "1px solid #2A2D3A" }}>
          <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: "rgba(255,77,79,0.08)", border: "1px solid rgba(255,77,79,0.15)" }}>
            <TrendingDown className="w-8 h-8" style={{ color: "#FF4D4F" }} />
          </div>
          <p className="text-base font-bold mb-1" style={{ color: "#F4F4F5" }}>Nenhum vazamento detectado</p>
          <p className="text-sm mb-2" style={{ color: "#8B8FA8" }}>
            {canUpload ? "Faça upload do extrato para descobrir onde seu lucro está escapando." : "Aguardando análise — o responsável pelo upload ainda não enviou dados."}
          </p>
          <p className="text-xs mb-6 px-4" style={{ color: "#4B4F6A" }}>Empresas que usam o Lucro Oculto economizam em média <span style={{ color: "#00D084", fontWeight: 700 }}>R$4.800/mês</span></p>
          {canUpload && (
            <Link href="/app/upload" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm" style={{ background: "#00D084", color: "#0F1117" }}>
              <Upload className="w-4 h-4" />
              Fazer primeiro upload
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

  return (
    <div className="px-6 py-8">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black" style={{ color: "#F4F4F5" }}>Vazamentos detectados</h1>
          <p className="text-sm mt-0.5" style={{ color: "#8B8FA8" }}>
            {leaks.length} vazamentos com impacto estimado de {formatCurrency(totalImpact)}/mês
          </p>
        </div>
        {leaks.length > 0 && (
          <a
            href="/api/app/export?type=leaks"
            download
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium shrink-0"
            style={{ background: "#212435", color: "#8B8FA8", border: "1px solid #2A2D3A" }}
          >
            <Download className="w-4 h-4" />
            Exportar CSV
          </a>
        )}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {(["high", "medium", "low"] as Impact[]).map((impact) => {
          const count = leaks.filter((l) => l.impact === impact).length
          const total = leaks.filter((l) => l.impact === impact).reduce((s, l) => s + l.amount, 0)
          return (
            <div key={impact} className="rounded-2xl p-4" style={{ background: "#1A1D27", border: "1px solid #2A2D3A" }}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full" style={{ background: IMPACT_COLOR[impact] }} />
                <span className="text-xs font-medium" style={{ color: "#8B8FA8" }}>Impacto {IMPACT_LABEL[impact]}</span>
              </div>
              <p className="text-xl font-black" style={{ color: IMPACT_COLOR[impact] }}>{count}</p>
              <p className="text-xs mt-0.5" style={{ color: "#4B4F6A" }}>{formatCurrency(total)}/mês</p>
            </div>
          )
        })}
      </div>

      {leaks.length === 0 ? (
        <div className="rounded-2xl p-10 text-center" style={{ background: "#1A1D27", border: "1px solid #2A2D3A" }}>
          <TrendingDown className="w-10 h-10 mx-auto mb-3" style={{ color: "#2A2D3A" }} />
          <p className="text-sm font-medium" style={{ color: "#8B8FA8" }}>Nenhum vazamento detectado</p>
          <p className="text-xs mt-1" style={{ color: "#4B4F6A" }}>Sua situação financeira está saudável 🎉</p>
        </div>
      ) : (
        <>
          {/* Filter + Sort */}
          <div className="flex items-center gap-2 mb-5 flex-wrap">
            <Filter className="w-4 h-4" style={{ color: "#4B4F6A" }} />
            {(["all", "high", "medium", "low"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={{
                  background: filter === f ? "rgba(0,208,132,0.1)" : "#1A1D27",
                  border: filter === f ? "1px solid #00D084" : "1px solid #2A2D3A",
                  color: filter === f ? "#00D084" : "#8B8FA8",
                }}
              >
                {f === "all" ? "Todos" : IMPACT_LABEL[f]}
              </button>
            ))}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "amount" | "impact")}
              className="text-xs px-3 py-1.5 rounded-lg border ml-auto outline-none"
              style={{ background: "#212435", border: "1px solid #2A2D3A", color: "#8B8FA8" }}
            >
              <option value="amount">Maior impacto $</option>
              <option value="impact">Severidade</option>
            </select>
          </div>

          {/* List */}
          <div className="space-y-3">
            {filtered.map((leak) => (
              <div key={leak.id} className="rounded-2xl p-5" style={{ background: "#1A1D27", border: "1px solid #2A2D3A" }}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div
                      className="flex items-center justify-center w-10 h-10 rounded-xl shrink-0"
                      style={{ background: `${IMPACT_COLOR[leak.impact]}14` }}
                    >
                      <TrendingDown className="w-5 h-5" style={{ color: IMPACT_COLOR[leak.impact] }} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <p className="text-sm font-semibold" style={{ color: "#F4F4F5" }}>{leak.title}</p>
                        <span
                          className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                          style={{ background: `${IMPACT_COLOR[leak.impact]}14`, color: IMPACT_COLOR[leak.impact] }}
                        >
                          {IMPACT_LABEL[leak.impact]}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ background: "#212435", color: "#8B8FA8" }}>
                          {TYPE_LABEL[leak.type] ?? leak.type}
                        </span>
                      </div>
                      <p className="text-xs leading-relaxed" style={{ color: "#8B8FA8" }}>{leak.description}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-lg font-black" style={{ color: "#FF4D4F" }}>−{formatCurrency(leak.amount)}</p>
                    <p className="text-xs" style={{ color: "#4B4F6A" }}>por mês</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
