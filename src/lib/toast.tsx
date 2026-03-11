"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import { CheckCircle, AlertTriangle, Info, X } from "lucide-react"

type ToastType = "success" | "error" | "warning" | "info"

interface Toast {
  id: string
  type: ToastType
  title: string
  description?: string
}

interface ToastContextValue {
  toast: (opts: Omit<Toast, "id">) => void
  success: (title: string, description?: string) => void
  error: (title: string, description?: string) => void
  warning: (title: string, description?: string) => void
  info: (title: string, description?: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const COLORS: Record<ToastType, { bg: string; border: string; icon: string }> = {
  success: { bg: "rgba(0,208,132,0.08)",  border: "rgba(0,208,132,0.25)",  icon: "#00D084" },
  error:   { bg: "rgba(255,77,79,0.08)",  border: "rgba(255,77,79,0.25)",  icon: "#FF4D4F" },
  warning: { bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.25)", icon: "#F59E0B" },
  info:    { bg: "rgba(59,130,246,0.08)", border: "rgba(59,130,246,0.25)", icon: "#3B82F6" },
}

function ToastIcon({ type }: { type: ToastType }) {
  const color = COLORS[type].icon
  if (type === "success") return <CheckCircle className="w-4 h-4 shrink-0" style={{ color }} />
  if (type === "error")   return <AlertTriangle className="w-4 h-4 shrink-0" style={{ color }} />
  if (type === "warning") return <AlertTriangle className="w-4 h-4 shrink-0" style={{ color }} />
  return <Info className="w-4 h-4 shrink-0" style={{ color }} />
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback(({ type, title, description }: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).slice(2)
    setToasts((prev) => [...prev.slice(-4), { id, type, title, description }])
    setTimeout(() => dismiss(id), 4500)
  }, [dismiss])

  const success = useCallback((title: string, description?: string) => toast({ type: "success", title, description }), [toast])
  const error   = useCallback((title: string, description?: string) => toast({ type: "error",   title, description }), [toast])
  const warning = useCallback((title: string, description?: string) => toast({ type: "warning", title, description }), [toast])
  const info    = useCallback((title: string, description?: string) => toast({ type: "info",    title, description }), [toast])

  return (
    <ToastContext.Provider value={{ toast, success, error, warning, info }}>
      {children}

      {/* Toaster */}
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 w-80 pointer-events-none">
        {toasts.map((t) => {
          const c = COLORS[t.type]
          return (
            <div
              key={t.id}
              className="pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-2xl shadow-2xl"
              style={{ background: "#1A1D27", border: `1px solid ${c.border}` }}
            >
              <ToastIcon type={t.type} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold" style={{ color: "#F4F4F5" }}>{t.title}</p>
                {t.description && (
                  <p className="text-xs mt-0.5" style={{ color: "#8B8FA8" }}>{t.description}</p>
                )}
              </div>
              <button
                onClick={() => dismiss(t.id)}
                className="shrink-0 p-0.5 rounded-lg hover:bg-[#2A2D3A] transition-colors"
                style={{ color: "#4B4F6A" }}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error("useToast must be inside ToastProvider")
  return ctx
}
