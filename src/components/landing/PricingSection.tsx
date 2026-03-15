"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { Check, Zap, Star, Building2, TrendingUp, ArrowRight } from "lucide-react"

const plans = [
  {
    name: "Grátis",
    icon: Zap,
    price: { monthly: 0, annual: 0 },
    description: "Para testar o diagnóstico",
    cta: "Começar grátis",
    ctaNote: "Sem cartão de crédito",
    href: "/register",
    popular: false,
    color: "#8B8FA8",
    bg: "rgba(139,143,168,0.06)",
    border: "#2A2D3A",
    features: [
      "1 análise por mês",
      "Até 200 linhas de dados",
      "Score de eficiência básico",
      "3 alertas principais",
      "Relatório resumido",
    ],
  },
  {
    name: "Pro",
    icon: Star,
    price: { monthly: 97, annual: 970 },
    description: "Para quem leva gestão financeira a sério",
    cta: "Começar 7 dias grátis",
    ctaNote: "✓ Sem cobrança no trial · Cancele quando quiser",
    href: "/register?plan=pro",
    popular: true,
    color: "#00D084",
    bg: "rgba(0,208,132,0.07)",
    border: "rgba(0,208,132,0.45)",
    features: [
      "Análises ilimitadas",
      "Até 10.000 linhas por upload",
      "Score completo com subscores",
      "Alertas ilimitados",
      "Plano de ação priorizado",
      "Histórico de 12 meses",
      "Exportação PDF premium",
      "Suporte por email",
    ],
  },
  {
    name: "Premium",
    icon: Building2,
    price: { monthly: 297, annual: 2970 },
    description: "Para múltiplos negócios",
    cta: "Assinar Premium",
    ctaNote: "7 dias grátis incluídos",
    href: "/register?plan=premium",
    popular: false,
    color: "#F59E0B",
    bg: "rgba(245,158,11,0.06)",
    border: "#2A2D3A",
    features: [
      "Tudo do Pro",
      "Até 3 empresas",
      "Até 50.000 linhas por upload",
      "Benchmark por nicho",
      "Multi-usuário (até 5)",
      "Relatórios avançados",
      "Integração bancária (em breve)",
      "Suporte prioritário",
    ],
  },
]

