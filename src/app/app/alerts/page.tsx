"use client"

import { useState } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { AlertTriangle, Bell, X, Upload, ShieldCheck } from "lucide-react"
import { useAnalysisData } from "@/hooks/useAnalysisData"
import { CardSkeleton } from "@/components/ui/skeletons"
import { can } from "@/lib/roles"

const SEV_COLOR: Record<string, string> = { critical: "#FF4D4F", warning: "#F59E0B", info: "#3B82F6" }
const SEV_BG: Record<string, string> = {
  critical: "rgba(255,77,79,0.06)",
  warning: "rgba(245,158,11,0.06)",
  info: "rgba(59,130,246,0.06)",
}
const SEV_BORDER: Record<string, string> = {
  critical: "rgba(255,77,79,0.2)",
  warning: "rgba(245,158,11,0.2)",
  info: "rgba(59,130,246,0.2)",
}
const SEV_LABEL: Record<string, string> = { critical: "Crítico", warning: "Atenção", info: "Info" }

function SevIcon({ severity }: { severity: string }) {
  if (severity === "critical") return <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: SEV_COLOR.critical }} />
  return <Bell className="w-4 h-4 shrink-0 mt-0.5" style={{ color: SEV_COLOR[severity] ?? SEV_COLOR.warning }} />
}

function fmt(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })
}

type SeverityFilter = "all" | "critical" | "warning"

