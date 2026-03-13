"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import {
  Users, Building2, BarChart3, Upload, Shield, Crown, Zap,
  TrendingUp, FileText, Loader2, CheckCircle, Clock, AlertCircle,
} from "lucide-react"

type Stats = {
  totals: { users: number; orgs: number; analyses: number; uploads: number }
  planDistribution: { free: number; pro: number; admin: number }
  recentAnalyses: {
    id: string; status: string; score: number | null; createdAt: string
    organization: { name: string }
    upload: { fileName: string } | null
  }[]
  recentUsers: {
    id: string; name: string | null; email: string; createdAt: string
    memberships: { organization: { name: string; plan: string } }[]
  }[]
}

function StatCard({ icon: Icon, label, value, sub, color }: {
  icon: typeof Users; label: string; value: number | string; sub?: string; color: string
}) {
  return (
    <div className="rounded-2xl p-5" style={{ background: "#1A1D27", border: "1px solid #2A2D3A" }}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl" style={{ background: `${color}14` }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
      </div>
      <p className="text-2xl font-black mb-1" style={{ color: "#F4F4F5" }}>{value.toLocaleString("pt-BR")}</p>
      <p className="text-sm font-medium" style={{ color: "#8B8FA8" }}>{label}</p>
      {sub && <p className="text-xs mt-0.5" style={{ color: "#4B4F6A" }}>{sub}</p>}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
    done: { label: "Concluído", color: "#00D084", icon: CheckCircle },
    pending: { label: "Pendente", color: "#F59E0B", icon: Clock },
    processing: { label: "Processando", color: "#3B82F6", icon: Loader2 },
    error: { label: "Erro", color: "#FF4D4F", icon: AlertCircle },
  }
  const s = map[status] ?? { label: status, color: "#8B8FA8", icon: Clock }
  const Icon = s.icon
  return (
    <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-semibold"
      style={{ background: `${s.color}14`, color: s.color }}>
      <Icon className="w-3 h-3" />
      {s.label}
    </span>
  )
}

