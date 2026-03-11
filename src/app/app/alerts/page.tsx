"use client"

import { useState } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { AlertTriangle, Info, Bell, X, Upload } from "lucide-react"
import { useAnalysisData } from "@/hooks/useAnalysisData"
import { CardSkeleton } from "@/components/ui/skeletons"
import { can } from "@/lib/roles"

const SEV_COLOR: Record<string, string> = { critical: "#FF4D4F", warning: "#F59E0B", info: "#3B82F6" }
const SEV_LABEL: Record<string, string> = { critical: "Crítico", warning: "Atenção", info: "Info" }

function SevIcon({ severity }: { severity: string }) {
  if (severity === "critical") return <AlertTriangle className="w-4 h-4" style={{ color: SEV_COLOR.critical }} />
  if (severity === "warning") return <Bell className="w-4 h-4" style={{ color: SEV_COLOR.warning }} />
  return <Info className="w-4 h-4" style={{ color: SEV_COLOR.info }} />
}

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })
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
        <CardSkeleton rows={5} />
        <CardSkeleton rows={3} />
      </div>
    )
  }

  if (!data?.analysis) {
    return (
      <div className="px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-black" style={{ color: "#F4F4F5" }}>Alertas</h1>
        </div>
        <div className="rounded-2xl p-12 text-center" style={{ background: "#1A1D27", border: "1px solid #2A2D3A" }}>
          <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.15)" }}>
            <Bell className="w-8 h-8" style={{ color: "#F59E0B" }} />
          </div>
          <p className="text-base font-bold mb-1" style={{ color: "#F4F4F5" }}>Nenhum alerta ativo</p>
          <p className="text-sm mb-2" style={{ color: "#8B8FA8" }}>
            {canUpload ? "Faça upload do extrato para monitorar alertas financeiros em tempo real." : "Aguardando análise — o responsável pelo upload ainda não enviou dados."}
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
  const criticalTotal = allAlerts.filter((a) => a.severity === "critical").length
  const warningTotal = allAlerts.filter((a) => a.severity === "warning").length

  return (
    <div className="px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-black" style={{ color: "#F4F4F5" }}>Alertas</h1>
        <p className="text-sm mt-0.5" style={{ color: "#8B8FA8" }}>
          {criticalTotal} críticos · {warningTotal} atenção
        </p>
      </div>

      {/* Severity filter */}
      <div className="flex items-center gap-2 mb-5">
        {(["all", "critical", "warning"] as SeverityFilter[]).map((f) => (
          <button
            key={f}
            onClick={() => setSeverityFilter(f)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{
              background: severityFilter === f ? "rgba(0,208,132,0.1)" : "#1A1D27",
              border: severityFilter === f ? "1px solid #00D084" : "1px solid #2A2D3A",
              color: severityFilter === f ? "#00D084" : "#8B8FA8",
            }}
          >
            {f === "all" ? "Todos" : SEV_LABEL[f]}
          </button>
        ))}
      </div>

      {filteredAlerts.length === 0 && (
        <div className="rounded-2xl p-10 text-center" style={{ background: "#1A1D27", border: "1px solid #2A2D3A" }}>
          <Bell className="w-10 h-10 mx-auto mb-3" style={{ color: "#2A2D3A" }} />
          <p className="text-sm font-medium" style={{ color: "#8B8FA8" }}>Nenhum alerta ativo</p>
          <p className="text-xs mt-1" style={{ color: "#4B4F6A" }}>Sua situação financeira está limpa por enquanto</p>
        </div>
      )}

      {/* Critical */}
      {critical.length > 0 && (
        <div className="mb-6">
          <p className="text-xs font-semibold mb-3 uppercase tracking-wider" style={{ color: "#FF4D4F" }}>Ação imediata necessária</p>
          <div className="space-y-3">
            {critical.map((alert) => (
              <div
                key={alert.id}
                className="rounded-2xl p-5"
                style={{ background: "rgba(255,77,79,0.06)", border: "1px solid rgba(255,77,79,0.2)" }}
              >
                <div className="flex items-start gap-3">
                  <SevIcon severity={alert.severity} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="text-sm font-semibold" style={{ color: "#F4F4F5" }}>{alert.title}</p>
                      {alert.amount !== undefined && (
                        <span className="text-sm font-bold shrink-0" style={{ color: "#FF4D4F" }}>
                          {formatCurrency(alert.amount)}
                        </span>
                      )}
                    </div>
                    <p className="text-xs leading-relaxed" style={{ color: "#8B8FA8" }}>{alert.message}</p>
                  </div>
                  <button
                    onClick={() => setDismissed((prev) => new Set([...prev, alert.id]))}
                    className="p-1 rounded-lg hover:bg-[#2A2D3A] transition-colors shrink-0"
                    style={{ color: "#4B4F6A" }}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Warning */}
      {warning.length > 0 && (
        <div>
          <p className="text-xs font-semibold mb-3 uppercase tracking-wider" style={{ color: "#F59E0B" }}>Monitorar</p>
          <div className="space-y-3">
            {warning.map((alert) => (
              <div
                key={alert.id}
                className="rounded-2xl p-5"
                style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.2)" }}
              >
                <div className="flex items-start gap-3">
                  <SevIcon severity={alert.severity} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="text-sm font-semibold" style={{ color: "#F4F4F5" }}>{alert.title}</p>
                      {alert.amount !== undefined && (
                        <span className="text-sm font-bold shrink-0" style={{ color: "#F59E0B" }}>
                          {formatCurrency(alert.amount)}
                        </span>
                      )}
                    </div>
                    <p className="text-xs leading-relaxed" style={{ color: "#8B8FA8" }}>{alert.message}</p>
                  </div>
                  <button
                    onClick={() => setDismissed((prev) => new Set([...prev, alert.id]))}
                    className="p-1 rounded-lg hover:bg-[#2A2D3A] transition-colors shrink-0"
                    style={{ color: "#4B4F6A" }}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
