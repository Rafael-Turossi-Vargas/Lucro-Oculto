"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Loader2, Mail } from "lucide-react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault()
    setLoading(true)
    try {
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
    } catch {
      // silently ignore — always show success for privacy
    }
    setSent(true)
    setLoading(false)
  }

  return (
    <div className="rounded-2xl p-8" style={{ background: "#1A1D27", border: "1px solid #2A2D3A" }}>
      {sent ? (
        <div className="text-center py-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: "rgba(0,208,132,0.1)", border: "1px solid rgba(0,208,132,0.2)" }}>
            <Mail className="w-7 h-7" style={{ color: "#00D084" }} />
          </div>
          <h2 className="text-xl font-bold mb-2" style={{ color: "#F4F4F5" }}>Verifique seu email</h2>
          <p className="text-sm leading-relaxed mb-6" style={{ color: "#8B8FA8" }}>
            Se este email estiver cadastrado, você receberá as instruções de recuperação em instantes.
            Verifique também a pasta de spam.
          </p>
          <Link href="/login"
            className="inline-flex items-center gap-2 text-sm font-medium"
            style={{ color: "#00D084" }}>
            <ArrowLeft className="w-4 h-4" /> Voltar ao login
          </Link>
        </div>
      ) : (
        <>
          <h1 className="text-2xl font-bold mb-1" style={{ color: "#F4F4F5" }}>Recuperar senha</h1>
          <p className="text-sm mb-6" style={{ color: "#8B8FA8" }}>
            Digite seu email e enviaremos as instruções para criar uma nova senha.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "#8B8FA8" }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="seu@email.com"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{ background: "#212435", border: "1px solid #2A2D3A", color: "#F4F4F5" }}
                onFocus={(e) => (e.target.style.borderColor = "#00D084")}
                onBlur={(e) => (e.target.style.borderColor = "#2A2D3A")}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm disabled:opacity-70"
              style={{ background: "#00D084", color: "#0F1117" }}
            >
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</> : "Enviar instruções"}
            </button>
          </form>

          <div className="text-center mt-6">
            <Link href="/login"
              className="inline-flex items-center gap-1.5 text-sm"
              style={{ color: "#8B8FA8" }}>
              <ArrowLeft className="w-4 h-4" /> Voltar ao login
            </Link>
          </div>
        </>
      )}
    </div>
  )
}
