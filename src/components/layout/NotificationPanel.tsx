"use client"

import { useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import Link from "next/link"
import { Bell, X, AlertCircle, AlertTriangle, Info, Loader2, CheckCircle2, ArrowRight } from "lucide-react"

type NotifAlert = {
  id: string
  type: string
  severity: string
  title: string
  message: string
  amount: string | null
  isRead: boolean
  createdAt: string
  analysisId: string
}

type Props = {
  open: boolean
  alerts: NotifAlert[]
  loading: boolean
  onClose: () => void
  anchorRef: React.RefObject<HTMLElement | null>
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return "agora"
  if (mins < 60) return `${mins}min atrás`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h atrás`
  const days = Math.floor(hrs / 24)
  return `${days}d atrás`
}

function SeverityIcon({ severity }: { severity: string }) {
  if (severity === "critical")
    return <AlertCircle className="w-4 h-4 shrink-0" style={{ color: "#FF4D4F" }} />
  if (severity === "warning")
    return <AlertTriangle className="w-4 h-4 shrink-0" style={{ color: "#F59E0B" }} />
  return <Info className="w-4 h-4 shrink-0" style={{ color: "#3B82F6" }} />
}

export function NotificationPanel({ open, alerts, loading, onClose, anchorRef }: Props) {
  const panelRef = useRef<HTMLDivElement>(null)

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [open, onClose])

  // Close on click outside
  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        anchorRef.current &&
        !anchorRef.current.contains(e.target as Node)
      ) {
        onClose()
      }
    }
    // Delay to avoid closing immediately on open click
    const t = setTimeout(() => document.addEventListener("mousedown", onClick), 0)
    return () => { clearTimeout(t); document.removeEventListener("mousedown", onClick) }
  }, [open, onClose, anchorRef])

  if (!open) return null

  // Position: right of sidebar (desktop) or fixed top-right (mobile)
  const panel = (
    <div
      ref={panelRef}
      role="dialog"
      aria-label="Notificações"
      style={{
        position: "fixed",
        top: "72px",
        left: "268px",
        zIndex: 300,
        width: "340px",
        maxHeight: "480px",
        display: "flex",
        flexDirection: "column",
        borderRadius: "16px",
        overflow: "hidden",
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        boxShadow: "0 16px 48px rgba(0,0,0,0.35)",
        animation: "notif-in 0.2s cubic-bezier(0.16,1,0.3,1)",
      }}
      className="notification-panel"
    >
      <style>{`
        @media (max-width: 1023px) {
          .notification-panel {
            left: 12px !important;
            right: 12px !important;
            width: auto !important;
            top: 60px !important;
          }
        }
        @keyframes notif-in {
          from { opacity: 0; transform: translateY(-8px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>

      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b shrink-0"
        style={{ borderColor: "var(--border)" }}
      >
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4" style={{ color: "#00D084" }} />
          <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
            Notificações
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg transition-colors"
          style={{ color: "var(--text-faint)" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--text-primary)"; (e.currentTarget as HTMLElement).style.background = "var(--bg-subtle)" }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--text-faint)"; (e.currentTarget as HTMLElement).style.background = "" }}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-5 h-5 animate-spin" style={{ color: "var(--text-faint)" }} />
          </div>
        ) : alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
            <CheckCircle2 className="w-8 h-8 mb-2" style={{ color: "#00D084" }} />
            <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
              Tudo em ordem!
            </p>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
              Nenhum alerta ativo no momento.
            </p>
          </div>
        ) : (
          <div>
            {alerts.map((alert, i) => (
              <div
                key={alert.id}
                className="flex items-start gap-3 px-4 py-3 transition-colors"
                style={{
                  borderBottom: i < alerts.length - 1 ? "1px solid var(--border)" : undefined,
                  background: alert.isRead ? undefined : "rgba(0,208,132,0.03)",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--bg-subtle)" }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = alert.isRead ? "" : "rgba(0,208,132,0.03)" }}
              >
                {/* Dot for unread */}
                <div className="mt-0.5 shrink-0">
                  {!alert.isRead && (
                    <span
                      className="absolute w-1.5 h-1.5 rounded-full"
                      style={{ background: "#00D084", marginLeft: "-8px", marginTop: "1px" }}
                    />
                  )}
                  <SeverityIcon severity={alert.severity} />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold leading-tight truncate" style={{ color: "var(--text-primary)" }}>
                    {alert.title}
                  </p>
                  <p className="text-[11px] mt-0.5 leading-snug line-clamp-2" style={{ color: "var(--text-muted)" }}>
                    {alert.message}
                  </p>
                  {alert.amount && Number(alert.amount) > 0 && (
                    <p className="text-[11px] font-bold mt-1" style={{ color: "#FF4D4F" }}>
                      −R${Number(alert.amount).toLocaleString("pt-BR", { maximumFractionDigits: 0 })}/mês
                    </p>
                  )}
                  <p className="text-[10px] mt-1" style={{ color: "var(--text-faint)" }}>
                    {timeAgo(alert.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        className="shrink-0 px-4 py-3 border-t"
        style={{ borderColor: "var(--border)", background: "var(--bg-subtle)" }}
      >
        <Link
          href="/app/alerts"
          onClick={onClose}
          className="flex items-center justify-center gap-1.5 text-xs font-semibold transition-colors"
          style={{ color: "#00D084" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#00A86B" }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#00D084" }}
        >
          Ver todos os alertas
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  )

  return createPortal(panel, document.body)
}
