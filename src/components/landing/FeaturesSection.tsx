"use client"

import { Gauge, Droplets, Coins, Bell, ListChecks, FileDown } from "lucide-react"

const features = [
  {
    icon: Gauge,
    title: "Score de Eficiência Financeira",
    description:
      "Um número de 0 a 100 que resume a saúde financeira da sua empresa. Com subscores por categoria: assinaturas, fornecedores, caixa e mais.",
    color: "#00D084",
    bg: "rgba(0,208,132,0.08)",
    border: "rgba(0,208,132,0.15)",
  },
  {
    icon: Droplets,
    title: "Detecção de Vazamentos",
    description:
      "Identificamos assinaturas esquecidas, ferramentas sobrepostas, pagamentos duplicados, concentração de custos e anomalias de crescimento.",
    color: "#FF4D4F",
    bg: "rgba(255,77,79,0.08)",
    border: "rgba(255,77,79,0.15)",
  },
  {
    icon: Coins,
    title: "Economia em Reais",
    description:
      "Não mostramos apenas percentuais abstratos. Cada oportunidade vem com um valor estimado de economia mensal em R$.",
    color: "#F59E0B",
    bg: "rgba(245,158,11,0.08)",
    border: "rgba(245,158,11,0.15)",
  },
  {
    icon: Bell,
    title: "Alertas Inteligentes",
    description:
      "Receba alertas como: &ldquo;Seu custo de marketing cresceu 43%&rdquo; ou &ldquo;Seu caixa pode entrar em pressão em 22 dias.&rdquo;",
    color: "#3B82F6",
    bg: "rgba(59,130,246,0.08)",
    border: "rgba(59,130,246,0.15)",
  },
  {
    icon: ListChecks,
    title: "Plano de Ação Priorizado",
    description:
      "Uma lista ordenada de ações concretas, com impacto, urgência, dificuldade e economia estimada. Sabe o que fazer primeiro.",
    color: "#8B5CF6",
    bg: "rgba(139,92,246,0.08)",
    border: "rgba(139,92,246,0.15)",
  },
  {
    icon: FileDown,
    title: "Relatório PDF Premium",
    description:
      "Exporte um relatório profissional com visual de consultoria estratégica. Ideal para apresentar para sócios, investidores ou contador.",
    color: "#06B6D4",
    bg: "rgba(6,182,212,0.08)",
    border: "rgba(6,182,212,0.15)",
  },
]

export function FeaturesSection() {
  return (
    <section
      id="features"
      className="py-24"
      style={{ background: "#0F1117" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <span
            className="inline-block text-xs font-semibold uppercase tracking-widest mb-3 px-3 py-1 rounded-full"
            style={{ color: "#00D084", background: "rgba(0,208,132,0.08)", border: "1px solid rgba(0,208,132,0.15)" }}
          >
            Recursos
          </span>
          <h2
            className="text-3xl sm:text-4xl font-extrabold mb-4"
            style={{ color: "#F4F4F5", letterSpacing: "-0.02em" }}
          >
            Tudo que você precisa para parar de perder dinheiro
          </h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: "#8B8FA8" }}>
            O Lucro Oculto funciona como um consultor financeiro automatizado — sem jargão técnico,
            sem planilhas complexas. Só ação prática.
          </p>
        </div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => {
            const Icon = f.icon
            return (
              <div
                key={i}
                className="rounded-2xl p-6 transition-all duration-300 group"
                style={{ background: "#1A1D27", border: "1px solid #2A2D3A" }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = f.color + "55"
                  e.currentTarget.style.boxShadow = `0 8px 32px ${f.color}12`
                  e.currentTarget.style.transform = "translateY(-3px)"
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = "#2A2D3A"
                  e.currentTarget.style.boxShadow = "none"
                  e.currentTarget.style.transform = "translateY(0)"
                }}
              >
                {/* Icon */}
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-all duration-200 group-hover:scale-110"
                  style={{ background: f.bg, border: `1px solid ${f.border}` }}
                >
                  <Icon className="w-5 h-5" style={{ color: f.color }} />
                </div>

                <h3 className="font-bold text-base mb-2" style={{ color: "#F4F4F5" }}>
                  {f.title}
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "#8B8FA8" }}
                  dangerouslySetInnerHTML={{ __html: f.description }}
                />
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
