"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, TrendingDown, Lightbulb, Bell, ClipboardList, FileText, CheckCircle, Loader2 } from "lucide-react"
import { CardSkeleton } from "@/components/ui/skeletons"
import { PageTransition } from "@/components/ui/page-transition"

function fmt(v: string | number | null) {
  return Number(v ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })
}
function n(v: string | number | null | undefined) { return Number(v ?? 0) }

const IMPACT_COLOR: Record<string, string> = { high: "#FF4D4F", medium: "#F59E0B", low: "#8B8FA8" }
const SEV_COLOR: Record<string, string> = { critical: "#FF4D4F", warning: "#F59E0B", info: "#3B82F6" }

type Analysis = {
  id: string; score: number; status: string
  totalExpenses: string; totalIncome: string; netResult: string
  savingsMin: string; savingsMax: string
  periodStart: string; periodEnd: string
  insights: { id: string; type: string; title: string; description: string; impact: string; urgency: string | null; amount: string | null }[]
  alerts: { id: string; type: string; severity: string; title: string; message: string; amount: string | null }[]
  recommendations: { id: string; title: string; description: string; impact: string | null; urgency: string | null; savingsEstimate: string | null; priority: number }[]
  upload: { fileName: string; rowsCount: number | null } | null
}

function ScoreRing({ score }: { score: number }) {
  const color = score >= 75 ? "#00D084" : score >= 50 ? "#F59E0B" : "#FF4D4F"
  const c = 2 * Math.PI * 44
  return (
    <div className="relative flex items-center justify-center w-24 h-24">
      <svg width="96" height="96" className="-rotate-90">
        <circle cx="48" cy="48" r="44" fill="none" stroke="#2A2D3A" strokeWidth="6" />
        <circle cx="48" cy="48" r="44" fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={c} strokeDashoffset={c - (score / 100) * c} strokeLinecap="round" />
      </svg>
      <div className="absolute text-center">
        <p className="text-xl font-black leading-none" style={{ color }}>{score}</p>
        <p className="text-[9px]" style={{ color: "#4B4F6A" }}>score</p>
      </div>
    </div>
  )
}

