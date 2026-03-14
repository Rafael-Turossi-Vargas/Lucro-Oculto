"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft, TrendingDown, Lightbulb, Bell, ClipboardList,
  FileText, CheckCircle, Loader2, X, HelpCircle, Printer,
} from "lucide-react"
import { CardSkeleton } from "@/components/ui/skeletons"
import { PageTransition } from "@/components/ui/page-transition"

function fmt(v: string | number | null) {
  return Number(v ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })
}
function n(v: string | number | null | undefined) { return Number(v ?? 0) }

const IMPACT_COLOR: Record<string, string> = { high: "#FF4D4F", medium: "#F59E0B", low: "var(--text-muted)" }
const SEV_COLOR: Record<string, string> = { critical: "#FF4D4F", warning: "#F59E0B", info: "#3B82F6" }

const SUBSCORE_LABELS: Record<string, string> = {
  subscriptions: "Assinaturas recorrentes",
  vendors: "Concentração de fornecedores",
  recurring: "Padrões de recorrência",
  concentration: "Concentração de gastos",
  cashflow: "Fluxo de caixa",
}

type Analysis = {
  id: string; score: number; status: string
  totalExpenses: string; totalIncome: string; netResult: string
  savingsMin: string; savingsMax: string
  periodStart: string; periodEnd: string
  insights: { id: string; type: string; title: string; description: string; impact: string; urgency: string | null; amount: string | null }[]
  alerts: { id: string; type: string; severity: string; title: string; message: string; amount: string | null }[]
  recommendations: { id: string; title: string; description: string; impact: string | null; urgency: string | null; savingsEstimate: string | null; priority: number }[]
  scoreSnapshots: { subscores: Record<string, number> | null }[]
  upload: { fileName: string; rowsCount: number | null } | null
}

function ScoreRing({ score }: { score: number }) {
  const color = score >= 75 ? "#00D084" : score >= 50 ? "#F59E0B" : "#FF4D4F"
  const c = 2 * Math.PI * 44
  return (
    <div className="relative flex items-center justify-center w-24 h-24">
      <svg width="96" height="96" className="-rotate-90">
        <circle cx="48" cy="48" r="44" fill="none" stroke="var(--border)" strokeWidth="6" />
        <circle cx="48" cy="48" r="44" fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={c} strokeDashoffset={c - (score / 100) * c} strokeLinecap="round" />
      </svg>
      <div className="absolute text-center">
        <p className="text-xl font-black leading-none" style={{ color }}>{score}</p>
        <p className="text-[9px]" style={{ color: "var(--text-faint)" }}>score</p>
      </div>
    </div>
  )
}

