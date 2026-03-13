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
      id="cta"
      className="relative py-24 sm:py-32 overflow-hidden"
      style={{ background: "linear-gradient(180deg, #0F1117 0%, #0A0C12 100%)" }}
    >
      {/* Background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 80% 50% at 50% 100%, rgba(0,208,132,0.08) 0%, transparent 70%)",
        }}
      />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
        {/* Stats row */}
        <div className="flex flex-wrap justify-center gap-8 mb-12">
          {stats.map(({ value, label }) => (
            <div key={label} className="text-center">
              <p className="text-3xl font-black" style={{ color: "#00D084" }}>{value}</p>
              <p className="text-sm mt-1" style={{ color: "#8B8FA8" }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Headline */}
        <h2 className="text-3xl sm:text-5xl font-black mb-4 leading-tight" style={{ color: "#F4F4F5" }}>
          Descubra o dinheiro que<br />
          <span style={{ color: "#00D084" }}>está escondido no seu extrato</span>
        </h2>
        <p className="text-lg mb-10 max-w-xl mx-auto" style={{ color: "#8B8FA8" }}>
          Faça upload do seu extrato e em menos de 1 minuto receba um diagnóstico completo dos seus vazamentos financeiros.
        </p>

        {/* Email form */}
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto mb-8">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            required
            className="flex-1 px-4 py-3 rounded-xl text-sm outline-none"
            style={{
              background: "#1A1D27",
              border: "1px solid #2A2D3A",
              color: "#F4F4F5",
            }}
          />
          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all"
            style={{
              background: loading ? "#00A86B" : "#00D084",
              color: "#0F1117",
              opacity: loading ? 0.8 : 1,
            }}
          >
            <Zap className="w-4 h-4" />
            {loading ? "Redirecionando..." : "Começar grátis"}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        {/* Trust badges */}
        <div className="flex flex-wrap justify-center gap-4">
          {trust.map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-1.5">
              <Icon className="w-3.5 h-3.5" style={{ color: "#00D084" }} />
              <span className="text-xs" style={{ color: "#8B8FA8" }}>{text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