function PlanBadge({ plan }: { plan: string }) {
  const map: Record<string, { label: string; color: string }> = {
    admin: { label: "Admin", color: "#3B82F6" },
    pro: { label: "Pro", color: "#F59E0B" },
    free: { label: "Free", color: "#8B8FA8" },
  }
  const p = map[plan] ?? { label: plan, color: "#8B8FA8" }
  return (
    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold"
      style={{ background: `${p.color}18`, color: p.color }}>
      {p.label}
    </span>
  )
}

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  const plan = (session?.user as { plan?: string })?.plan

  useEffect(() => {
    if (status === "loading") return
    if (plan !== "admin") {
      router.replace("/app/dashboard")
      return
    }
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((d) => setStats(d as Stats))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [status, plan, router])

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: "#00D084" }} />
      </div>
    )
  }

  if (!stats) return null

  const { totals, planDistribution, recentAnalyses, recentUsers } = stats
  const totalPlans = planDistribution.free + planDistribution.pro + planDistribution.admin
  const pct = (n: number) => totalPlans > 0 ? Math.round((n / totalPlans) * 100) : 0

  return (
    <div className="px-4 sm:px-6 py-6 sm:py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl" style={{ background: "rgba(59,130,246,0.12)" }}>
          <Shield className="w-5 h-5" style={{ color: "#3B82F6" }} />
        </div>
        <div>
          <h1 className="text-2xl font-black" style={{ color: "#F4F4F5" }}>Painel Admin</h1>
          <p className="text-sm" style={{ color: "#8B8FA8" }}>Visão geral do sistema em tempo real</p>
        </div>
        <span className="ml-auto text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-widest"
          style={{ background: "rgba(59,130,246,0.12)", color: "#3B82F6", border: "1px solid rgba(59,130,246,0.25)" }}>
          Admin
        </span>
      </div>

      {/* Totals */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Usuários" value={totals.users} color="#00D084" />
        <StatCard icon={Building2} label="Organizações" value={totals.orgs} color="#3B82F6" />
        <StatCard icon={BarChart3} label="Análises" value={totals.analyses} color="#F59E0B" />
        <StatCard icon={Upload} label="Uploads" value={totals.uploads} color="#8B5CF6" />
      </div>

      {/* Plan distribution */}
      <div className="rounded-2xl p-6" style={{ background: "#1A1D27", border: "1px solid #2A2D3A" }}>
        <p className="text-sm font-semibold mb-5" style={{ color: "#F4F4F5" }}>Distribuição de planos</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
          {[
            { label: "Grátis", count: planDistribution.free, color: "#8B8FA8", icon: Zap },
            { label: "Pro", count: planDistribution.pro, color: "#F59E0B", icon: Crown },
            { label: "Admin", count: planDistribution.admin, color: "#3B82F6", icon: Shield },
          ].map(({ label, count, color, icon: Icon }) => (
            <div key={label} className="flex items-center gap-3 p-4 rounded-xl" style={{ background: "#212435" }}>
              <Icon className="w-4 h-4 shrink-0" style={{ color }} />
              <div>
                <p className="text-sm font-bold" style={{ color: "#F4F4F5" }}>{count}</p>
                <p className="text-xs" style={{ color: "#8B8FA8" }}>{label}</p>
              </div>
              <span className="ml-auto text-xs font-semibold" style={{ color }}>{pct(count)}%</span>
            </div>
          ))}
        </div>
        {/* Bar */}
        <div className="h-2 rounded-full overflow-hidden flex" style={{ background: "#212435" }}>
          <div style={{ width: `${pct(planDistribution.free)}%`, background: "#2A2D3A" }} />
          <div style={{ width: `${pct(planDistribution.pro)}%`, background: "#F59E0B" }} />
          <div style={{ width: `${pct(planDistribution.admin)}%`, background: "#3B82F6" }} />
        </div>
      </div>

      {/* Recent analyses + users */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent analyses */}
        <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid #2A2D3A" }}>
          <div className="flex items-center gap-2 px-5 py-4" style={{ background: "#1A1D27", borderBottom: "1px solid #2A2D3A" }}>
            <TrendingUp className="w-4 h-4" style={{ color: "#F59E0B" }} />
            <p className="text-sm font-semibold" style={{ color: "#F4F4F5" }}>Análises recentes</p>
          </div>
          <div style={{ background: "#1A1D27" }}>
            {recentAnalyses.length === 0 ? (
              <p className="text-xs text-center py-8" style={{ color: "#4B4F6A" }}>Nenhuma análise ainda</p>
            ) : recentAnalyses.map((a, i) => (
              <div key={a.id} className="flex items-center gap-3 px-5 py-3.5"
                style={{ borderBottom: i < recentAnalyses.length - 1 ? "1px solid #212435" : "none" }}>
                <FileText className="w-4 h-4 shrink-0" style={{ color: "#4B4F6A" }} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate" style={{ color: "#F4F4F5" }}>
                    {a.upload?.fileName ?? "Arquivo"}
                  </p>
                  <p className="text-[10px] truncate" style={{ color: "#4B4F6A" }}>{a.organization.name}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {a.score !== null && (
                    <span className="text-xs font-bold" style={{ color: a.score >= 70 ? "#00D084" : a.score >= 40 ? "#F59E0B" : "#FF4D4F" }}>
                      {a.score}
                    </span>
                  )}
                  <StatusBadge status={a.status} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent users */}
        <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid #2A2D3A" }}>
          <div className="flex items-center gap-2 px-5 py-4" style={{ background: "#1A1D27", borderBottom: "1px solid #2A2D3A" }}>
            <Users className="w-4 h-4" style={{ color: "#00D084" }} />
            <p className="text-sm font-semibold" style={{ color: "#F4F4F5" }}>Usuários recentes</p>
          </div>
          <div style={{ background: "#1A1D27" }}>
            {recentUsers.length === 0 ? (
              <p className="text-xs text-center py-8" style={{ color: "#4B4F6A" }}>Nenhum usuário ainda</p>
            ) : recentUsers.map((u, i) => {
              const org = u.memberships[0]?.organization
              return (
                <div key={u.id} className="flex items-center gap-3 px-5 py-3.5"
                  style={{ borderBottom: i < recentUsers.length - 1 ? "1px solid #212435" : "none" }}>
                  <div className="flex items-center justify-center w-7 h-7 rounded-lg shrink-0 text-xs font-bold"
                    style={{ background: "rgba(0,208,132,0.1)", color: "#00D084" }}>
                    {(u.name ?? u.email)[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate" style={{ color: "#F4F4F5" }}>{u.name ?? u.email}</p>
                    <p className="text-[10px] truncate" style={{ color: "#4B4F6A" }}>{u.email}</p>
                  </div>
                  {org && <PlanBadge plan={org.plan} />}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