export default function AlertsPage() {
  const { data, loading } = useAnalysisData()
  const { data: session } = useSession()
  const canUpload = can(session?.user?.role ?? "", "upload:create")
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>("all")

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
        <h1 className="text-2xl font-black mb-6" style={{ color: "#F4F4F5" }}>Alertas</h1>
        <div className="rounded-2xl p-12 text-center" style={{ background: "#1A1D27", border: "1px solid #2A2D3A" }}>
          <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
            style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.15)" }}>
            <Bell className="w-8 h-8" style={{ color: "#F59E0B" }} />
          </div>
          <p className="text-base font-bold mb-1" style={{ color: "#F4F4F5" }}>Nenhum alerta ativo</p>
          <p className="text-sm mb-2" style={{ color: "#8B8FA8" }}>
            {canUpload ? "Faça upload do extrato para monitorar alertas financeiros em tempo real." : "Aguardando análise."}
          </p>
          <p className="text-xs mb-6 px-4" style={{ color: "#4B4F6A" }}>
            Empresas que usam o Lucro Oculto economizam em média{" "}
            <span style={{ color: "#00D084", fontWeight: 700 }}>R$4.800/mês</span>
          </p>
          {canUpload && (
            <Link href="/app/upload" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm"
              style={{ background: "#00D084", color: "#0F1117" }}>
              <Upload className="w-4 h-4" /> Fazer primeiro upload
            </Link>
          )}
        </div>
      </div>
    )
  }

  const allAlerts = data.analysis.alerts
    .filter((a) => !a.isDismissed && !dismissed.has(a.id))
    .map((a) => ({
      id: a.id,
      severity: a.severity,
      title: a.title,
      message: a.message,
      amount: a.amount ? parseFloat(String(a.amount)) : undefined,
    }))

  const filteredAlerts = severityFilter === "all"
    ? allAlerts
    : allAlerts.filter((a) => a.severity === severityFilter)

  const critical = filteredAlerts.filter((a) => a.severity === "critical")
  const warning = filteredAlerts.filter((a) => a.severity === "warning")
  const criticalCount = allAlerts.filter((a) => a.severity === "critical").length
  const warningCount = allAlerts.filter((a) => a.severity === "warning").length
  const dismissedCount = dismissed.size

  return (
    <div className="px-6 py-8 space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black" style={{ color: "#F4F4F5" }}>Alertas</h1>
          <p className="text-sm mt-0.5" style={{ color: "#8B8FA8" }}>
            {criticalCount > 0 && (
              <span style={{ color: "#FF4D4F", fontWeight: 700 }}>{criticalCount} crítico{criticalCount > 1 ? "s" : ""}</span>
            )}
            {criticalCount > 0 && warningCount > 0 && <span style={{ color: "#4B4F6A" }}> · </span>}
            {warningCount > 0 && (
              <span style={{ color: "#F59E0B" }}>{warningCount} atenção</span>
            )}
            {criticalCount === 0 && warningCount === 0 && (
              <span style={{ color: "#00D084" }}>Nenhum alerta ativo</span>
            )}
            {dismissedCount > 0 && (
              <span style={{ color: "#4B4F6A" }}> · {dismissedCount} dispensado{dismissedCount > 1 ? "s" : ""}</span>
            )}
          </p>
        </div>
      </div>

      {/* Summary pills */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { sev: "critical", label: "Críticos", count: criticalCount, icon: AlertTriangle },
          { sev: "warning", label: "Atenção", count: warningCount, icon: Bell },
          { sev: "dismissed", label: "Dispensados", count: dismissedCount, icon: ShieldCheck },
        ].map(({ sev, label, count, icon: Icon }) => (
          <div key={sev} className="rounded-2xl p-4"
            style={{
              background: "#1A1D27",
              border: "1px solid #2A2D3A",
              borderLeft: `3px solid ${sev === "critical" ? "#FF4D4F" : sev === "warning" ? "#F59E0B" : "#00D084"}`,
            }}>
            <div className="flex items-center gap-2 mb-2">
              <Icon className="w-3.5 h-3.5" style={{ color: sev === "critical" ? "#FF4D4F" : sev === "warning" ? "#F59E0B" : "#00D084" }} />
              <span className="text-xs font-semibold" style={{ color: "#8B8FA8" }}>{label}</span>
            </div>
            <p className="text-2xl font-black" style={{ color: sev === "critical" ? "#FF4D4F" : sev === "warning" ? "#F59E0B" : "#00D084" }}>
              {count}
            </p>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-1.5 p-1 rounded-xl w-fit"
        style={{ background: "#1A1D27", border: "1px solid #2A2D3A" }}>
        {([
          { value: "all", label: `Todos (${allAlerts.length})` },
          { value: "critical", label: `Críticos (${criticalCount})` },
          { value: "warning", label: `Atenção (${warningCount})` },
        ] as { value: SeverityFilter; label: string }[]).map((f) => (
          <button key={f.value} onClick={() => setSeverityFilter(f.value)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{
              background: severityFilter === f.value ? "#212435" : "transparent",
              color: severityFilter === f.value
                ? (f.value === "critical" ? "#FF4D4F" : f.value === "warning" ? "#F59E0B" : "#F4F4F5")
                : "#8B8FA8",
              border: severityFilter === f.value
                ? `1px solid ${f.value === "critical" ? "rgba(255,77,79,0.3)" : f.value === "warning" ? "rgba(245,158,11,0.3)" : "#2A2D3A"}`
                : "1px solid transparent",
            }}>
            {f.label}
          </button>
        ))}
      </div>

      {filteredAlerts.length === 0 && (
        <div className="rounded-2xl p-10 text-center" style={{ background: "#1A1D27", border: "1px solid #2A2D3A" }}>
          <ShieldCheck className="w-10 h-10 mx-auto mb-3" style={{ color: "#00D084" }} />
          <p className="text-sm font-medium" style={{ color: "#8B8FA8" }}>Nenhum alerta nesta categoria</p>
          <p className="text-xs mt-1" style={{ color: "#4B4F6A" }}>Sua situação financeira está limpa por enquanto</p>
        </div>
      )}

      {/* Critical section */}
      {critical.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: "#FF4D4F" }}>
            Ação imediata necessária
          </p>
          {critical.map((alert) => (
            <div key={alert.id} className="rounded-2xl p-5 transition-all"
              style={{
                background: SEV_BG.critical,
                border: `1px solid ${SEV_BORDER.critical}`,
                borderLeft: `3px solid ${SEV_COLOR.critical}`,
              }}>
              <div className="flex items-start gap-3">
                <SevIcon severity={alert.severity} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="text-sm font-semibold" style={{ color: "#F4F4F5" }}>{alert.title}</p>
                    {alert.amount !== undefined && alert.amount > 0 && (
                      <span className="text-sm font-black shrink-0 ml-2" style={{ color: "#FF4D4F" }}>
                        {fmt(alert.amount)}
                      </span>
                    )}
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: "#8B8FA8" }}>{alert.message}</p>
                </div>
                <button onClick={() => setDismissed((prev) => new Set([...prev, alert.id]))}
                  className="p-1.5 rounded-lg shrink-0 transition-colors hover:bg-[#2A2D3A]"
                  style={{ color: "#4B4F6A" }} title="Dispensar">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Warning section */}
      {warning.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: "#F59E0B" }}>
            Monitorar
          </p>
          {warning.map((alert) => (
            <div key={alert.id} className="rounded-2xl p-5 transition-all"
              style={{
                background: SEV_BG.warning,
                border: `1px solid ${SEV_BORDER.warning}`,
                borderLeft: `3px solid ${SEV_COLOR.warning}`,
              }}>
              <div className="flex items-start gap-3">
                <SevIcon severity={alert.severity} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="text-sm font-semibold" style={{ color: "#F4F4F5" }}>{alert.title}</p>
                    {alert.amount !== undefined && alert.amount > 0 && (
                      <span className="text-sm font-black shrink-0 ml-2" style={{ color: "#F59E0B" }}>
                        {fmt(alert.amount)}
                      </span>
                    )}
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: "#8B8FA8" }}>{alert.message}</p>
                </div>
                <button onClick={() => setDismissed((prev) => new Set([...prev, alert.id]))}
                  className="p-1.5 rounded-lg shrink-0 transition-colors hover:bg-[#2A2D3A]"
                  style={{ color: "#4B4F6A" }} title="Dispensar">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* All-clear state */}
      {allAlerts.length === 0 && (
        <div className="rounded-2xl p-8 text-center"
          style={{ background: "rgba(0,208,132,0.04)", border: "1px solid rgba(0,208,132,0.15)" }}>
          <ShieldCheck className="w-10 h-10 mx-auto mb-3" style={{ color: "#00D084" }} />
          <p className="text-sm font-semibold" style={{ color: "#00D084" }}>Tudo limpo!</p>
          <p className="text-xs mt-1" style={{ color: "#8B8FA8" }}>Nenhum alerta ativo neste momento</p>
        </div>
      )}
    </div>
  )
}
