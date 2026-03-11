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
      className="py-20 relative overflow-hidden"
      style={{ background: "#0F1117", borderTop: "1px solid #2A2D3A" }}
    >
      {/* Large dramatic green radial glow — bottom center */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none"
        style={{
          width: "1000px",
          height: "700px",
          background:
            "radial-gradient(ellipse at 50% 100%, rgba(0,208,132,0.22) 0%, rgba(0,208,132,0.06) 40%, transparent 70%)",
          filter: "blur(2px)",
        }}
      />

      {/* Secondary blue glow top-right */}
      <div
        className="absolute top-0 right-0 pointer-events-none"
        style={{
          width: "500px",
          height: "400px",
          background:
            "radial-gradient(ellipse at 100% 0%, rgba(59,130,246,0.08) 0%, transparent 60%)",
        }}
      />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(42,45,58,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(42,45,58,0.5) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* Floating orb decorations */}
      <div
        className="absolute left-12 top-1/3 w-48 h-48 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(0,208,132,0.12) 0%, transparent 70%)",
          filter: "blur(32px)",
        }}
      />
      <div
        className="absolute right-16 bottom-1/4 w-64 h-64 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />
      <div
        className="absolute right-1/4 top-1/4 w-32 h-32 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(245,158,11,0.06) 0%, transparent 70%)",
          filter: "blur(24px)",
        }}
      />

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
          style={{
            background: "rgba(0,208,132,0.08)",
            border: "1px solid rgba(0,208,132,0.22)",
            boxShadow: "0 0 20px rgba(0,208,132,0.12)",
          }}
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
          <span
            style={{
              background: "linear-gradient(90deg, #00D084 0%, #3FFFB0 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            em 30 segundos.
          </span>
        </h2>

        <p
          className="text-lg sm:text-xl mb-10 max-w-xl mx-auto leading-relaxed"
          style={{ color: "#8B8FA8" }}
        >
          Descubra agora quanto dinheiro sua empresa está perdendo. Sem consultores. Sem planilhas. Sem cartão de crédito.
        </p>

        {/* Stats row */}
        <div
          className="inline-flex flex-wrap items-center justify-center gap-6 sm:gap-10 px-6 py-4 rounded-2xl mb-10"
          style={{
            background: "rgba(26,29,39,0.8)",
            border: "1px solid #2A2D3A",
            backdropFilter: "blur(8px)",
          }}
        >
          {stats.map((s, i) => (
            <div
              key={i}
              className="text-center"
              style={{
                paddingLeft: i > 0 ? "1.5rem" : 0,
                borderLeft: i > 0 ? "1px solid #2A2D3A" : "none",
              }}
            >
              <p
                className="text-lg sm:text-xl font-extrabold font-mono"
                style={{ color: "#F4F4F5" }}
              >
                {s.value}
              </p>
              <p className="text-xs" style={{ color: "#4B4F6A" }}>
                {s.label}
              </p>
            </div>
          ))}
        </div>

        {/* Email form */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto mb-8"
        >
          <input
            type="email"
            placeholder="Seu melhor email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="flex-1 px-5 py-4 text-sm outline-none transition-all"
            style={{
              background: "rgba(26,29,39,0.9)",
              border: "1px solid #2A2D3A",
              borderRadius: "9999px",
              color: "#F4F4F5",
              backdropFilter: "blur(4px)",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "rgba(0,208,132,0.6)"
              e.target.style.boxShadow = "0 0 16px rgba(0,208,132,0.15)"
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#2A2D3A"
              e.target.style.boxShadow = "none"
            }}
          />
          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 px-6 py-4 font-bold text-sm transition-all duration-200 shrink-0 disabled:opacity-70 hover:scale-[1.03] active:scale-[0.98]"
            style={{
              background: "linear-gradient(135deg, #00D084 0%, #00B872 100%)",
              color: "#0F1117",
              borderRadius: "9999px",
              boxShadow: "0 0 28px rgba(0,208,132,0.45), 0 4px 12px rgba(0,0,0,0.3)",
            }}
          >
            {loading ? (
              "Aguarde..."
            ) : (
              <>
                Fazer diagnóstico grátis <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Trust badges — pill row */}
        <div
          className="inline-flex flex-wrap items-center justify-center gap-1 px-4 py-2 rounded-full"
          style={{
            background: "rgba(26,29,39,0.7)",
            border: "1px solid #2A2D3A",
          }}
        >
          {trust.map((item, i) => {
            const Icon = item.icon
            return (
              <div
                key={i}
                className="flex items-center gap-1.5 px-3 py-1"
                style={{
                  borderRight: i < trust.length - 1 ? "1px solid #2A2D3A" : "none",
                }}
              >
                <Icon className="w-3.5 h-3.5" style={{ color: "#00D084" }} />
                <span className="text-xs font-medium" style={{ color: "#8B8FA8" }}>
                  {item.text}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
