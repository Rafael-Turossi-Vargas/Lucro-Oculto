"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, AlertTriangle, Zap, TrendingDown, ShieldCheck, CreditCard, Clock } from "lucide-react"

function useCountUp(target: number, duration = 1400, startDelay = 400) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    const timeout = setTimeout(() => {
      const steps = Math.ceil(duration / 16)
      const increment = target / steps
      let current = 0
      const timer = setInterval(() => {
        current = Math.min(current + increment, target)
        setValue(Math.round(current))
        if (current >= target) clearInterval(timer)
      }, 16)
      return () => clearInterval(timer)
    }, startDelay)
    return () => clearTimeout(timeout)
  }, [target, duration, startDelay])
  return value
}

const stats = [
  { value: "R$ 2,8M+", label: "em desperdício identificado" },
  { value: "1.240+", label: "empresas analisadas" },
  { value: "34pts", label: "melhora média no score" },
]

function DashboardMock() {
  const score = useCountUp(67, 1600, 600)
  const saving = useCountUp(4200, 1800, 800)

  return (
    <div
      className="relative w-full max-w-md mx-auto"
      style={{ perspective: "1200px" }}
    >
      {/* Outer glow */}
      <div
        className="absolute -inset-4 rounded-3xl blur-3xl opacity-25 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 30% 50%, rgba(0,208,132,0.5) 0%, transparent 55%), radial-gradient(ellipse at 80% 60%, rgba(59,130,246,0.4) 0%, transparent 55%)",
        }}
      />

      {/* Main card */}
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          boxShadow:
            "0 24px 80px rgba(0,0,0,0.4), 0 0 0 1px rgba(0,208,132,0.07)",
          transform: "rotateX(2deg) rotateY(-2deg)",
        }}
      >
        {/* Title bar */}
        <div
          className="flex items-center gap-2 px-4 py-2.5"
          style={{
            background: "linear-gradient(90deg, var(--bg-subtle) 0%, var(--bg-card) 100%)",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <div className="flex gap-1.5">
            {["#FF4D4F", "#F59E0B", "#00D084"].map((color, index) => (
              <div key={index} className="w-2.5 h-2.5 rounded-full" style={{ background: color, opacity: 0.75 }} />
            ))}
          </div>
          <div
            className="flex-1 rounded-md h-5 text-xs px-3 flex items-center"
            style={{ background: "var(--border)", color: "var(--text-faint)" }}
          >
            lucrooculto.com/app/dashboard
          </div>
        </div>

        {/* Body */}
        <div className="p-3.5 space-y-2.5">
          {/* KPI row */}
          <div className="grid grid-cols-2 gap-2.5">
            <div
              className="rounded-xl p-3"
              style={{
                background: "linear-gradient(135deg, rgba(0,208,132,0.1) 0%, rgba(0,208,132,0.03) 100%)",
                border: "1px solid rgba(0,208,132,0.22)",
              }}
            >
              <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>Score de Eficiência</p>
              <div className="flex items-baseline gap-1">
                <span
                  className="text-2xl font-bold font-mono tabular-nums"
                  style={{ color: "#00D084", textShadow: "0 0 20px rgba(0,208,132,0.4)" }}
                >
                  {score}
                </span>
                <span className="text-xs" style={{ color: "var(--text-faint)" }}>/100</span>
              </div>
              <p className="text-xs mt-0.5" style={{ color: "#F59E0B" }}>⚠ Atenção</p>
            </div>

            <div
              className="rounded-xl p-3"
              style={{
                background: "linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(59,130,246,0.03) 100%)",
                border: "1px solid rgba(59,130,246,0.18)",
              }}
            >
              <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>Receita / Despesa</p>
              <div className="flex items-baseline gap-1">
                <span className="text-base font-bold font-mono" style={{ color: "#3B82F6" }}>R$42k</span>
                <span className="text-xs" style={{ color: "var(--text-faint)" }}>/R$37k</span>
              </div>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-faint)" }}>Margem 11,9%</p>
            </div>
          </div>

          {/* Economia */}
          <div
            className="rounded-xl p-3"
            style={{
              background: "linear-gradient(135deg, rgba(0,208,132,0.08) 0%, rgba(0,168,107,0.04) 100%)",
              border: "1px solid rgba(0,208,132,0.15)",
            }}
          >
            <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>Economia potencial detectada</p>
            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold font-mono" style={{ color: "#00D084" }}>
                  R$ {saving.toLocaleString("pt-BR")}
                </span>
                <span className="text-xs" style={{ color: "var(--text-faint)" }}>– R$ 7.800 / mês</span>
              </div>
              <div
                className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
                style={{ background: "rgba(0,208,132,0.12)", color: "#00D084", border: "1px solid rgba(0,208,132,0.2)" }}
              >
                <TrendingDown className="w-3 h-3" />
                -18%
              </div>
            </div>
          </div>

          {/* Leaks */}
          <div className="rounded-xl p-3" style={{ background: "var(--bg-subtle)", border: "1px solid var(--border)" }}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>Vazamentos Detectados</p>
              <span
                className="text-xs px-1.5 py-0.5 rounded-full font-bold"
                style={{ background: "rgba(255,77,79,0.18)", color: "#FF4D4F" }}
              >
                5
              </span>
            </div>
            {[
              { icon: "🔄", text: "Assinaturas sobrepostas", val: "R$ 380/mês" },
              { icon: "📈", text: "Custo de marketing +43%", val: "R$ 1.200/mês" },
              { icon: "💳", text: "Ferramentas subutilizadas", val: "R$ 290/mês" },
            ].map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-1.5"
                style={{ borderTop: index > 0 ? "1px solid var(--border)" : undefined }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm">{item.icon}</span>
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>{item.text}</span>
                </div>
                <span className="text-xs font-semibold" style={{ color: "#FF4D4F" }}>{item.val}</span>
              </div>
            ))}
          </div>

          {/* Alert */}
          <div
            className="rounded-lg px-3 py-2 flex items-center gap-2"
            style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)" }}
          >
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" style={{ color: "#F59E0B" }} />
            <p className="text-xs" style={{ color: "var(--text-primary)" }}>
              Caixa pode entrar em pressão em <strong style={{ color: "#F59E0B" }}>22 dias</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function HeroEmailForm() {
  const router = useRouter()
  const [email, setEmail] = useState("")

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const q = email ? `?email=${encodeURIComponent(email)}` : ""
    router.push(`/register${q}`)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 w-full max-w-md mx-auto lg:mx-0">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Seu melhor email"
        className="flex-1 px-4 py-3 rounded-xl text-sm outline-none placeholder-[var(--text-faint)]"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          color: "var(--text-primary)",
        }}
      />
      <button
        type="submit"
        className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-sm whitespace-nowrap transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]"
        style={{
          background: "linear-gradient(135deg, #00D084 0%, #00B872 100%)",
          color: "var(--bg-page)",
          boxShadow: "0 0 24px rgba(0,208,132,0.4)",
        }}
      >
        Fazer diagnóstico grátis <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </form>
  )
}