// ── Item 9: Score explained modal ─────────────────────────────────────────────
function ScoreModal({ score, subscores, onClose }: {
  score: number
  subscores: Record<string, number> | null
  onClose: () => void
}) {
  const color = score >= 75 ? "#00D084" : score >= 50 ? "#F59E0B" : "#FF4D4F"
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}>
      <div className="rounded-2xl p-6 w-full max-w-sm mx-4" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>Composição do Score</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[var(--bg-subtle)] transition-colors" style={{ color: "var(--text-muted)" }}>
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex justify-center mb-6">
          <div className="text-center">
            <p className="text-5xl font-black" style={{ color }}>{score}</p>
            <p className="text-xs mt-1" style={{ color: "var(--text-faint)" }}>
              {score >= 75 ? "Saúde financeira boa" : score >= 50 ? "Atenção necessária" : "Situação crítica"}
            </p>
          </div>
        </div>
        {subscores && Object.keys(subscores).length > 0 ? (
          <div className="space-y-3.5">
            {Object.entries(subscores).map(([key, val]) => {
              const c2 = val >= 75 ? "#00D084" : val >= 50 ? "#F59E0B" : "#FF4D4F"
              return (
                <div key={key}>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>{SUBSCORE_LABELS[key] ?? key}</span>
                    <span className="text-xs font-bold" style={{ color: c2 }}>{val}/100</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--bg-subtle)" }}>
                    <div className="h-full rounded-full" style={{ width: `${val}%`, background: c2, transition: "width 0.8s ease" }} />
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-sm text-center py-4" style={{ color: "var(--text-faint)" }}>
            Dados de subscore não disponíveis para esta análise.
          </p>
        )}
        <p className="text-[10px] mt-5" style={{ color: "var(--text-faint)" }}>
          O score combina 5 dimensões de saúde financeira. Cada subscore pode ser melhorado implementando as recomendações do Plano de Ação.
        </p>
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
  const [scoreModal, setScoreModal] = useState(false)

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

  // ── Item 14: Print mode ──────────────────────────────────────────────────
  function handlePrint() {
    window.print()
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
    <div className="px-4 sm:px-6 py-6 sm:py-8 space-y-4">
      <CardSkeleton rows={1} /><CardSkeleton /><CardSkeleton />
    </div>
  )
  if (!analysis) return null

  const a = analysis
  const leaks = a.insights.filter(i => i.type === "leak")
  const opps = a.insights.filter(i => i.type === "opportunity")
  const fmtPeriod = (d: string) => new Date(d).toLocaleDateString("pt-BR", { month: "short", year: "numeric" })
  const subscores = a.scoreSnapshots?.[0]?.subscores ?? null

  const TABS = [
    { id: "leaks" as const, label: "Vazamentos", count: leaks.length, color: "#FF4D4F", icon: TrendingDown },
    { id: "opportunities" as const, label: "Oportunidades", count: opps.length, color: "#00D084", icon: Lightbulb },
    { id: "alerts" as const, label: "Alertas", count: a.alerts.length, color: "#F59E0B", icon: Bell },
    { id: "actions" as const, label: "Plano de ação", count: a.recommendations.length, color: "#3B82F6", icon: ClipboardList },
  ]

  return (
    <>
      {/* ── Item 14: Print CSS ──────────────────────────────────────────── */}
      <style>{`
        @media print {
          aside, nav, [data-no-print] { display: none !important; }
          body { background: white !important; color: black !important; }
          .rounded-2xl { border-radius: 8px !important; border: 1px solid #ddd !important; }
        }
      `}</style>

      {/* ── Item 9: Score modal ──────────────────────────────────────────── */}
      {scoreModal && (
        <ScoreModal score={a.score ?? 0} subscores={subscores} onClose={() => setScoreModal(false)} />
      )}

      <PageTransition>
      <div className="px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Back */}
        <div className="flex items-center justify-between" data-no-print>
          <Link href="/app/history" className="inline-flex items-center gap-2 text-sm"
            style={{ color: "var(--text-muted)" }}>
            <ArrowLeft className="w-4 h-4" /> Voltar ao histórico
          </Link>
          {/* ── Item 14: Print button ─────────────────────────────────── */}
          <button onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors hover:opacity-80"
            style={{ background: "var(--bg-subtle)", color: "var(--text-muted)", border: "1px solid var(--border)" }}>
            <Printer className="w-3.5 h-3.5" /> Imprimir
          </button>
        </div>

        {/* Header */}
        <div className="rounded-2xl p-6" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
            {/* ── Item 9: Score ring with ? button ─────────────────────── */}
            <div className="flex flex-row sm:flex-col items-center gap-4 sm:gap-2 shrink-0">
              <ScoreRing score={a.score ?? 0} />
              <button onClick={() => setScoreModal(true)}
                className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-lg transition-colors hover:opacity-80"
                style={{ background: "var(--bg-subtle)", color: "var(--text-faint)", border: "1px solid var(--border)" }}>
                <HelpCircle className="w-3 h-3" /> Como é calculado?
              </button>
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-lg font-black mb-1" style={{ color: "var(--text-primary)" }}>
                {a.upload?.fileName ?? "Análise"}
              </p>
              <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>
                {a.periodStart ? `${fmtPeriod(a.periodStart)} — ${fmtPeriod(a.periodEnd)}` : "—"}
                {a.upload?.rowsCount && ` · ${a.upload.rowsCount.toLocaleString("pt-BR")} transações`}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Despesas", value: fmt(a.totalExpenses), color: "#FF4D4F" },
                  { label: "Receita", value: fmt(a.totalIncome), color: "#00D084" },
                  { label: "Resultado", value: fmt(a.netResult), color: n(a.netResult) >= 0 ? "#00D084" : "#FF4D4F" },
                  { label: "Economia est.", value: `até ${fmt(a.savingsMax)}/mês`, color: "#F59E0B" },
                ].map(({ label, value, color }) => (
                  <div key={label} className="rounded-xl p-3" style={{ background: "var(--bg-subtle)" }}>
                    <p className="text-xs mb-1" style={{ color: "var(--text-faint)" }}>{label}</p>
                    <p className="text-sm font-bold truncate" style={{ color }}>{value}</p>
                  </div>
                ))}
              </div>
            </div>
            <button onClick={exportPdf} disabled={exporting} data-no-print
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold self-start disabled:opacity-60"
              style={{ background: "var(--bg-subtle)", color: "var(--text-muted)", border: "1px solid var(--border)" }}>
              {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
              {exporting ? "Gerando..." : "Exportar PDF"}
            </button>
          </div>
        </div>

        {/* Benchmarks por Setor */}
        {benchmarks && benchmarks.length > 0 && (
          <div className="rounded-2xl p-5" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
            <p className="text-xs font-semibold mb-4" style={{ color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "1px" }}>
              Comparativo com o Setor
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {benchmarks.map(b => {
                const isGood = b.betterWhenHigher ? b.actual >= b.benchmark * 0.9 : b.actual <= b.benchmark * 1.1
                const color = isGood ? "#00D084" : b.actual >= b.benchmark * 0.7 ? "#F59E0B" : "#FF4D4F"
                return (
                  <div key={b.label} className="rounded-xl p-3" style={{ background: "var(--bg-subtle)", borderLeft: `3px solid ${color}` }}>
                    <p className="text-[10px] mb-1.5" style={{ color: "var(--text-faint)" }}>{b.label}</p>
                    <p className="text-sm font-bold" style={{ color }}>{b.actual.toFixed(1)}{b.suffix}</p>
                    <p className="text-[10px] mt-0.5" style={{ color: "var(--text-faint)" }}>Setor: {b.benchmark.toFixed(1)}{b.suffix}</p>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── Item 6: AI Insight with signature ──────────────────────────── */}
        {(aiInsight || loadingInsight) && (
          <div className="rounded-2xl p-5" style={{ background: "linear-gradient(135deg, rgba(59,130,246,0.08) 0%, rgba(0,208,132,0.05) 100%)", border: "1px solid rgba(59,130,246,0.2)" }}>
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-sm" style={{ background: "rgba(59,130,246,0.15)", color: "#3B82F6" }}>✦</div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold mb-1.5" style={{ color: "#3B82F6" }}>Diagnóstico por IA</p>
                {loadingInsight ? (
                  <div className="space-y-2">
                    <div className="h-3 rounded-full animate-pulse w-full" style={{ background: "var(--border)" }} />
                    <div className="h-3 rounded-full animate-pulse w-4/5" style={{ background: "var(--border)" }} />
                    <div className="h-3 rounded-full animate-pulse w-3/5" style={{ background: "var(--border)" }} />
                  </div>
                ) : (
                  <>
                    <p className="text-sm leading-relaxed mb-3" style={{ color: "var(--text-muted)" }}>{aiInsight}</p>
                    <div className="flex items-center gap-3 pt-3" style={{ borderTop: "1px solid rgba(59,130,246,0.1)" }}>
                      <span className="text-[10px]" style={{ color: "var(--text-faint)" }}>
                        Baseado em {a.upload?.rowsCount?.toLocaleString("pt-BR") ?? "—"} transações
                      </span>
                      <span className="text-[10px]" style={{ color: "var(--border)" }}>·</span>
                      <span className="text-[10px]" style={{ color: "var(--text-faint)" }}>
                        {a.periodStart ? `${new Date(a.periodStart).toLocaleDateString("pt-BR", { month: "short", year: "numeric" })} — ${new Date(a.periodEnd).toLocaleDateString("pt-BR", { month: "short", year: "numeric" })}` : "—"}
                      </span>
                      <span className="text-[10px]" style={{ color: "var(--border)" }}>·</span>
                      <span className="text-[10px]" style={{ color: "var(--text-faint)" }}>Modelo CFO-AI v2</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Item 13: Tabs ────────────────────────────────────────────────── */}
        <div className="flex gap-2 flex-wrap" data-no-print>
          {TABS.map(({ id: tid, label, count, color }) => (
            <button key={tid} onClick={() => setTab(tid)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
              style={{
                background: tab === tid ? `${color}14` : "var(--bg-card)",
                border: tab === tid ? `1px solid ${color}40` : "1px solid var(--border)",
                color: tab === tid ? color : "var(--text-muted)",
              }}>
              {label}
              <span className="text-xs font-bold px-1.5 py-0.5 rounded-full"
                style={{ background: tab === tid ? `${color}20` : "var(--bg-subtle)", color: tab === tid ? color : "var(--text-faint)" }}>
                {count}
              </span>
            </button>
          ))}
        </div>

        {/* ── Item 13: Tab content with fade animation (key triggers remount) */}
        <div key={tab} style={{ animation: "fadeIn 0.2s ease" }} className="space-y-3">
          <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }`}</style>

          {tab === "leaks" && (
            leaks.length === 0 ? (
              <p className="text-sm py-8 text-center" style={{ color: "var(--text-faint)" }}>Nenhum vazamento detectado</p>
            ) : leaks.map(leak => (
              // ── Item 15: Left border on cards ──────────────────────────
              <div key={leak.id} className="rounded-2xl p-5"
                style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderLeft: `3px solid ${IMPACT_COLOR[leak.impact] ?? "var(--text-muted)"}` }}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <TrendingDown className="w-4 h-4 shrink-0 mt-0.5" style={{ color: IMPACT_COLOR[leak.impact] ?? "var(--text-muted)" }} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{leak.title}</p>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                          style={{ background: `${IMPACT_COLOR[leak.impact] ?? "var(--text-muted)"}14`, color: IMPACT_COLOR[leak.impact] ?? "var(--text-muted)" }}>
                          {leak.impact === "high" ? "Alto impacto" : leak.impact === "medium" ? "Médio impacto" : "Baixo impacto"}
                        </span>
                      </div>
                      <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>{leak.description}</p>
                    </div>
                  </div>
                  {leak.amount && (
                    <div className="text-right shrink-0">
                      <p className="text-base font-black" style={{ color: "#FF4D4F" }}>−{fmt(leak.amount)}</p>
                      <p className="text-xs" style={{ color: "var(--text-faint)" }}>por mês</p>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}

          {tab === "opportunities" && (
            opps.length === 0 ? (
              <p className="text-sm py-8 text-center" style={{ color: "var(--text-faint)" }}>Nenhuma oportunidade identificada</p>
            ) : opps.map(opp => {
              // ── Item 8: Annualized ROI ────────────────────────────────
              const monthly = n(opp.amount)
              const annual = monthly * 12
              return (
                <div key={opp.id} className="rounded-2xl p-5"
                  style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderLeft: "3px solid #00D084" }}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <Lightbulb className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "#00D084" }} />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold mb-1" style={{ color: "var(--text-primary)" }}>{opp.title}</p>
                        <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>{opp.description}</p>
                      </div>
                    </div>
                    {opp.amount && (
                      <div className="text-right shrink-0">
                        <p className="text-base font-black" style={{ color: "#00D084" }}>+{fmt(opp.amount)}</p>
                        <p className="text-xs" style={{ color: "var(--text-faint)" }}>por mês</p>
                        {annual > 0 && (
                          <p className="text-[10px] mt-0.5 font-semibold" style={{ color: "#00D084", opacity: 0.7 }}>
                            = {fmt(annual)}/ano
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            })
          )}

          {tab === "alerts" && (
            a.alerts.length === 0 ? (
              <p className="text-sm py-8 text-center" style={{ color: "var(--text-faint)" }}>Nenhum alerta registrado</p>
            ) : a.alerts.map(alert => (
              <div key={alert.id} className="rounded-2xl p-5"
                style={{
                  background: `${SEV_COLOR[alert.severity] ?? "var(--text-muted)"}08`,
                  border: `1px solid ${SEV_COLOR[alert.severity] ?? "var(--text-muted)"}25`,
                  borderLeft: `3px solid ${SEV_COLOR[alert.severity] ?? "var(--text-muted)"}`,
                }}>
                <div className="flex items-start gap-3">
                  <Bell className="w-4 h-4 shrink-0 mt-0.5" style={{ color: SEV_COLOR[alert.severity] ?? "var(--text-muted)" }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{alert.title}</p>
                      {alert.amount && (
                        <p className="text-sm font-bold shrink-0" style={{ color: SEV_COLOR[alert.severity] ?? "var(--text-muted)" }}>
                          {fmt(alert.amount)}
                        </p>
                      )}
                    </div>
                    <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>{alert.message}</p>
                  </div>
                </div>
              </div>
            ))
          )}

          {tab === "actions" && (
            a.recommendations.length === 0 ? (
              <p className="text-sm py-8 text-center" style={{ color: "var(--text-faint)" }}>Nenhuma recomendação gerada</p>
            ) : a.recommendations.map((rec, i) => (
              <div key={rec.id} className="rounded-2xl p-5"
                style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderLeft: "3px solid #3B82F6" }}>
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-7 h-7 rounded-lg shrink-0 font-bold text-xs"
                    style={{ background: "rgba(59,130,246,0.1)", color: "#3B82F6", border: "1px solid rgba(59,130,246,0.2)" }}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{rec.title}</p>
                      {rec.savingsEstimate && n(rec.savingsEstimate) > 0 && (
                        <div className="text-right shrink-0">
                          <p className="text-sm font-black" style={{ color: "#00D084" }}>
                            +{fmt(rec.savingsEstimate)}/mês
                          </p>
                          <p className="text-[10px]" style={{ color: "#00D084", opacity: 0.6 }}>
                            = {fmt(n(rec.savingsEstimate) * 12)}/ano
                          </p>
                        </div>
                      )}
                    </div>
                    <p className="text-xs leading-relaxed mb-2" style={{ color: "var(--text-muted)" }}>{rec.description}</p>
                    <div className="flex items-center gap-2">
                      {rec.urgency && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                          style={{
                            background: rec.urgency === "immediate" ? "rgba(255,77,79,0.1)" : rec.urgency === "soon" ? "rgba(245,158,11,0.1)" : "rgba(59,130,246,0.08)",
                            color: rec.urgency === "immediate" ? "#FF4D4F" : rec.urgency === "soon" ? "#F59E0B" : "#3B82F6",
                          }}>
                          {rec.urgency === "immediate" ? "Imediato" : rec.urgency === "soon" ? "Em breve" : "Monitorar"}
                        </span>
                      )}
                    </div>
                  </div>
                  <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" style={{ color: "var(--border)" }} />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      </PageTransition>
    </>
  )
}
