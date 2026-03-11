"use client"

import { useState } from "react"
import Link from "next/link"
import { Check, Zap, Star, Building2 } from "lucide-react"

const plans = [
  {
    name: "Grátis",
    icon: Zap,
    price: { monthly: 0, annual: 0 },
    description: "Para testar e descobrir o diagnóstico",
    cta: "Começar grátis",
    href: "/register",
    popular: false,
    iconColor: "#8B8FA8",
    iconBg: "rgba(139,143,168,0.1)",
    features: [
      "1 análise por mês",
      "Até 200 linhas de dados",
      "Score de eficiência básico",
      "3 alertas principais",
      "Relatório resumido",
      "Sem histórico",
    ],
    missing: ["Análises ilimitadas", "Exportação PDF", "Alertas ilimitados", "Multi-empresa"],
  },
  {
    name: "Pro",
    icon: Star,
    price: { monthly: 97, annual: 970 },
    description: "Para quem leva gestão financeira a sério",
    cta: "Assinar Pro",
    href: "/register?plan=pro",
    popular: true,
    iconColor: "#00D084",
    iconBg: "rgba(0,208,132,0.1)",
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
    missing: [],
  },
  {
    name: "Premium",
    icon: Building2,
    price: { monthly: 297, annual: 2970 },
    description: "Para empresas maiores ou múltiplos negócios",
    cta: "Assinar Premium",
    href: "/register?plan=premium",
    popular: false,
    iconColor: "#F59E0B",
    iconBg: "rgba(245,158,11,0.1)",
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
    missing: [],
  },
]

