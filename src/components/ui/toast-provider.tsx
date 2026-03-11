"use client"

import { createContext, useCallback, useContext, useState } from "react"
import { CheckCircle, AlertCircle, Info, X, AlertTriangle } from "lucide-react"

type ToastType = "success" | "error" | "warning" | "info"

interface Toast {
  id: string
  type: ToastType
  title: string
  message?: string
}

interface ToastContextValue {
  toast: (opts: Omit<Toast, "id">) => void
  success: (title: string, message?: string) => void
  error: (title: string, message?: string) => void
  warning: (title: string, message?: string) => void
  info: (title: string, message?: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const ICONS: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle className="w-4 h-4" style={{ color: "#00D084" }} />,
  error: <AlertCircle className="w-4 h-4" style={{ color: "#FF4D4F" }} />,
  warning: <AlertTriangle className="w-4 h-4" style={{ color: "#F59E0B" }} />,
  info: <Info className="w-4 h-4" style={{ color: "#3B82F6" }} />,
}

const COLORS: Record<ToastType, { bg: string; border: string }> = {
  success: { bg: "rgba(0,208,132,0.08)", border: "rgba(0,208,132,0.25)" },
  error: { bg: "rgba(255,77,79,0.08)", border: "rgba(255,77,79,0.25)" },
  warning: { bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.25)" },
  info: { bg: "rgba(59,130,246,0.08)", border: "rgba(59,130,246,0.25)" },
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback((opts: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).slice(2)
    setToasts((prev) => [...prev, { ...opts, id }])
    setTimeout(() => dismiss(id), 4000)
  }, [dismiss])

  const success = useCallback((title: string, message?: string) => toast({ type: "success", title, message }), [toast])
  const error = useCallback((title: string, message?: string) => toast({ type: "error", title, message }), [toast])
  const warning = useCallback((title: string, message?: string) => toast({ type: "warning", title, message }), [toast])
  const info = useCallback((title: string, message?: string) => toast({ type: "info", title, message }), [toast])

  return (
    <ToastContext.Provider value={{ toast, success, error, warning, info }}>
      {children}

      {/* Toast container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 w-80">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="flex items-start gap-3 px-4 py-3.5 rounded-2xl shadow-lg"
            style={{
              background: COLORS[t.type].bg,
              border: `1px solid ${COLORS[t.type].border}`,
              backdropFilter: "blur(12px)",
              animation: "slideIn 0.2s ease",
            }}
          >
            <span className="shrink-0 mt-0.5">{ICONS[t.type]}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold leading-tight" style={{ color: "#F4F4F5" }}>{t.title}</p>
              {t.message && (
                <p className="text-xs mt-0.5 leading-relaxed" style={{ color: "#8B8FA8" }}>{t.message}</p>
              )}
            </div>
            <button onClick={() => dismiss(t.id)} className="shrink-0 mt-0.5 p-0.5" style={{ color: "#4B4F6A" }}>
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error("useToast must be used inside ToastProvider")
  return ctx
}
