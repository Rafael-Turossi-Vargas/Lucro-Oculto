"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts"
import { TrendingDown, TrendingUp, AlertTriangle, Lightbulb, ArrowRight, Upload, Loader2, FileText, Info, AlertCircle } from "lucide-react"
import { DashboardSkeleton } from "@/components/ui/skeletons"
import { PageTransition } from "@/components/ui/page-transition"
import { SimpleTooltip } from "@/components/ui/tooltip"
import { can } from "@/lib/roles"

const PIE_COLORS = ["#00D084", "#3B82F6", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"]

const KPI_TOOLTIPS: Record<string, string> = {
  "Total de Despesas": "Soma de todas as saídas financeiras no período analisado",
  "Receita Total": "Soma de todas as entradas financeiras no período analisado",
  "Resultado Líquido": "Receita Total menos Total de Despesas. Positivo = lucro, negativo = prejuízo",
  "Economia Potencial": "Estimativa de quanto você pode economizar implementando as recomendações do sistema",
}

function fmt(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })
}
function fmtDate(d: string | Date) {
  return new Date(d).toLocaleDateString("pt-BR", { month: "short", year: "numeric" })
}
function n(v: string | number | null | undefined) { return Number(v ?? 0) }

// ── Item 2: Mini sparkline SVG ────────────────────────────────────────────────
function Sparkline({ values, color }: { values: number[]; color: string }) {
  if (values.length < 2) return null
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const W = 80, H = 24
  const points = values.map((v, i) => {
    const x = (i / (values.length - 1)) * W
    const y = H - ((v - min) / range) * (H - 4) - 2
    return `${x.toFixed(1)},${y.toFixed(1)}`
  }).join(" ")
  return (
    <svg width={W} height={H} className="opacity-50">
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ── Item 1: Score ring with delta ─────────────────────────────────────────────
function ScoreRing({ score, delta }: { score: number; delta: number | null }) {
  const color = score >= 75 ? "#00D084" : score >= 50 ? "#F59E0B" : "#FF4D4F"
  const c = 2 * Math.PI * 44
  return (
    <div className="relative flex items-center justify-center w-28 h-28">
      <svg width="112" height="112" className="-rotate-90">
        <circle cx="56" cy="56" r="44" fill="none" stroke="var(--border)" strokeWidth="8" />
        <circle cx="56" cy="56" r="44" fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={c} strokeDashoffset={c - (score / 100) * c} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1s ease" }} />
      </svg>
      <div className="absolute text-center">
        <p className="text-2xl font-black leading-none" style={{ color }}>{score}</p>
        <p className="text-[10px]" style={{ color: "var(--text-faint)" }}>score</p>
      </div>
      {delta !== null && delta !== 0 && (
        <div className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full text-[9px] font-black"
          style={{
            background: delta > 0 ? "rgba(0,208,132,0.15)" : "rgba(255,77,79,0.15)",
            color: delta > 0 ? "#00D084" : "#FF4D4F",
            border: `1px solid ${delta > 0 ? "rgba(0,208,132,0.3)" : "rgba(255,77,79,0.3)"}`,
          }}>
          {delta > 0 ? "+" : ""}{delta}
        </div>
      )}
    </div>
  )
}

// ── Item 5: Empty state with benchmarks ───────────────────────────────────────
function EmptyState({ pending, canUpload }: { pending?: { id: string; status: string } | null; canUpload: boolean }) {
  const BENCHMARKS = [
    { label: "Custo com fornecedores", value: "32%", desc: "da receita — média PMEs BR" },
    { label: "Despesas fixas mensais", value: "18%", desc: "da receita — meta saudável" },
    { label: "Assinaturas e SaaS", value: "3–5%", desc: "da receita — referência de mercado" },
  ]

  return (
    <div className="px-6 py-8">
      <h1 className="text-2xl font-black mb-10" style={{ color: "var(--text-primary)" }}>Dashboard</h1>
      {pending ? (
        <div className="rounded-2xl p-10 text-center max-w-md mx-auto"
          style={{ background: "var(--bg-card)", border: "1px solid rgba(0,208,132,0.2)" }}>
          <Loader2 className="w-10 h-10 animate-spin mx-auto mb-4" style={{ color: "#00D084" }} />
          <h2 className="text-base font-bold mb-2" style={{ color: "var(--text-primary)" }}>Análise em andamento...</h2>
          <p className="text-sm mb-5" style={{ color: "var(--text-muted)" }}>A engine está processando. Aguarde alguns segundos.</p>
          <button onClick={() => window.location.reload()}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold"
            style={{ background: "#00D084", color: "var(--bg-page)" }}>Atualizar</button>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="rounded-2xl p-10 text-center"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl mx-auto mb-4"
              style={{ background: "var(--bg-subtle)" }}>
              <FileText className="w-7 h-7" style={{ color: "var(--text-faint)" }} />
            </div>
            <h2 className="text-base font-bold mb-2" style={{ color: "var(--text-primary)" }}>Nenhuma análise ainda</h2>
            <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
              {canUpload
                ? "Faça upload do extrato bancário para descobrir onde seu lucro está vazando."
                : "Aguardando análise — o responsável pelo upload ainda não enviou dados."}
            </p>
            {canUpload && (
              <Link href="/app/upload"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm"
                style={{ background: "#00D084", color: "var(--bg-page)" }}>
                <Upload className="w-4 h-4" /> Fazer primeiro upload
              </Link>
            )}
          </div>

          {/* Benchmarks de mercado */}
          <div className="rounded-2xl p-5" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
            <p className="text-xs font-semibold mb-4" style={{ color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "1px" }}>
              Benchmarks de mercado — PMEs brasileiras
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {BENCHMARKS.map(b => (
                <div key={b.label} className="rounded-xl p-3.5" style={{ background: "var(--bg-subtle)" }}>
                  <p className="text-xl font-black mb-1" style={{ color: "#F59E0B" }}>{b.value}</p>
                  <p className="text-xs font-medium mb-0.5" style={{ color: "var(--text-primary)" }}>{b.label}</p>
                  <p className="text-[10px]" style={{ color: "var(--text-faint)" }}>{b.desc}</p>
                </div>
              ))}
            </div>
            <p className="text-xs mt-3" style={{ color: "var(--text-faint)" }}>
              Faça upload do seu extrato para comparar com esses benchmarks e descobrir onde está seu lucro oculto.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

type Insight = { id: string; type: string; title: string; description: string; impact: string; amount: string | null }
type DashAlert = { id: string; severity: string; title: string; message: string }
type DashRecommendation = { id: string; title: string; description: string; urgency: string | null; savingsEstimate: string | null }
type DashData = {
  analysis: {
    id: string; score: number
    totalExpenses: string; totalIncome: string; netResult: string
    savingsMin: string; savingsMax: string
    periodStart: string; periodEnd: string
    summary: {
      categoryBreakdown: { category: string; amount: number; percentage: number }[]
      monthlyTrend: { month: string; income: number; expenses: number }[]
    } | null
    insights: Insight[]
    alerts: DashAlert[]
    recommendations: DashRecommendation[]
  } | null
  scoreHistory: { score: number; createdAt: string }[]
  analysesCount: number
  pending: { id: string; status: string } | null
}


export default function DashboardPage() {
  const [data, setData] = useState<DashData | null>(null)
  const [loading, setLoading] = useState(true)
  const { data: session } = useSession()
  const canUpload = can(session?.user?.role ?? "", "upload:create")

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null

    const fetchDashboard = () =>
      fetch("/api/app/dashboard").then(r => r.json()).then((d: DashData) => {
        setData(d)
        setLoading(false)
        // Auto-poll every 4s while analysis is pending/running
        if (d.pending && !interval) {
          interval = setInterval(() => {
            fetch("/api/app/dashboard").then(r => r.json()).then((updated: DashData) => {
              setData(updated)
              if (!updated.pending && interval) {
                clearInterval(interval)
                interval = null
              }
            }).catch(() => null)
          }, 4000)
        }
      }).catch(() => {
        setData({ analysis: null, scoreHistory: [], analysesCount: 0, pending: null })
        setLoading(false)
      })

    fetchDashboard()
    return () => { if (interval) clearInterval(interval) }
  }, [])

  if (loading) return <DashboardSkeleton />
  if (!data?.analysis) return <EmptyState pending={data?.pending} canUpload={canUpload} />

  const a = data.analysis
  const leaks = a.insights.filter(i => i.type === "leak")
  const opps = a.insights.filter(i => i.type === "opportunity")
  const monthlyTrend = a.summary?.monthlyTrend ?? []
  const cats = a.summary?.categoryBreakdown ?? []
  const topCat = cats[0]
  const hasConcentration = topCat && topCat.percentage >= 40
  const scoreChart = data.scoreHistory.map(s => ({
    date: new Date(s.createdAt).toLocaleDateString("pt-BR", { month: "short" }),
    score: s.score,
  }))

  // ── Item 1: Score delta ───────────────────────────────────────────────────
  const prevScore = data.scoreHistory.length >= 2
    ? data.scoreHistory[data.scoreHistory.length - 2]?.score ?? null
    : null
  const scoreDelta = prevScore !== null ? (a.score ?? 0) - prevScore : null

  // ── Item 2: Sparklines data ───────────────────────────────────────────────
  const expSparkline = monthlyTrend.map(m => m.expenses)
  const incSparkline = monthlyTrend.map(m => m.income)
  const netSparkline = monthlyTrend.map(m => m.income - m.expenses)

  // ── Item 12: Contextual subtitle ─────────────────────────────────────────
  const periodLabel = a.periodStart ? `${fmtDate(a.periodStart)} — ${fmtDate(a.periodEnd)}` : "Última análise"
  const analysisCountLabel = data.analysesCount > 1 ? ` · ${data.analysesCount} análises no histórico` : ""

  return (
    <PageTransition>
    <div className="px-4 sm:px-6 py-6 sm:py-8 space-y-6">

      {/* ── Item 12: Contextual header ─────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black" style={{ color: "var(--text-primary)" }}>Dashboard</h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            {periodLabel}
            {data.analysesCount > 1 && (
              <Link href="/app/history" className="ml-2 font-medium" style={{ color: "#00D084" }}>
                {analysisCountLabel} →
              </Link>
            )}
          </p>
        </div>
        {canUpload && (
          <Link href="/app/upload"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all"
            style={{ background: "#00D084", color: "var(--bg-page)" }}>
            <Upload className="w-4 h-4" /> Nova análise
          </Link>
        )}
      </div>

      {/* ── Item 2: KPIs com sparklines ───────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total de Despesas", value: n(a.totalExpenses), color: "#FF4D4F", icon: TrendingDown, spark: expSparkline },
          { label: "Receita Total", value: n(a.totalIncome), color: "#00D084", icon: TrendingUp, spark: incSparkline },
          { label: "Resultado Líquido", value: n(a.netResult), color: n(a.netResult) >= 0 ? "#00D084" : "#FF4D4F", icon: TrendingUp, spark: netSparkline },
          { label: "Economia Potencial", value: null, color: "#F59E0B", icon: Lightbulb, spark: [] as number[] },
        ].map(({ label, value, color, icon: Icon, spark }) => (
          <div key={label} className="rounded-2xl p-5" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>{label}</p>
                <SimpleTooltip content={KPI_TOOLTIPS[label]} side="top">
                  <button className="p-0.5 rounded opacity-50 hover:opacity-100 transition-opacity">
                    <Info className="w-3 h-3" style={{ color: "var(--text-muted)" }} />
                  </button>
                </SimpleTooltip>
              </div>
              <Icon className="w-4 h-4" style={{ color }} />
            </div>
            <p className="text-xl font-black truncate mb-1" style={{ color }}>
              {value !== null ? fmt(value) : `${fmt(n(a.savingsMin))}–${fmt(n(a.savingsMax))}/mês`}
            </p>
            {spark.length >= 2 && <Sparkline values={spark} color={color} />}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Item 1: Score card com delta ───────────────────────────────── */}
        <div className="rounded-2xl p-6" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Score Financeiro</p>
            {scoreDelta !== null && scoreDelta !== 0 && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{
                  background: scoreDelta > 0 ? "rgba(0,208,132,0.1)" : "rgba(255,77,79,0.1)",
                  color: scoreDelta > 0 ? "#00D084" : "#FF4D4F",
                }}>
                {scoreDelta > 0 ? "↑" : "↓"} {Math.abs(scoreDelta)} pts vs anterior
              </span>
            )}
          </div>
          <div className="flex flex-col items-center mb-5">
            <ScoreRing score={a.score ?? 0} delta={scoreDelta} />
            <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
              {(a.score ?? 0) >= 75 ? "Saúde boa" : (a.score ?? 0) >= 50 ? "Atenção necessária" : "Situação crítica"}
            </p>
          </div>
          <div className="space-y-2">
            {[
              { label: "Vazamentos", value: leaks.length, color: "#FF4D4F", href: "/app/leaks" },
              { label: "Oportunidades", value: opps.length, color: "#00D084", href: "/app/opportunities" },
              { label: "Alertas", value: a.alerts.length, color: "#F59E0B", href: "/app/alerts" },
            ].map(({ label, value, color, href }) => (
              <Link key={label} href={href}
                className="flex justify-between items-center px-3 py-2 rounded-lg transition-colors hover:opacity-80"
                style={{ background: "var(--bg-subtle)" }}>
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>{label}</span>
                <span className="text-xs font-bold" style={{ color }}>{value}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Chart */}
        <div className="lg:col-span-2 rounded-2xl p-6" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <p className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
            {monthlyTrend.length > 0 ? "Despesas x Receita" : "Evolução do Score"}
          </p>
          <ResponsiveContainer width="100%" height={200}>
            {monthlyTrend.length > 0 ? (
              <AreaChart data={monthlyTrend}>
                <defs>
                  <linearGradient id="gI" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00D084" stopOpacity={0.3} /><stop offset="95%" stopColor="#00D084" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gE" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF4D4F" stopOpacity={0.3} /><stop offset="95%" stopColor="#FF4D4F" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fill: "var(--text-faint)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "var(--text-faint)", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip contentStyle={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 8 }}
                  labelStyle={{ color: "var(--text-primary)", fontSize: 12 }} formatter={val => [fmt(Number(val)), ""]} />
                <Area type="monotone" dataKey="income" stroke="#00D084" fill="url(#gI)" strokeWidth={2} name="Receita" />
                <Area type="monotone" dataKey="expenses" stroke="#FF4D4F" fill="url(#gE)" strokeWidth={2} name="Despesas" />
              </AreaChart>
            ) : (
              <AreaChart data={scoreChart}>
                <XAxis dataKey="date" tick={{ fill: "var(--text-faint)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: "var(--text-faint)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 8 }} />
                <Area type="monotone" dataKey="score" stroke="#00D084" fill="rgba(0,208,132,0.1)" strokeWidth={2} name="Score" />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cats.length > 0 && (
          // ── Item 4: Pie chart with concentration warning ─────────────────
          <div className="rounded-2xl p-6"
            style={{
              background: "var(--bg-card)",
              border: hasConcentration ? "1px solid rgba(255,77,79,0.3)" : "1px solid var(--border)",
            }}>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Despesas por categoria</p>
              {hasConcentration && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
                  style={{ background: "rgba(255,77,79,0.08)", border: "1px solid rgba(255,77,79,0.2)" }}>
                  <AlertCircle className="w-3 h-3" style={{ color: "#FF4D4F" }} />
                  <span className="text-[10px] font-semibold" style={{ color: "#FF4D4F" }}>
                    Concentração: {topCat.percentage}% em {topCat.category}
                  </span>
                </div>
              )}
            </div>
            <div className="flex gap-4 items-center">
              <PieChart width={140} height={140}>
                <Pie data={cats} cx={70} cy={70} innerRadius={40} outerRadius={65} paddingAngle={2} dataKey="amount">
                  {cats.map((cat, i) => (
                    <Cell key={i}
                      fill={hasConcentration && i === 0 ? "#FF4D4F" : PIE_COLORS[i % PIE_COLORS.length]}
                    />
                  ))}
                </Pie>
              </PieChart>
              <div className="flex-1 space-y-2">
                {cats.slice(0, 5).map((cat, i) => (
                  <div key={cat.category} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full shrink-0"
                      style={{ background: hasConcentration && i === 0 ? "#FF4D4F" : PIE_COLORS[i % PIE_COLORS.length] }} />
                    <span className="text-xs flex-1 truncate" style={{ color: "var(--text-muted)" }}>{cat.category}</span>
                    <span className="text-xs font-medium shrink-0"
                      style={{ color: hasConcentration && i === 0 ? "#FF4D4F" : "var(--text-primary)" }}>
                      {cat.percentage}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="rounded-2xl p-6" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Alertas</p>
            <Link href="/app/alerts" className="text-xs" style={{ color: "#00D084" }}>Ver todos</Link>
          </div>
          {a.alerts.length === 0 ? (
            <p className="text-xs py-4 text-center" style={{ color: "var(--text-faint)" }}>Nenhum alerta ativo</p>
          ) : (
            <div className="space-y-3">
              {a.alerts.slice(0, 3).map(alert => (
                <div key={alert.id} className="flex items-start gap-3 p-3 rounded-xl"
                  style={{
                    background: alert.severity === "critical" ? "rgba(255,77,79,0.06)" : "rgba(245,158,11,0.06)",
                    borderLeft: `3px solid ${alert.severity === "critical" ? "#FF4D4F" : "#F59E0B"}`,
                    border: `1px solid ${alert.severity === "critical" ? "rgba(255,77,79,0.15)" : "rgba(245,158,11,0.15)"}`,
                  }}>
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5"
                    style={{ color: alert.severity === "critical" ? "#FF4D4F" : "#F59E0B" }} />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold truncate" style={{ color: "var(--text-primary)" }}>{alert.title}</p>
                    <p className="text-xs line-clamp-2 mt-0.5" style={{ color: "var(--text-muted)" }}>{alert.message}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Item 15: Leaks with left border ───────────────────────────────── */}
      {leaks.filter(l => l.impact === "high").length > 0 && (
        <div className="rounded-2xl p-6" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Principais vazamentos</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                {leaks.length} detectados · {fmt(leaks.reduce((s, l) => s + n(l.amount), 0))}/mês de impacto
              </p>
            </div>
            <Link href="/app/leaks" className="flex items-center gap-1 text-xs" style={{ color: "#00D084" }}>
              Ver todos <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {leaks.filter(l => l.impact === "high").slice(0, 3).map(leak => (
              <div key={leak.id} className="flex items-center gap-4 p-3 rounded-xl"
                style={{ background: "var(--bg-subtle)", borderLeft: "3px solid #FF4D4F" }}>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>{leak.title}</p>
                  <p className="text-xs truncate mt-0.5" style={{ color: "var(--text-muted)" }}>{leak.description}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold" style={{ color: "#FF4D4F" }}>−{fmt(n(leak.amount))}</p>
                  <p className="text-xs" style={{ color: "var(--text-faint)" }}>por mês</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Score History */}
      {data.scoreHistory.length >= 2 && (
        <div className="rounded-2xl p-6" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Evolução do Score Financeiro</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Seu progresso ao longo do tempo</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: "var(--bg-subtle)" }}>
              <div className="w-2 h-2 rounded-full" style={{ background: scoreChart[scoreChart.length-1]?.score >= scoreChart[0]?.score ? "#00D084" : "#FF4D4F" }} />
              <span className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>
                {scoreChart[scoreChart.length-1]?.score >= scoreChart[0]?.score ? "+" : ""}{(scoreChart[scoreChart.length-1]?.score ?? 0) - (scoreChart[0]?.score ?? 0)} pts
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={120}>
            <AreaChart data={scoreChart}>
              <defs>
                <linearGradient id="gScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00D084" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#00D084" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fill: "var(--text-faint)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: "var(--text-faint)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 8 }} labelStyle={{ color: "var(--text-primary)", fontSize: 12 }} />
              <Area type="monotone" dataKey="score" stroke="#00D084" fill="url(#gScore)" strokeWidth={2} name="Score" dot={{ fill: "#00D084", strokeWidth: 0, r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
    </PageTransition>
  )
}
