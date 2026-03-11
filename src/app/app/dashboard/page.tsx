"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts"
import { TrendingDown, TrendingUp, AlertTriangle, Lightbulb, ArrowRight, Upload, Loader2, FileText, Info } from "lucide-react"
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

function ScoreRing({ score }: { score: number }) {
  const color = score >= 75 ? "#00D084" : score >= 50 ? "#F59E0B" : "#FF4D4F"
  const c = 2 * Math.PI * 44
  return (
    <div className="relative flex items-center justify-center w-28 h-28">
      <svg width="112" height="112" className="-rotate-90">
        <circle cx="56" cy="56" r="44" fill="none" stroke="#2A2D3A" strokeWidth="8" />
        <circle cx="56" cy="56" r="44" fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={c} strokeDashoffset={c - (score / 100) * c} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1s ease" }} />
      </svg>
      <div className="absolute text-center">
        <p className="text-2xl font-black leading-none" style={{ color }}>{score}</p>
        <p className="text-[10px]" style={{ color: "#4B4F6A" }}>score</p>
      </div>
    </div>
  )
}

function EmptyState({ pending, canUpload }: { pending?: { id: string; status: string } | null; canUpload: boolean }) {
  return (
    <div className="px-6 py-8">
      <h1 className="text-2xl font-black mb-10" style={{ color: "#F4F4F5" }}>Dashboard</h1>
      {pending ? (
        <div className="rounded-2xl p-10 text-center max-w-md mx-auto"
          style={{ background: "#1A1D27", border: "1px solid rgba(0,208,132,0.2)" }}>
          <Loader2 className="w-10 h-10 animate-spin mx-auto mb-4" style={{ color: "#00D084" }} />
          <h2 className="text-base font-bold mb-2" style={{ color: "#F4F4F5" }}>Análise em andamento...</h2>
          <p className="text-sm mb-5" style={{ color: "#8B8FA8" }}>A engine está processando. Aguarde alguns segundos.</p>
          <button onClick={() => window.location.reload()}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold"
            style={{ background: "#00D084", color: "#0F1117" }}>Atualizar</button>
        </div>
      ) : (
        <div className="rounded-2xl p-10 text-center max-w-md mx-auto"
          style={{ background: "#1A1D27", border: "1px solid #2A2D3A" }}>
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl mx-auto mb-4"
            style={{ background: "#212435" }}>
            <FileText className="w-7 h-7" style={{ color: "#4B4F6A" }} />
          </div>
          <h2 className="text-base font-bold mb-2" style={{ color: "#F4F4F5" }}>Nenhuma análise ainda</h2>
          <p className="text-sm mb-6" style={{ color: "#8B8FA8" }}>
            {canUpload
              ? "Faça upload do extrato bancário para descobrir onde seu lucro está vazando."
              : "Aguardando análise — o responsável pelo upload ainda não enviou dados."}
          </p>
          {canUpload && (
            <Link href="/app/upload"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm"
              style={{ background: "#00D084", color: "#0F1117" }}>
              <Upload className="w-4 h-4" /> Fazer primeiro upload
            </Link>
          )}
        </div>
      )}
    </div>
  )
}