export function PricingSection() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const [annual, setAnnual] = useState(() => searchParams.get("billing") === "annual")

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    if (annual) {
      params.set("billing", "annual")
    } else {
      params.delete("billing")
    }
    const query = params.toString()
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }, [annual]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <section
      id="pricing"
      className="py-12 relative overflow-hidden"
      style={{
        background: "linear-gradient(180deg, var(--bg-page) 0%, var(--bg-card) 100%)",
        borderTop: "1px solid var(--border)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      {/* Green glow top-center */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none"
        style={{
          width: "800px",
          height: "500px",
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(0,208,132,0.1) 0%, transparent 65%)",
          filter: "blur(1px)",
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-5">
          <span
            className="inline-block text-xs font-semibold uppercase tracking-widest mb-3 px-3 py-1.5 rounded-full"
            style={{
              color: "#00D084",
              background: "rgba(0,208,132,0.08)",
              border: "1px solid rgba(0,208,132,0.18)",
            }}
          >
            Preços
          </span>
          <h2
            className="text-2xl sm:text-3xl font-extrabold mb-2"
            style={{ color: "var(--text-primary)", letterSpacing: "-0.02em" }}
          >
            Quanto custa{" "}
            <span
              style={{
                background: "linear-gradient(90deg, #FF4D4F 0%, #FF7875 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              perder R$ 5.000/mês?
            </span>
          </h2>
          <p className="text-sm max-w-md mx-auto mb-4" style={{ color: "var(--text-muted)" }}>
            O diagnóstico custa muito menos do que o desperdício que ele elimina.
          </p>

          {/* ROI callout — above toggle */}
          <div
            className="inline-flex items-center gap-3 px-4 py-2 rounded-full mb-4"
            style={{
              background: "linear-gradient(135deg, rgba(0,208,132,0.1) 0%, rgba(0,208,132,0.04) 100%)",
              border: "1px solid rgba(0,208,132,0.25)",
              boxShadow: "0 0 24px rgba(0,208,132,0.08)",
            }}
          >
            <TrendingUp className="w-4 h-4 shrink-0" style={{ color: "#00D084" }} />
            <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>
              ROI típico: <span style={{ color: "#F59E0B", fontWeight: 700 }}>R$97/mês</span>
              <span style={{ color: "var(--text-faint)" }}> → </span>
              <span style={{ color: "#00D084", fontWeight: 700 }}>R$2.400+ em economia identificada</span>
            </p>
          </div>

          {/* Toggle */}
          <div className="flex justify-center">
            <div
              className="inline-flex items-center p-1 rounded-full"
              style={{
                background: "var(--bg-page)",
                border: "1px solid var(--border)",
              }}
            >
              <button
                className="px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200"
                style={{
                  background: !annual ? "var(--bg-card)" : "transparent",
                  color: !annual ? "var(--text-primary)" : "var(--text-faint)",
                  boxShadow: !annual ? "0 1px 6px rgba(0,0,0,0.5)" : "none",
                }}
                onClick={() => setAnnual(false)}
              >
                Mensal
              </button>
              <button
                className="px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 flex items-center gap-2"
                style={{
                  background: annual ? "var(--bg-card)" : "transparent",
                  color: annual ? "var(--text-primary)" : "var(--text-faint)",
                  boxShadow: annual ? "0 1px 6px rgba(0,0,0,0.5)" : "none",
                }}
                onClick={() => setAnnual(true)}
              >
                Anual
                {(() => {
                  const maxPct = Math.max(...plans.filter(p => p.price.monthly > 0).map(p => {
                    const saving = p.price.monthly * 12 - p.price.annual
                    return Math.round((saving / (p.price.monthly * 12)) * 100)
                  }))
                  return (
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded-full font-bold"
                      style={{
                        background: "rgba(0,208,132,0.15)",
                        color: "#00D084",
                        border: "1px solid rgba(0,208,132,0.25)",
                      }}
                    >
                      -{maxPct}%
                    </span>
                  )
                })()}
              </button>
            </div>
          </div>
        </div>

        {/* Plans */}
        <div className="grid md:grid-cols-3 gap-4 items-stretch">
          {plans.map((plan, i) => {
            const Icon = plan.icon
            const price = annual ? plan.price.annual / 12 : plan.price.monthly
            const displayPrice = plan.price.monthly === 0 ? "R$0" : `R$${Math.round(price)}`

            if (plan.popular) {
              return (
                <div
                  key={i}
                  className="relative rounded-2xl flex flex-col"
                  style={{
                    background: "linear-gradient(160deg, rgba(0,208,132,0.09) 0%, rgba(0,208,132,0.03) 50%, var(--bg-page) 100%)",
                    border: "1px solid rgba(0,208,132,0.45)",
                    boxShadow: "0 0 60px rgba(0,208,132,0.14), 0 0 0 1px rgba(0,208,132,0.08), 0 20px 60px rgba(0,0,0,0.5)",
                    padding: "20px 20px 20px",
                  }}
                >
                  {/* Top glow line */}
                  <div
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px"
                    style={{ background: "linear-gradient(90deg, transparent, rgba(0,208,132,0.6), transparent)" }}
                  />

                  {/* "Mais popular" badge */}
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span
                      className="flex items-center gap-1.5 px-4 py-1 rounded-full text-xs font-bold whitespace-nowrap"
                      style={{
                        background: "linear-gradient(135deg, #00D084 0%, #00B872 100%)",
                        color: "var(--bg-page)",
                        boxShadow: "0 4px 16px rgba(0,208,132,0.45)",
                      }}
                    >
                      <Star className="w-3 h-3 fill-current" />
                      Mais popular
                    </span>
                  </div>

                  {/* Plan name */}
                  <div className="flex items-center gap-2.5 mb-3">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center"
                      style={{
                        background: "rgba(0,208,132,0.12)",
                        border: "1px solid rgba(0,208,132,0.3)",
                        boxShadow: "0 0 16px rgba(0,208,132,0.2)",
                      }}
                    >
                      <Icon className="w-4 h-4" style={{ color: "#00D084" }} />
                    </div>
                    <div>
                      <p className="font-bold text-base" style={{ color: "var(--text-primary)" }}>{plan.name}</p>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>{plan.description}</p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mb-3">
                    <div className="flex items-baseline gap-1">
                      <span
                        className="text-3xl font-extrabold font-mono"
                        style={{ color: "var(--text-primary)", letterSpacing: "-0.02em" }}
                      >
                        {displayPrice}
                      </span>
                      <span className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>/mês</span>
                    </div>
                    {annual && (
                      <p className="text-xs mt-1 font-medium" style={{ color: "#00D084" }}>
                        R${plan.price.annual}/ano · economia de R${plan.price.monthly * 12 - plan.price.annual}
                      </p>
                    )}
                  </div>

                  {/* CTA */}
                  <Link
                    href={plan.href}
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm transition-all duration-150 mb-1 hover:scale-[1.02] active:scale-[0.98]"
                    style={{
                      background: "linear-gradient(135deg, #00D084 0%, #00B872 100%)",
                      color: "var(--bg-page)",
                      boxShadow: "0 4px 24px rgba(0,208,132,0.5), 0 1px 0 rgba(255,255,255,0.1) inset",
                    }}
                  >
                    {plan.cta} <ArrowRight className="w-4 h-4" />
                  </Link>
                  <p className="text-center text-xs mb-3" style={{ color: "#00D084" }}>
                    {plan.ctaNote}
                  </p>

                  {/* Divider */}
                  <div className="mb-3 h-px" style={{ background: "rgba(0,208,132,0.12)" }} />

                  {/* Features */}
                  <div className="space-y-1.5 flex-1">
                    {plan.features.map((feat, j) => (
                      <div key={j} className="flex items-center gap-2">
                        <Check className="w-4 h-4 shrink-0" style={{ color: "#00D084" }} />
                        <span className="text-xs" style={{ color: "var(--text-muted)" }}>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            }

            return (
              <div
                key={i}
                className="relative rounded-2xl p-4 flex flex-col transition-all duration-200 hover:-translate-y-1"
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                  borderTop: `2px solid ${plan.color}30`,
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = plan.color + "30"
                  e.currentTarget.style.boxShadow = `0 8px 32px rgba(0,0,0,0.3), 0 0 0 1px ${plan.color}20`
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = "var(--border)"
                  e.currentTarget.style.boxShadow = "none"
                }}
              >
                {/* Plan name */}
                <div className="flex items-center gap-2.5 mb-3">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center"
                    style={{
                      background: `${plan.color}12`,
                      border: `1px solid ${plan.color}25`,
                    }}
                  >
                    <Icon className="w-4 h-4" style={{ color: plan.color }} />
                  </div>
                  <div>
                    <p className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>{plan.name}</p>
                    <p className="text-xs" style={{ color: "var(--text-faint)" }}>{plan.description}</p>
                  </div>
                </div>

                {/* Price */}
                <div className="mb-3">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-extrabold font-mono" style={{ color: "var(--text-primary)" }}>
                      {displayPrice}
                    </span>
                    {plan.price.monthly > 0 && (
                      <span className="text-xs" style={{ color: "var(--text-muted)" }}>/mês</span>
                    )}
                  </div>
                  {annual && plan.price.annual > 0 && (
                    <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                      R${plan.price.annual}/ano
                    </p>
                  )}
                </div>

                {/* CTA */}
                <Link
                  href={plan.href}
                  className="block text-center px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-150 mb-1"
                  style={{
                    background: "var(--bg-subtle)",
                    color: "var(--text-primary)",
                    border: "1px solid var(--border)",
                  }}
                >
                  {plan.cta}
                </Link>
                <p className="text-center text-xs mb-3" style={{ color: "var(--text-faint)" }}>
                  {plan.ctaNote}
                </p>

                {/* Divider */}
                <div className="mb-2.5 h-px" style={{ background: "var(--border)" }} />

                {/* Features */}
                <div className="space-y-1.5 flex-1">
                  {plan.features.map((feat, j) => (
                    <div key={j} className="flex items-center gap-2">
                      <Check className="w-4 h-4 shrink-0" style={{ color: plan.color }} />
                      <span className="text-xs" style={{ color: "var(--text-muted)" }}>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* Bottom trust */}
        <p className="text-center mt-4 text-xs" style={{ color: "var(--text-faint)" }}>
          Sem taxa de setup · Cancele quando quiser · Dados criptografados
        </p>
      </div>
    </section>
  )
}
