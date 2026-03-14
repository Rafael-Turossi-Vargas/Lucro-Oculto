"use client"

import { Suspense, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"
import { Eye, EyeOff, Loader2, AlertCircle, ArrowRight, CheckCircle2, Lock } from "lucide-react"

function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [emailNotVerified, setEmailNotVerified] = useState(false)

  const registered = params.get("registered") === "true"
  const trialParam = params.get("trial")
  const trialPro = trialParam === "pro"
  const trialPremium = trialParam === "premium"
  const justVerified = params.get("verified") === "true"
  const tokenError = params.get("error")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    setEmailNotVerified(false)
    setLoading(true)

    try {
      const result = await signIn("credentials", {
        email: email.toLowerCase().trim(),
        password,
        redirect: false,
      })

      if (result?.error) {
        if (result.error === "EMAIL_NOT_VERIFIED") {
          setEmailNotVerified(true)
        } else {
          setError("Email ou senha incorretos. Tente novamente.")
        }
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
    <div>
      {/* Header */}
      <div className="flex items-start gap-4 mb-7">
        {/* Icon badge */}
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
          style={{
            background: "linear-gradient(135deg, rgba(0,208,132,0.15) 0%, rgba(0,208,132,0.06) 100%)",
            border: "1px solid rgba(0,208,132,0.25)",
            boxShadow: "0 0 20px rgba(0,208,132,0.1)",
          }}
        >
          <Lock className="w-4.5 h-4.5" style={{ color: "#00D084", width: "18px", height: "18px" }} />
        </div>
        <div>
          <h1
            className="text-2xl font-extrabold leading-tight"
            style={{ color: "var(--text-primary)", letterSpacing: "-0.02em" }}
          >
            Bem-vindo de volta
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            Entre na sua conta para continuar
          </p>
        </div>
      </div>

      {/* Status banners */}
      {trialPremium && (
        <div
          className="flex items-start gap-3 px-4 py-3 rounded-xl mb-5"
          style={{ background: "rgba(168,85,247,0.08)", border: "1px solid rgba(168,85,247,0.25)", color: "#A855F7" }}
        >
          <span className="mt-0.5 text-base">💎</span>
          <div>
            <p className="font-bold text-sm">Trial Premium ativado!</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Plano Premium ativo por 7 dias.</p>
          </div>
        </div>
      )}
      {trialPro && (
        <div
          className="flex items-start gap-3 px-4 py-3 rounded-xl mb-5"
          style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.22)", color: "#F59E0B" }}
        >
          <span className="mt-0.5 text-base">⭐</span>
          <div>
            <p className="font-bold text-sm">Trial Pro ativado!</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Plano Pro ativo por 7 dias.</p>
          </div>
        </div>
      )}
      {registered && !trialPro && !trialPremium && (
        <div
          className="flex items-start gap-2.5 px-4 py-3 rounded-xl mb-5"
          style={{ background: "rgba(0,208,132,0.07)", border: "1px solid rgba(0,208,132,0.2)", color: "#00D084" }}
        >
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold">Conta criada com sucesso!</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Verifique seu email para ativar o acesso antes de fazer login.</p>
          </div>
        </div>
      )}
      {justVerified && (
        <div
          className="flex items-center gap-2.5 px-4 py-3 rounded-xl mb-5"
          style={{ background: "rgba(0,208,132,0.07)", border: "1px solid rgba(0,208,132,0.2)", color: "#00D084" }}
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span className="text-sm font-semibold">Email verificado! Agora faça login para acessar sua conta.</span>
        </div>
      )}
      {tokenError === "token_expired" && (
        <div
          className="flex items-start gap-2.5 px-4 py-3 rounded-xl mb-5"
          style={{ background: "rgba(255,77,79,0.07)", border: "1px solid rgba(255,77,79,0.2)", color: "#FF4D4F" }}
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold">Link de verificação expirado</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Tente fazer login para receber um novo link de verificação.</p>
          </div>
        </div>
      )}
      {(tokenError === "token_invalid" || tokenError === "token_missing" || tokenError === "verify_failed") && (
        <div
          className="flex items-center gap-2.5 px-4 py-3 rounded-xl mb-5"
          style={{ background: "rgba(255,77,79,0.07)", border: "1px solid rgba(255,77,79,0.2)", color: "#FF4D4F" }}
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="text-sm">Link de verificação inválido. Solicite um novo cadastro.</span>
        </div>
      )}
      {emailNotVerified && (
        <div
          className="flex items-start gap-2.5 px-4 py-3 rounded-xl mb-5"
          style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)", color: "#F59E0B" }}
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold">Email ainda não verificado</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Acesse sua caixa de entrada e clique no link que enviamos. Verifique também o spam.</p>
          </div>
        </div>
      )}
      {error && (
        <div
          className="flex items-center gap-2.5 px-4 py-3 rounded-xl mb-5"
          style={{ background: "rgba(255,77,79,0.07)", border: "1px solid rgba(255,77,79,0.2)", color: "#FF4D4F" }}
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="seu@email.com"
            className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all duration-150"
            style={{
              background: "var(--bg-subtle)",
              border: "1px solid var(--border-hover)",
              color: "var(--text-primary)",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "rgba(0,208,132,0.45)"
              e.target.style.boxShadow = "0 0 0 3px rgba(0,208,132,0.07), inset 0 0 0 1px rgba(0,208,132,0.08)"
              e.target.style.background = "var(--bg-subtle)"
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "var(--border-hover)"
              e.target.style.boxShadow = "none"
              e.target.style.background = "var(--bg-subtle)"
            }}
          />
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
              Senha
            </label>
            <Link
              href="/forgot-password"
              className="text-xs font-semibold transition-opacity hover:opacity-75"
              style={{ color: "#00D084" }}
            >
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
              className="w-full px-4 py-3 pr-11 rounded-xl text-sm outline-none transition-all duration-150"
              style={{
                background: "var(--bg-subtle)",
                border: "1px solid var(--border)",
                color: "var(--text-primary)",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "rgba(0,208,132,0.45)"
                e.target.style.boxShadow = "0 0 0 3px rgba(0,208,132,0.07), inset 0 0 0 1px rgba(0,208,132,0.08)"
                e.target.style.background = "var(--bg-subtle)"
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "var(--border)"
                e.target.style.boxShadow = "none"
                e.target.style.background = "var(--bg-subtle)"
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 transition-opacity hover:opacity-70"
              style={{ color: "var(--text-faint)" }}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={loading}
          className="relative w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-all duration-200 disabled:brightness-90 disabled:cursor-not-allowed overflow-hidden group"
          style={{
            background: "linear-gradient(135deg, #00D084 0%, #00B872 100%)",
            color: "#0A0C14",
            boxShadow: loading ? "none" : "0 4px 24px rgba(0,208,132,0.4), 0 1px 0 rgba(255,255,255,0.15) inset",
          }}
        >
          {/* Shimmer overlay on hover */}
          <span
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
            style={{
              background: "linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.15) 50%, transparent 70%)",
            }}
          />
          {loading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Entrando...</>
          ) : (
            <>Acessar minha conta <ArrowRight className="w-4 h-4" /></>
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-3 my-5">
        <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, transparent, var(--border))" }} />
        <span className="text-xs font-medium" style={{ color: "var(--text-faint)" }}>OU</span>
        <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, var(--border), transparent)" }} />
      </div>

      {/* Register link */}
      <Link
        href="/register"
        className="flex items-center justify-between w-full px-4 py-3.5 rounded-xl transition-all duration-150 group hover:border-[rgba(0,208,132,0.2)]"
        style={{
          background: "var(--bg-subtle)",
          border: "1px solid var(--border)",
        }}
      >
        <div>
          <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Não tem conta ainda?</p>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-faint)" }}>Crie grátis · Trial Pro por 7 dias</p>
        </div>
        <div
          className="flex items-center gap-1.5 text-sm font-bold transition-transform duration-150 group-hover:translate-x-0.5"
          style={{ color: "#00D084" }}
        >
          Criar conta <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </Link>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="space-y-4 animate-pulse">
        <div className="h-14 rounded-xl" style={{ background: "var(--bg-card)" }} />
        <div className="h-12 rounded-xl" style={{ background: "var(--bg-card)" }} />
        <div className="h-12 rounded-xl" style={{ background: "var(--bg-card)" }} />
        <div className="h-12 rounded-xl" style={{ background: "var(--bg-card)" }} />
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