type Insight = { id: string; type: string; title: string; description: string; impact: string; amount: string | null }
type DashAlert = { id: string; severity: string; title: string; message: string }
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
    fetch("/api/app/dashboard").then(r => r.json()).then(setData)
      .catch(() => setData({ analysis: null, scoreHistory: [], analysesCount: 0, pending: null }))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <DashboardSkeleton />
  if (!data?.analysis) return <EmptyState pending={data?.pending} canUpload={canUpload} />

  const a = data.analysis
  const leaks = a.insights.filter(i => i.type === "leak")
  const opps = a.insights.filter(i => i.type === "opportunity")
  const monthlyTrend = a.summary?.monthlyTrend ?? []
  const cats = a.summary?.categoryBreakdown ?? []
  const scoreChart = data.scoreHistory.map(s => ({
    date: new Date(s.createdAt).toLocaleDateString("pt-BR", { month: "short" }),
    score: s.score,
  }))

  return (
    <PageTransition>
    <div className="px-6 py-8 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black" style={{ color: "#F4F4F5" }}>Dashboard</h1>
          <p className="text-sm" style={{ color: "#8B8FA8" }}>
            {a.periodStart ? `${fmtDate(a.periodStart)} — ${fmtDate(a.periodEnd)}` : "Última análise"}
            {data.analysesCount > 1 && (
              <Link href="/app/history" className="ml-3 font-medium" style={{ color: "#00D084" }}>
                {data.analysesCount} análises no histórico →
              </Link>
            )}
          </p>
        </div>
        {canUpload && (
          <Link href="/app/upload"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all"
            style={{ background: "#00D084", color: "#0F1117" }}>
            <Upload className="w-4 h-4" /> Nova análise
          </Link>
        )}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total de Despesas", value: fmt(n(a.totalExpenses)), color: "#FF4D4F", icon: TrendingDown },
          { label: "Receita Total", value: fmt(n(a.totalIncome)), color: "#00D084", icon: TrendingUp },
          { label: "Resultado Líquido", value: fmt(n(a.netResult)), color: n(a.netResult) >= 0 ? "#00D084" : "#FF4D4F", icon: TrendingUp },
          { label: "Economia Potencial", value: `${fmt(n(a.savingsMin))}–${fmt(n(a.savingsMax))}/mês`, color: "#F59E0B", icon: Lightbulb },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="rounded-2xl p-5" style={{ background: "#1A1D27", border: "1px solid #2A2D3A" }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-medium" style={{ color: "#8B8FA8" }}>{label}</p>
                <SimpleTooltip content={KPI_TOOLTIPS[label]} side="top">
                  <button className="p-0.5 rounded opacity-50 hover:opacity-100 transition-opacity">
                    <Info className="w-3 h-3" style={{ color: "#8B8FA8" }} />
                  </button>
                </SimpleTooltip>
              </div>
              <Icon className="w-4 h-4" style={{ color }} />
            </div>
            <p className="text-xl font-black truncate" style={{ color }}>{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Score */}
        <div className="rounded-2xl p-6" style={{ background: "#1A1D27", border: "1px solid #2A2D3A" }}>
          <p className="text-sm font-semibold mb-4" style={{ color: "#F4F4F5" }}>Score Financeiro</p>
          <div className="flex flex-col items-center mb-5">
            <ScoreRing score={a.score ?? 0} />
            <p className="text-xs mt-2" style={{ color: "#8B8FA8" }}>
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
                style={{ background: "#212435" }}>
                <span className="text-xs" style={{ color: "#8B8FA8" }}>{label}</span>
                <span className="text-xs font-bold" style={{ color }}>{value}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Chart */}
        <div className="col-span-2 rounded-2xl p-6" style={{ background: "#1A1D27", border: "1px solid #2A2D3A" }}>
          <p className="text-sm font-semibold mb-4" style={{ color: "#F4F4F5" }}>
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
                <XAxis dataKey="month" tick={{ fill: "#4B4F6A", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#4B4F6A", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip contentStyle={{ background: "#1A1D27", border: "1px solid #2A2D3A", borderRadius: 8 }}
                  labelStyle={{ color: "#F4F4F5", fontSize: 12 }} formatter={val => [fmt(Number(val)), ""]} />
                <Area type="monotone" dataKey="income" stroke="#00D084" fill="url(#gI)" strokeWidth={2} name="Receita" />
                <Area type="monotone" dataKey="expenses" stroke="#FF4D4F" fill="url(#gE)" strokeWidth={2} name="Despesas" />
              </AreaChart>
            ) : (
              <AreaChart data={scoreChart}>
                <XAxis dataKey="date" tick={{ fill: "#4B4F6A", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: "#4B4F6A", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "#1A1D27", border: "1px solid #2A2D3A", borderRadius: 8 }} />
                <Area type="monotone" dataKey="score" stroke="#00D084" fill="rgba(0,208,132,0.1)" strokeWidth={2} name="Score" />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {cats.length > 0 && (
          <div className="rounded-2xl p-6" style={{ background: "#1A1D27", border: "1px solid #2A2D3A" }}>
            <p className="text-sm font-semibold mb-4" style={{ color: "#F4F4F5" }}>Despesas por categoria</p>
            <div className="flex gap-4 items-center">
              <PieChart width={140} height={140}>
                <Pie data={cats} cx={70} cy={70} innerRadius={40} outerRadius={65} paddingAngle={2} dataKey="amount">
                  {cats.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
              </PieChart>
              <div className="flex-1 space-y-2">
                {cats.slice(0, 5).map((cat, i) => (
                  <div key={cat.category} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                    <span className="text-xs flex-1 truncate" style={{ color: "#8B8FA8" }}>{cat.category}</span>
                    <span className="text-xs font-medium shrink-0" style={{ color: "#F4F4F5" }}>{cat.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="rounded-2xl p-6" style={{ background: "#1A1D27", border: "1px solid #2A2D3A" }}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold" style={{ color: "#F4F4F5" }}>Alertas</p>
            <Link href="/app/alerts" className="text-xs" style={{ color: "#00D084" }}>Ver todos</Link>
          </div>
          {a.alerts.length === 0 ? (
            <p className="text-xs py-4 text-center" style={{ color: "#4B4F6A" }}>Nenhum alerta ativo</p>
          ) : (
            <div className="space-y-3">
              {a.alerts.slice(0, 3).map(alert => (
                <div key={alert.id} className="flex items-start gap-3 p-3 rounded-xl"
                  style={{
                    background: alert.severity === "critical" ? "rgba(255,77,79,0.06)" : "rgba(245,158,11,0.06)",
                    border: `1px solid ${alert.severity === "critical" ? "rgba(255,77,79,0.2)" : "rgba(245,158,11,0.2)"}`,
                  }}>
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5"
                    style={{ color: alert.severity === "critical" ? "#FF4D4F" : "#F59E0B" }} />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold truncate" style={{ color: "#F4F4F5" }}>{alert.title}</p>
                    <p className="text-xs line-clamp-2 mt-0.5" style={{ color: "#8B8FA8" }}>{alert.message}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {leaks.filter(l => l.impact === "high").length > 0 && (
        <div className="rounded-2xl p-6" style={{ background: "#1A1D27", border: "1px solid #2A2D3A" }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-semibold" style={{ color: "#F4F4F5" }}>Principais vazamentos</p>
              <p className="text-xs mt-0.5" style={{ color: "#8B8FA8" }}>
                {leaks.length} detectados · {fmt(leaks.reduce((s, l) => s + n(l.amount), 0))}/mês de impacto
              </p>
            </div>
            <Link href="/app/leaks" className="flex items-center gap-1 text-xs" style={{ color: "#00D084" }}>
              Ver todos <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {leaks.filter(l => l.impact === "high").slice(0, 3).map(leak => (
              <div key={leak.id} className="flex items-center gap-4 p-3 rounded-xl" style={{ background: "#212435" }}>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: "#F4F4F5" }}>{leak.title}</p>
                  <p className="text-xs truncate mt-0.5" style={{ color: "#8B8FA8" }}>{leak.description}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold" style={{ color: "#FF4D4F" }}>−{fmt(n(leak.amount))}</p>
                  <p className="text-xs" style={{ color: "#4B4F6A" }}>por mês</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Score History */}
      {data.scoreHistory.length >= 2 && (
        <div className="rounded-2xl p-6" style={{ background: "#1A1D27", border: "1px solid #2A2D3A" }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-semibold" style={{ color: "#F4F4F5" }}>Evolução do Score Financeiro</p>
              <p className="text-xs mt-0.5" style={{ color: "#8B8FA8" }}>Seu progresso ao longo do tempo</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: "#212435" }}>
              <div className="w-2 h-2 rounded-full" style={{ background: scoreChart[scoreChart.length-1]?.score >= scoreChart[0]?.score ? "#00D084" : "#FF4D4F" }} />
              <span className="text-xs font-medium" style={{ color: "#F4F4F5" }}>
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
              <XAxis dataKey="date" tick={{ fill: "#4B4F6A", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: "#4B4F6A", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "#1A1D27", border: "1px solid #2A2D3A", borderRadius: 8 }} labelStyle={{ color: "#F4F4F5", fontSize: 12 }} />
              <Area type="monotone" dataKey="score" stroke="#00D084" fill="url(#gScore)" strokeWidth={2} name="Score" dot={{ fill: "#00D084", strokeWidth: 0, r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
    </PageTransition>
  )
}
