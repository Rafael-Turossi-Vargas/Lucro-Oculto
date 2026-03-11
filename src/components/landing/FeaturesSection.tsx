"use client"

import { Gauge, Droplets, Coins, Bell, ListChecks, FileDown } from "lucide-react"

const features = [
  {
    icon: Gauge,
    title: "Score de Eficiência",
    description: "Um número de 0 a 100 que resume a saúde financeira com subscores por categoria.",
    color: "#00D084",
    bg: "rgba(0,208,132,0.08)",
    border: "rgba(0,208,132,0.18)",
    badge: "Novo",
  },
  {
    icon: Droplets,
    title: "Detecção de Vazamentos",
    description: "Assinaturas esquecidas, ferramentas duplicadas, pagamentos repetidos e anomalias de custo.",
    color: "#FF4D4F",
    bg: "rgba(255,77,79,0.08)",
    border: "rgba(255,77,79,0.18)",
  },
  {
    icon: Coins,
    title: "Economia em Reais",
    description: "Cada oportunidade vem com o valor estimado de economia mensal em R$ — nada abstrato.",
    color: "#F59E0B",
    bg: "rgba(245,158,11,0.08)",
    border: "rgba(245,158,11,0.18)",
  },
  {
    icon: Bell,
    title: "Alertas Inteligentes",
    description: "\"Custo de marketing +43%\" ou \"Caixa sob pressão em 22 dias\" — alertas contextuais e acionáveis.",
    color: "#3B82F6",
    bg: "rgba(59,130,246,0.08)",
    border: "rgba(59,130,246,0.18)",
  },
  {
    icon: ListChecks,
    title: "Plano de Ação",
    description: "Lista priorizada de ações com impacto, urgência e economia estimada. Sabe o que fazer primeiro.",
    color: "#8B5CF6",
    bg: "rgba(139,92,246,0.08)",
    border: "rgba(139,92,246,0.18)",
  },
  {
    icon: FileDown,
    title: "Relatório PDF Premium",
    description: "Visual de consultoria estratégica. Ideal para sócios, investidores ou reunião de diretoria.",
    color: "#06B6D4",
    bg: "rgba(6,182,212,0.08)",
    border: "rgba(6,182,212,0.18)",
  },
]

export function FeaturesSection() {
  return (
    <section
      id="features"
      className="py-16 relative overflow-hidden"
      style={{ background: "#0F1117" }}
    >
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none"
        style={{
          width: "600px",
          height: "300px",
          background: "radial-gradient(ellipse at 50% 0%, rgba(0,208,132,0.06) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <span
            className="inline-block text-xs font-semibold uppercase tracking-widest mb-3 px-3 py-1.5 rounded-full"
            style={{
              color: "#00D084",
              background: "rgba(0,208,132,0.08)",
              border: "1px solid rgba(0,208,132,0.18)",
            }}
          >
            Recursos
          </span>
          <h2
            className="text-2xl sm:text-3xl font-extrabold mb-2"
            style={{ color: "#F4F4F5", letterSpacing: "-0.02em" }}
          >
            Tudo que você precisa para parar de perder dinheiro
          </h2>
          <p className="text-base max-w-xl mx-auto" style={{ color: "#8B8FA8" }}>
            Como um consultor financeiro automatizado — sem jargão, sem planilha. Só ação prática.
          </p>
        </div>

        {/* 3×2 grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f, i) => {
            const Icon = f.icon
            return (
              <div
                key={i}
                className="rounded-xl p-5 flex gap-4 transition-all duration-200 hover:-translate-y-0.5 group relative overflow-hidden"
                style={{
                  background: "#1A1D27",
                  border: "1px solid #2A2D3A",
                  borderLeft: `3px solid ${f.color}`,
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = f.border
                  e.currentTarget.style.borderLeftColor = f.color
                  e.currentTarget.style.boxShadow = `0 6px 24px ${f.color}14`
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = "#2A2D3A"
                  e.currentTarget.style.borderLeftColor = f.color
                  e.currentTarget.style.boxShadow = "none"
                }}
              >
                {/* Gradient wash on hover */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{ background: `linear-gradient(135deg, ${f.bg} 0%, transparent 55%)` }}
                />

                {/* Icon */}
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 relative z-10 mt-0.5"
                  style={{
                    background: f.bg,
                    border: `1px solid ${f.border}`,
                  }}
                >
                  <Icon className="w-4 h-4" style={{ color: f.color }} />
                </div>

                {/* Content */}
                <div className="relative z-10 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-sm" style={{ color: "#F4F4F5" }}>
                      {f.title}
                    </h3>
                    {f.badge && (
                      <span
                        className="text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0"
                        style={{
                          background: "linear-gradient(135deg, #00D084 0%, #00B872 100%)",
                          color: "#0F1117",
                        }}
                      >
                        {f.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: "#8B8FA8" }}>
                    {f.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