export default function AnalysisPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [analysis, setAnalysis] = useState<Analysis | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<"leaks" | "opportunities" | "alerts" | "actions">("leaks")
  const [exporting, setExporting] = useState(false)
  const [aiInsight, setAiInsight] = useState<string | null>(null)
  const [loadingInsight, setLoadingInsight] = useState(false)
  const [benchmarks, setBenchmarks] = useState<{ label: string; actual: number; benchmark: number; suffix: string; betterWhenHigher: boolean }[] | null>(null)

  async function exportPdf() {
    if (!analysis || exporting) return
    setExporting(true)
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ analysisId: analysis.id }),
      })
      const { reportId } = await res.json()
      const link = document.createElement("a")
      link.href = `/api/reports/${reportId}`
      link.download = `relatorio-lucro-oculto.pdf`
      link.click()
    } catch {
      // silently fail
    } finally {
      setExporting(false)
    }
  }

  useEffect(() => {
    if (!analysis) return
    fetch(`/api/app/benchmarks?analysisId=${analysis.id}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => d?.comparisons && setBenchmarks(d.comparisons))
      .catch(() => null)
  }, [analysis?.id])

  useEffect(() => {
    if (!analysis) return
    setLoadingInsight(true)
    fetch("/api/ai/insights", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ analysisId: analysis.id }),
    })
      .then(r => r.ok ? r.json() : null)
      .then(d => d?.insight && setAiInsight(d.insight))
      .catch(() => null)
      .finally(() => setLoadingInsight(false))
  }, [analysis?.id])

  useEffect(() => {
    if (!id) return
    fetch(`/api/app/analyses/${id}`).then(r => {
      if (!r.ok) { router.push("/app/history"); return null }
      return r.json()
    }).then(d => d && setAnalysis(d))
      .catch(() => router.push("/app/history"))
      .finally(() => setLoading(false))
  }, [id, router])

  if (loading) return (
    <div className="px-6 py-8 space-y-4">
      <CardSkeleton rows={1} /><CardSkeleton /><CardSkeleton />
    </div>
  )
  if (!analysis) return null

  const a = analysis
  const leaks = a.insights.filter(i => i.type === "leak")
  const opps = a.insights.filter(i => i.type === "opportunity")
  const fmtPeriod = (d: string) => new Date(d).toLocaleDateString("pt-BR", { month: "short", year: "numeric" })

  const TABS = [
    { id: "leaks" as const, label: "Vazamentos", count: leaks.length, color: "#FF4D4F" },
    { id: "opportunities" as const, label: "Oportunidades", count: opps.length, color: "#00D084" },
    { id: "alerts" as const, label: "Alertas", count: a.alerts.length, color: "#F59E0B" },
    { id: "actions" as const, label: "Plano de ação", count: a.recommendations.length, color: "#3B82F6" },
  ]

  return (
    <PageTransition>
    <div className="px-6 py-8 space-y-6">
      {/* Back */}
      <Link href="/app/history" className="inline-flex items-center gap-2 text-sm"
        style={{ color: "#8B8FA8" }}>
        <ArrowLeft className="w-4 h-4" /> Voltar ao histórico
      </Link>

      {/* Header */}
      <div className="rounded-2xl p-6" style={{ background: "#1A1D27", border: "1px solid #2A2D3A" }}>
        <div className="flex items-start gap-6">
          <ScoreRing score={a.score ?? 0} />
          <div className="flex-1 min-w-0">
            <p className="text-lg font-black mb-1" style={{ color: "#F4F4F5" }}>
              {a.upload?.fileName ?? "Análise"}
            </p>
            <p className="text-sm mb-4" style={{ color: "#8B8FA8" }}>
              {a.periodStart ? `${fmtPeriod(a.periodStart)} — ${fmtPeriod(a.periodEnd)}` : "—"}
              {a.upload?.rowsCount && ` · ${a.upload.rowsCount.toLocaleString("pt-BR")} transações`}
            </p>
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: "Despesas", value: fmt(a.totalExpenses), color: "#FF4D4F" },
                { label: "Receita", value: fmt(a.totalIncome), color: "#00D084" },
                { label: "Resultado", value: fmt(a.netResult), color: n(a.netResult) >= 0 ? "#00D084" : "#FF4D4F" },
                { label: "Economia est.", value: `até ${fmt(a.savingsMax)}/mês`, color: "#F59E0B" },
              ].map(({ label, value, color }) => (
                <div key={label} className="rounded-xl p-3" style={{ background: "#212435" }}>
                  <p className="text-xs mb-1" style={{ color: "#4B4F6A" }}>{label}</p>
                  <p className="text-sm font-bold truncate" style={{ color }}>{value}</p>
                </div>
              ))}
            </div>
          </div>
          <button onClick={exportPdf} disabled={exporting}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold shrink-0 disabled:opacity-60"
            style={{ background: "#212435", color: "#8B8FA8", border: "1px solid #2A2D3A" }}>
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
            {exporting ? "Gerando..." : "Exportar PDF"}
          </button>
        </div>
      </div>

      {/* Benchmarks por Setor */}
      {benchmarks && benchmarks.length > 0 && (
        <div className="rounded-2xl p-5" style={{ background: "#1A1D27", border: "1px solid #2A2D3A" }}>
          <p className="text-xs font-semibold mb-4" style={{ color: "#4B4F6A", textTransform: "uppercase", letterSpacing: "1px" }}>
            Comparativo com o Setor
          </p>
          <div className="grid grid-cols-3 gap-3">
            {benchmarks.map(b => {
              const isGood = b.betterWhenHigher ? b.actual >= b.benchmark * 0.9 : b.actual <= b.benchmark * 1.1
              const color = isGood ? "#00D084" : b.actual >= b.benchmark * 0.7 ? "#F59E0B" : "#FF4D4F"
              return (
                <div key={b.label} className="rounded-xl p-3" style={{ background: "#212435" }}>
                  <p className="text-[10px] mb-1.5" style={{ color: "#4B4F6A" }}>{b.label}</p>
                  <p className="text-sm font-bold" style={{ color }}>{b.actual.toFixed(1)}{b.suffix}</p>
                  <p className="text-[10px] mt-0.5" style={{ color: "#4B4F6A" }}>Setor: {b.benchmark.toFixed(1)}{b.suffix}</p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* AI Insight */}
      {(aiInsight || loadingInsight) && (
        <div className="rounded-2xl p-5" style={{ background: "linear-gradient(135deg, rgba(59,130,246,0.08) 0%, rgba(0,208,132,0.05) 100%)", border: "1px solid rgba(59,130,246,0.2)" }}>
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-sm" style={{ background: "rgba(59,130,246,0.15)", color: "#3B82F6" }}>✦</div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold mb-1.5" style={{ color: "#3B82F6" }}>Diagnóstico por IA</p>
              {loadingInsight ? (
                <div className="space-y-2">
                  <div className="h-3 rounded-full animate-pulse w-full" style={{ background: "#2A2D3A" }} />
                  <div className="h-3 rounded-full animate-pulse w-4/5" style={{ background: "#2A2D3A" }} />
                  <div className="h-3 rounded-full animate-pulse w-3/5" style={{ background: "#2A2D3A" }} />
                </div>
              ) : (
                <p className="text-sm leading-relaxed" style={{ color: "#8B8FA8" }}>{aiInsight}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {TABS.map(({ id: tid, label, count, color }) => (
          <button key={tid} onClick={() => setTab(tid)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
            style={{
              background: tab === tid ? `${color}14` : "#1A1D27",
              border: tab === tid ? `1px solid ${color}40` : "1px solid #2A2D3A",
              color: tab === tid ? color : "#8B8FA8",
            }}>
            {label}
            <span className="text-xs font-bold px-1.5 py-0.5 rounded-full"
              style={{ background: tab === tid ? `${color}20` : "#212435", color: tab === tid ? color : "#4B4F6A" }}>
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="space-y-3">
        {tab === "leaks" && (
          leaks.length === 0 ? (
            <p className="text-sm py-8 text-center" style={{ color: "#4B4F6A" }}>Nenhum vazamento detectado</p>
          ) : leaks.map(leak => (
            <div key={leak.id} className="rounded-2xl p-5" style={{ background: "#1A1D27", border: "1px solid #2A2D3A" }}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <TrendingDown className="w-4 h-4 shrink-0 mt-0.5" style={{ color: IMPACT_COLOR[leak.impact] ?? "#8B8FA8" }} />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="text-sm font-semibold" style={{ color: "#F4F4F5" }}>{leak.title}</p>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                        style={{ background: `${IMPACT_COLOR[leak.impact] ?? "#8B8FA8"}14`, color: IMPACT_COLOR[leak.impact] ?? "#8B8FA8" }}>
                        {leak.impact === "high" ? "Alto" : leak.impact === "medium" ? "Médio" : "Baixo"}
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed" style={{ color: "#8B8FA8" }}>{leak.description}</p>
                  </div>
                </div>
                {leak.amount && (
                  <div className="text-right shrink-0">
                    <p className="text-base font-black" style={{ color: "#FF4D4F" }}>−{fmt(leak.amount)}</p>
                    <p className="text-xs" style={{ color: "#4B4F6A" }}>por mês</p>
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        {tab === "opportunities" && (
          opps.length === 0 ? (
            <p className="text-sm py-8 text-center" style={{ color: "#4B4F6A" }}>Nenhuma oportunidade identificada</p>
          ) : opps.map(opp => (
            <div key={opp.id} className="rounded-2xl p-5" style={{ background: "#1A1D27", border: "1px solid #2A2D3A" }}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <Lightbulb className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "#00D084" }} />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold mb-1" style={{ color: "#F4F4F5" }}>{opp.title}</p>
                    <p className="text-xs leading-relaxed" style={{ color: "#8B8FA8" }}>{opp.description}</p>
                  </div>
                </div>
                {opp.amount && (
                  <div className="text-right shrink-0">
                    <p className="text-base font-black" style={{ color: "#00D084" }}>+{fmt(opp.amount)}</p>
                    <p className="text-xs" style={{ color: "#4B4F6A" }}>por mês</p>
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        {tab === "alerts" && (
          a.alerts.length === 0 ? (
            <p className="text-sm py-8 text-center" style={{ color: "#4B4F6A" }}>Nenhum alerta registrado</p>
          ) : a.alerts.map(alert => (
            <div key={alert.id} className="rounded-2xl p-5"
              style={{
                background: `${SEV_COLOR[alert.severity] ?? "#8B8FA8"}08`,
                border: `1px solid ${SEV_COLOR[alert.severity] ?? "#8B8FA8"}25`,
              }}>
              <div className="flex items-start gap-3">
                <Bell className="w-4 h-4 shrink-0 mt-0.5" style={{ color: SEV_COLOR[alert.severity] ?? "#8B8FA8" }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="text-sm font-semibold" style={{ color: "#F4F4F5" }}>{alert.title}</p>
                    {alert.amount && (
                      <p className="text-sm font-bold shrink-0" style={{ color: SEV_COLOR[alert.severity] ?? "#8B8FA8" }}>
                        {fmt(alert.amount)}
                      </p>
                    )}
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: "#8B8FA8" }}>{alert.message}</p>
                </div>
              </div>
            </div>
          ))
        )}

        {tab === "actions" && (
          a.recommendations.length === 0 ? (
            <p className="text-sm py-8 text-center" style={{ color: "#4B4F6A" }}>Nenhuma recomendação gerada</p>
          ) : a.recommendations.map((rec, i) => (
            <div key={rec.id} className="rounded-2xl p-5" style={{ background: "#1A1D27", border: "1px solid #2A2D3A" }}>
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-7 h-7 rounded-lg shrink-0 font-bold text-xs"
                  style={{ background: "#212435", color: "#4B4F6A" }}>
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="text-sm font-semibold" style={{ color: "#F4F4F5" }}>{rec.title}</p>
                    {rec.savingsEstimate && (
                      <p className="text-sm font-black shrink-0" style={{ color: "#00D084" }}>
                        +{fmt(rec.savingsEstimate)}/mês
                      </p>
                    )}
                  </div>
                  <p className="text-xs leading-relaxed mb-2" style={{ color: "#8B8FA8" }}>{rec.description}</p>
                  <div className="flex items-center gap-2">
                    {rec.urgency && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                        style={{
                          background: rec.urgency === "immediate" ? "rgba(255,77,79,0.1)" : "rgba(245,158,11,0.1)",
                          color: rec.urgency === "immediate" ? "#FF4D4F" : "#F59E0B",
                        }}>
                        {rec.urgency === "immediate" ? "Imediato" : rec.urgency === "soon" ? "Em breve" : "Monitorar"}
                      </span>
                    )}
                    <ClipboardList className="w-3.5 h-3.5" style={{ color: "#4B4F6A" }} />
                  </div>
                </div>
                <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" style={{ color: "#2A2D3A" }} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
    </PageTransition>
  )
}
