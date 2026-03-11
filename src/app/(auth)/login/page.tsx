"use client"

import { Suspense, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react"

function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const registered = params.get("registered") === "true"
  const trialParam = params.get("trial") // "pro" | "premium" | null
  const trialPro = trialParam === "pro"
  const trialPremium = trialParam === "premium"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const result = await signIn("credentials", {
        email: email.toLowerCase().trim(),
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("Email ou senha incorretos. Tente novamente.")
        setLoading(false)
        return
      }

      router.push("/app/dashboard")
      router.refresh()
    } catch {
      setError("Erro ao fazer login. Tente novamente.")
      setLoading(false)
    }
  }

  return (
    <div
      className="rounded-2xl p-8"
      style={{ background: "#1A1D27", border: "1px solid #2A2D3A" }}
    >
      {trialPremium && (
        <div
          className="flex items-start gap-2.5 px-4 py-3.5 rounded-xl mb-6 text-sm"
          style={{ background: "rgba(168,85,247,0.08)", border: "1px solid rgba(168,85,247,0.3)", color: "#A855F7" }}
        >
          <span className="mt-0.5">💎</span>
          <div>
            <p className="font-bold">Trial Premium ativado com sucesso!</p>
            <p className="text-xs mt-0.5" style={{ color: "#8B8FA8" }}>Seu plano Premium está ativo por 7 dias. Faça login para começar.</p>
          </div>
        </div>
      )}
      {trialPro && (
        <div
          className="flex items-start gap-2.5 px-4 py-3.5 rounded-xl mb-6 text-sm"
          style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)", color: "#F59E0B" }}
        >
          <span className="mt-0.5">⭐</span>
          <div>
            <p className="font-bold">Trial Pro ativado com sucesso!</p>
            <p className="text-xs mt-0.5" style={{ color: "#8B8FA8" }}>Seu plano Pro está ativo por 7 dias. Faça login para começar.</p>
          </div>
        </div>
      )}
      {registered && !trialPro && !trialPremium && (
        <div
          className="flex items-center gap-2.5 px-4 py-3 rounded-xl mb-6 text-sm"
          style={{ background: "rgba(0,208,132,0.08)", border: "1px solid rgba(0,208,132,0.2)", color: "#00D084" }}
        >
          <span>✓</span> Conta criada com sucesso! Faça login para continuar.
        </div>
      )}

      <h1 className="text-2xl font-bold mb-1" style={{ color: "#F4F4F5" }}>
        Bem-vindo de volta
      </h1>
      <p className="text-sm mb-6" style={{ color: "#8B8FA8" }}>
        Entre na sua conta para continuar
      </p>

      {error && (
        <div
          className="flex items-center gap-2.5 px-4 py-3 rounded-xl mb-4 text-sm"
          style={{ background: "rgba(255,77,79,0.08)", border: "1px solid rgba(255,77,79,0.2)", color: "#FF4D4F" }}
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: "#8B8FA8" }}>
            Email
          </label>
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

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-medium" style={{ color: "#8B8FA8" }}>Senha</label>
            <Link href="/forgot-password" className="text-xs" style={{ color: "#00D084" }}>
              Esqueci minha senha
            </Link>
          </div>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full px-4 py-3 pr-12 rounded-xl text-sm outline-none transition-all"
              style={{ background: "#212435", border: "1px solid #2A2D3A", color: "#F4F4F5" }}
              onFocus={(e) => (e.target.style.borderColor = "#00D084")}
              onBlur={(e) => (e.target.style.borderColor = "#2A2D3A")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
              style={{ color: "#4B4F6A" }}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-all duration-150 disabled:opacity-70 disabled:cursor-not-allowed"
          style={{ background: "#00D084", color: "#0F1117" }}
        >
          {loading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Entrando...</>
          ) : "Entrar"}
        </button>
      </form>

      <p className="text-center mt-6 text-sm" style={{ color: "#8B8FA8" }}>
        Não tem conta?{" "}
        <Link href="/register" className="font-semibold" style={{ color: "#00D084" }}>
          Criar conta grátis
        </Link>
      </p>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="rounded-2xl p-8" style={{ background: "#1A1D27", border: "1px solid #2A2D3A" }} />}>
      <LoginForm />
    </Suspense>
  )
}