export function Hero() {
  return (
    <section
      className="relative flex items-center pt-14 overflow-hidden"
      style={{ background: "var(--bg-page)" }}
    >
      {/* Grid */}
      <div
        className="absolute inset-0 opacity-[0.12] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(42,45,58,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(42,45,58,0.6) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />

      {/* Top-center glow */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "800px",
          height: "400px",
          background: "radial-gradient(ellipse at 50% 0%, rgba(0,208,132,0.08) 0%, transparent 65%)",
          filter: "blur(2px)",
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 w-full">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">

          {/* Left: copy */}
          <div className="text-center lg:text-left">

            {/* Pill badge */}
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-5"
              style={{
                background: "rgba(0,208,132,0.08)",
                border: "1px solid rgba(0,208,132,0.22)",
              }}
            >
              <Zap className="w-3 h-3" style={{ color: "#00D084" }} />
              <span className="text-xs font-semibold" style={{ color: "#00D084" }}>
                7 dias Pro grátis ao criar conta · Sem cartão de crédito
              </span>
            </div>

            {/* Headline */}
            <h1
              className="text-4xl sm:text-5xl font-extrabold leading-tight mb-4"
              style={{ color: "var(--text-primary)", letterSpacing: "-0.03em" }}
            >
              Seu diagnóstico{" "}
              <br className="hidden sm:block" />
              começa em{" "}
              <span
                style={{
                  background: "linear-gradient(90deg, #00D084 0%, #3FFFB0 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                30 segundos.
              </span>
            </h1>

            <p className="text-base mb-6 leading-relaxed max-w-lg mx-auto lg:mx-0" style={{ color: "var(--text-muted)" }}>
              Descubra agora quanto dinheiro sua empresa está perdendo.
              Sem consultores. Sem planilhas. Sem cartão de crédito.
            </p>

            {/* Email CTA */}
            <HeroEmailForm />

            {/* Trust badges */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-4 gap-y-1.5 mt-3">
              {[
                { icon: ShieldCheck, label: "Dados criptografados" },
                { icon: CreditCard, label: "Sem cartão de crédito" },
                { icon: Clock, label: "Resultado em 1 minuto" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <Icon className="w-3 h-3" style={{ color: "var(--text-faint)" }} />
                  <span className="text-xs" style={{ color: "var(--text-faint)" }}>{label}</span>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div
              className="mt-8 grid grid-cols-3 gap-4 pt-6"
              style={{ borderTop: "1px solid var(--border)" }}
            >
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="text-center lg:text-left"
                  style={{
                    paddingLeft: index > 0 ? "1rem" : 0,
                    borderLeft: index > 0 ? "1px solid var(--border)" : "none",
                  }}
                >
                  <p className="text-lg sm:text-xl font-bold font-mono" style={{ color: "var(--text-primary)" }}>
                    {stat.value}
                  </p>
                  <p className="text-xs mt-0.5 leading-snug" style={{ color: "var(--text-muted)" }}>
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: dashboard mock */}
          <div className="flex justify-center lg:justify-end pb-6 lg:pb-0">
            <DashboardMock />
          </div>
        </div>
      </div>
    </section>
  )
}
