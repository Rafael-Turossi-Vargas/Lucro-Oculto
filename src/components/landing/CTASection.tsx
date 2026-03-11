"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, ShieldCheck, CreditCard, Clock, Lock, Zap } from "lucide-react"

const trust = [
  { icon: ShieldCheck, text: "Dados criptografados" },
  { icon: CreditCard, text: "Sem cartão de crédito" },
  { icon: Clock, text: "Resultado em 1 minuto" },
  { icon: Lock, text: "Conformidade LGPD" },
]

const stats = [
  { value: "R$ 2,8M+", label: "em desperdício identificado" },
  { value: "1.240+", label: "empresas analisadas" },
  { value: "34pts", label: "melhora média no score" },
]

export function CTASection() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    router.push(`/register?email=${encodeURIComponent(email)}`)
  }

  return (
    <section
      className="py-28 relative overflow-hidden"
      style={{ background: "#0F1117", borderTop: "1px solid #2A2D3A" }}
    >
      {/* Background radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 80% 60% at 50% 110%, rgba(0,208,132,0.12) 0%, transparent 70%)",
        }}
      />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(42,45,58,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(42,45,58,0.4) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">

        {/* Badge */}
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-8"
          style={{ background: "rgba(0,208,132,0.08)", border: "1px solid rgba(0,208,132,0.2)" }}
        >
          <Zap className="w-3.5 h-3.5" style={{ color: "#00D084" }} />
          <span className="text-xs font-semibold" style={{ color: "#00D084" }}>
            7 dias Pro grátis ao criar conta · Sem cartão de crédito
          </span>
        </div>

        {/* Headline */}
        <h2
          className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-5"
          style={{ color: "#F4F4F5", letterSpacing: "-0.03em" }}
        >
          Seu diagnóstico começa{" "}
          <span style={{ color: "#00D084" }}>em 30 segundos.</span>
        </h2>

        <p className="text-lg sm:text-xl mb-10 max-w-xl mx-auto leading-relaxed" style={{ color: "#8B8FA8" }}>
          Descubra agora quanto dinheiro sua empresa está perdendo. Sem consultores. Sem planilhas. Sem cartão de crédito.
        </p>

        {/* Stats row */}
        <div
          className="inline-flex flex-wrap items-center justify-center gap-6 sm:gap-10 px-6 py-4 rounded-2xl mb-10"
          style={{ background: "#1A1D27", border: "1px solid #2A2D3A" }}
        >
          {stats.map((s, i) => (
            <div key={i} className="text-center">
              <p className="text-lg sm:text-xl font-extrabold font-mono" style={{ color: "#F4F4F5" }}>
                {s.value}
              </p>
              <p className="text-xs" style={{ color: "#4B4F6A" }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto mb-6">
          <input
            type="email"
            placeholder="Seu melhor email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="flex-1 px-4 py-4 rounded-xl text-sm outline-none transition-all"
            style={{ background: "#1A1D27", border: "1px solid #2A2D3A", color: "#F4F4F5" }}
            onFocus={(e) => (e.target.style.borderColor = "#00D084")}
            onBlur={(e) => (e.target.style.borderColor = "#2A2D3A")}
          />
          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold text-sm transition-all duration-200 shrink-0 disabled:opacity-70 animate-pulse-glow"
            style={{ background: "#00D084", color: "#0F1117" }}
            onMouseOver={(e) => (e.currentTarget.style.background = "#00A86B")}
            onMouseOut={(e) => (e.currentTarget.style.background = "#00D084")}
          >
            {loading ? "Aguarde..." : (
              <>Fazer diagnóstico grátis <ArrowRight className="w-4 h-4" /></>
            )}
          </button>
        </form>

        {/* Trust badges */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
          {trust.map((item, i) => {
            const Icon = item.icon
            return (
              <div key={i} className="flex items-center gap-1.5">
                <Icon className="w-3.5 h-3.5" style={{ color: "#4B4F6A" }} />
                <span className="text-xs" style={{ color: "#4B4F6A" }}>{item.text}</span>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
