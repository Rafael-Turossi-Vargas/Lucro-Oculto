"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Suspense } from "react"
import { ArrowLeft, Loader2, KeyRound, CheckCircle, AlertCircle } from "lucide-react"

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get("token") ?? ""

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!token) setError("Link inválido. Solicite um novo link de recuperação.")
  }, [token])

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault()
    setError("")

    if (password.length < 8) {
      setError("A senha deve ter no mínimo 8 caracteres")
      return
    }
    if (password !== confirmPassword) {
      setError("As senhas não coincidem")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      })
      const data = await res.json() as { error?: string }
      if (!res.ok) {
        setError(data.error ?? "Erro ao redefinir senha")
      } else {
        setDone(true)
        setTimeout(() => router.push("/login"), 3000)
      }
    } catch {
      setError("Erro ao redefinir senha")
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="text-center py-4">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ background: "rgba(0,208,132,0.1)", border: "1px solid rgba(0,208,132,0.2)" }}
        >
          <CheckCircle className="w-7 h-7" style={{ color: "#00D084" }} />
        </div>
        <h2 className="text-xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>Senha redefinida!</h2>
        <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
          Sua senha foi atualizada com sucesso. Redirecionando para o login...
        </p>
        <Link href="/login" className="inline-flex items-center gap-2 text-sm font-medium" style={{ color: "#00D084" }}>
          <ArrowLeft className="w-4 h-4" /> Ir para o login
        </Link>
      </div>
    )
  }

  return (
    <>
      <div className="flex items-center justify-center w-14 h-14 rounded-2xl mx-auto mb-6"
        style={{ background: "rgba(0,208,132,0.08)", border: "1px solid rgba(0,208,132,0.2)" }}>
        <KeyRound className="w-7 h-7" style={{ color: "#00D084" }} />
      </div>

      <h1 className="text-2xl font-bold mb-1 text-center" style={{ color: "var(--text-primary)" }}>Nova senha</h1>
      <p className="text-sm mb-6 text-center" style={{ color: "var(--text-muted)" }}>
        Crie uma senha forte com no mínimo 8 caracteres.
      </p>

      {error && (
        <div
          className="flex items-start gap-3 p-3.5 rounded-xl mb-4"
          style={{ background: "rgba(255,77,79,0.06)", border: "1px solid rgba(255,77,79,0.2)" }}
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "#FF4D4F" }} />
          <p className="text-sm" style={{ color: "#FF4D4F" }}>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>Nova senha</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={!token}
            placeholder="••••••••"
            className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
            style={{ background: "var(--bg-subtle)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
            onFocus={(e) => (e.target.style.borderColor = "#00D084")}
            onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>Confirmar senha</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={!token}
            placeholder="••••••••"
            className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
            style={{ background: "var(--bg-subtle)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
            onFocus={(e) => (e.target.style.borderColor = "#00D084")}
            onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
          />
        </div>
        <button
          type="submit"
          disabled={loading || !token}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm disabled:brightness-90 disabled:cursor-not-allowed"
          style={{ background: "#00D084", color: "var(--bg-page)" }}
        >
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</> : "Redefinir senha"}
        </button>
      </form>

      <div className="text-center mt-6">
        <Link href="/login" className="inline-flex items-center gap-1.5 text-sm" style={{ color: "var(--text-muted)" }}>
          <ArrowLeft className="w-4 h-4" /> Voltar ao login
        </Link>
      </div>
    </>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="rounded-2xl p-8" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
      <Suspense fallback={<div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin" style={{ color: "#00D084" }} /></div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  )
}