export function PricingSection() {
  const [annual, setAnnual] = useState(false)

  return (
    <section
      id="pricing"
      className="py-24"
      style={{ background: "#1A1D27", borderTop: "1px solid #2A2D3A", borderBottom: "1px solid #2A2D3A" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <span
            className="inline-block text-xs font-semibold uppercase tracking-widest mb-3 px-3 py-1 rounded-full"
            style={{ color: "#00D084", background: "rgba(0,208,132,0.08)", border: "1px solid rgba(0,208,132,0.15)" }}
          >
            Preços
          </span>
          <h2
            className="text-3xl sm:text-4xl font-extrabold mb-4"
            style={{ color: "#F4F4F5", letterSpacing: "-0.02em" }}
          >
            Quanto custa perder R$ 5.000 por mês?
          </h2>
          <p className="text-lg max-w-xl mx-auto mb-8" style={{ color: "#8B8FA8" }}>
            O diagnóstico custa muito menos do que o desperdício que ele elimina.
          </p>

          {/* Toggle */}
          <div
            className="inline-flex items-center gap-3 p-1 rounded-xl"
            style={{ background: "#0F1117", border: "1px solid #2A2D3A" }}
          >
            <button
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
              style={{
                background: !annual ? "#1A1D27" : "transparent",
                color: !annual ? "#F4F4F5" : "#8B8FA8",
                border: !annual ? "1px solid #2A2D3A" : "1px solid transparent",
              }}
              onClick={() => setAnnual(false)}
            >
              Mensal
            </button>
            <button
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
              style={{
                background: annual ? "#1A1D27" : "transparent",
                color: annual ? "#F4F4F5" : "#8B8FA8",
                border: annual ? "1px solid #2A2D3A" : "1px solid transparent",
              }}
              onClick={() => setAnnual(true)}
            >
              Anual
              <span
                className="text-xs px-1.5 py-0.5 rounded-full font-semibold"
                style={{ background: "rgba(0,208,132,0.15)", color: "#00D084" }}
              >
                -17%
              </span>
            </button>
          </div>
        </div>

        {/* Plans */}
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan, i) => {
            const Icon = plan.icon
            const price = annual ? plan.price.annual / 12 : plan.price.monthly
            const displayPrice = plan.price.monthly === 0 ? "R$0" : `R$${Math.round(price)}`

            return (
              <div
                key={i}
                className="relative rounded-2xl p-6 flex flex-col transition-all duration-200"
                style={{
                  background: plan.popular
                    ? "linear-gradient(135deg, rgba(0,208,132,0.06) 0%, rgba(15,17,23,0) 60%)"
                    : "#0F1117",
                  border: plan.popular ? "1px solid #00D084" : "1px solid #2A2D3A",
                  boxShadow: plan.popular ? "0 0 40px rgba(0,208,132,0.1)" : undefined,
                }}
              >
                {/* Popular badge */}
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-2">
                    <span
                      className="px-3 py-1 rounded-full text-xs font-bold"
                      style={{ background: "#00D084", color: "#0F1117" }}
                    >
                      Mais popular
                    </span>
                  </div>
                )}

                {/* Plan icon + name */}
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center"
                    style={{ background: plan.iconBg }}
                  >
                    <Icon className="w-4 h-4" style={{ color: plan.iconColor }} />
                  </div>
                  <div>
                    <p className="font-bold text-base" style={{ color: "#F4F4F5" }}>{plan.name}</p>
                    <p className="text-xs" style={{ color: "#8B8FA8" }}>{plan.description}</p>
                  </div>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold font-mono" style={{ color: "#F4F4F5" }}>
                      {displayPrice}
                    </span>
                    {plan.price.monthly > 0 && (
                      <span className="text-sm" style={{ color: "#8B8FA8" }}>/mês</span>
                    )}
                  </div>
                  {annual && plan.price.annual > 0 && (
                    <p className="text-xs mt-1" style={{ color: "#8B8FA8" }}>
                      R${plan.price.annual}/ano — economize R${plan.price.monthly * 12 - plan.price.annual}
                    </p>
                  )}
                </div>

                {/* CTA */}
                <Link
                  href={plan.href}
                  className="block text-center px-4 py-3 rounded-xl font-bold text-sm transition-all duration-150 mb-2"
                  style={{
                    background: plan.popular ? "#00D084" : "transparent",
                    color: plan.popular ? "#0F1117" : "#F4F4F5",
                    border: plan.popular ? "none" : "1px solid #2A2D3A",
                  }}
                >
                  {plan.cta}
                </Link>
                {plan.popular && (
                  <p className="text-center text-xs mb-4" style={{ color: "#00D084" }}>
                    ✓ 7 dias grátis · Cartão necessário · Sem cobrança no trial
                  </p>
                )}
                {!plan.popular && plan.price.monthly === 0 && (
                  <p className="text-center text-xs mb-4" style={{ color: "#4B4F6A" }}>
                    Sem cartão de crédito necessário
                  </p>
                )}
                {!plan.popular && plan.price.monthly > 0 && (
                  <div className="mb-4" />
                )}

                {/* Features */}
                <div className="space-y-2.5 flex-1">
                  {plan.features.map((feat, j) => (
                    <div key={j} className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "#00D084" }} />
                      <span className="text-sm" style={{ color: "#8B8FA8" }}>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* Trial note */}
        <div
          className="mt-8 flex items-center justify-center gap-2 py-3 px-5 rounded-xl max-w-lg mx-auto"
          style={{ background: "rgba(0,208,132,0.06)", border: "1px solid rgba(0,208,132,0.15)" }}
        >
          <Zap className="w-4 h-4 shrink-0" style={{ color: "#00D084" }} />
          <p className="text-sm text-center" style={{ color: "#8B8FA8" }}>
            Ao criar conta, você recebe <strong style={{ color: "#00D084" }}>7 dias do plano Pro de graça</strong> — sem cartão de crédito. Após o período, volta automaticamente ao plano Grátis.
          </p>
        </div>

        <p className="text-center mt-4 text-sm" style={{ color: "#4B4F6A" }}>
          Sem taxa de setup · Cancele quando quiser · Dados seguros com criptografia
        </p>
      </div>
    </section>
  )
}
