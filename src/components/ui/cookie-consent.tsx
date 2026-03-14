"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Cookie, X, Check } from "lucide-react"

const STORAGE_KEY = "lucro-oculto-cookie-consent"

export function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      // Pequeno delay para não aparecer imediatamente no carregamento
      const t = setTimeout(() => setVisible(true), 800)
      return () => clearTimeout(t)
    }
  }, [])

  function accept() {
    localStorage.setItem(STORAGE_KEY, "accepted")
    setVisible(false)
  }

  function decline() {
    localStorage.setItem(STORAGE_KEY, "declined")
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      role="dialog"
      aria-label="Consentimento de cookies"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-sm z-50 rounded-2xl p-5 shadow-2xl"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: "rgba(0,208,132,0.1)", border: "1px solid rgba(0,208,132,0.2)" }}
          >
            <Cookie className="w-4 h-4" style={{ color: "#00D084" }} />
          </div>
          <p className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>
            Cookies
          </p>
        </div>
        <button
          onClick={decline}
          aria-label="Fechar"
          className="w-6 h-6 flex items-center justify-center rounded-lg transition-opacity hover:opacity-70"
          style={{ color: "var(--text-faint)" }}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body */}
      <p className="text-xs leading-relaxed mb-4" style={{ color: "var(--text-muted)" }}>
        Usamos apenas cookies essenciais para manter sua sessão ativa. Não rastreamos dados para publicidade.{" "}
        <Link href="/cookies" className="underline underline-offset-2" style={{ color: "#00D084" }}>
          Saiba mais
        </Link>
        .
      </p>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={decline}
          className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all hover:opacity-80"
          style={{ background: "var(--bg-subtle)", border: "1px solid var(--border)", color: "var(--text-muted)" }}
        >
          Recusar
        </button>
        <button
          onClick={accept}
          className="flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all hover:opacity-90"
          style={{ background: "#00D084", color: "var(--bg-page)" }}
        >
          <Check className="w-3.5 h-3.5" />
          Aceitar
        </button>
      </div>
    </div>
  )
}
