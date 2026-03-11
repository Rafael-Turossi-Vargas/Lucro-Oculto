"use client"

import { Upload, Cpu, FileBarChart, ArrowRight } from "lucide-react"

const steps = [
  {
    number: "01",
    icon: Upload,
    title: "Suba seus dados",
    description:
      "Importe extrato bancário, planilha de despesas ou exportação do seu sistema. CSV e Excel — sem configuração.",
    detail: "Menos de 30 segundos",
    color: "#3B82F6",
    bg: "rgba(59,130,246,0.08)",
    border: "rgba(59,130,246,0.18)",
    glow: "rgba(59,130,246,0.12)",
  },
  {
    number: "02",
    icon: Cpu,
    title: "Análise automática",
    description:
      "O sistema detecta anomalias, identifica assinaturas, compara fornecedores e calcula riscos de caixa automaticamente.",
    detail: "Processamento em ~60 segundos",
    color: "#F59E0B",
    bg: "rgba(245,158,11,0.08)",
    border: "rgba(245,158,11,0.18)",
    glow: "rgba(245,158,11,0.12)",
  },
  {
    number: "03",
    icon: FileBarChart,
    title: "Receba seu diagnóstico",
    description:
      "Score de eficiência, vazamentos em R$, alertas priorizados e plano de ação claro para agir imediatamente.",
    detail: "Plano de ação pronto",
    color: "#00D084",
    bg: "rgba(0,208,132,0.08)",
    border: "rgba(0,208,132,0.18)",
    glow: "rgba(0,208,132,0.12)",
  },
]

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="py-16 relative overflow-hidden"
      style={{
        background: "linear-gradient(180deg, #131620 0%, #1A1D27 100%)",
        borderTop: "1px solid #2A2D3A",
        borderBottom: "1px solid #2A2D3A",
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 100%, rgba(0,208,132,0.04) 0%, transparent 70%)",
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
            Como funciona
          </span>
          <h2
            className="text-2xl sm:text-3xl font-extrabold mb-2"
            style={{ color: "#F4F4F5", letterSpacing: "-0.02em" }}
          >
            3 passos para descobrir onde seu lucro vaza
          </h2>
          <p className="text-base max-w-md mx-auto" style={{ color: "#8B8FA8" }}>
            Simples como uma planilha. Poderoso como um auditor.
          </p>
        </div>

        {/* Steps */}
        <div className="flex flex-col md:flex-row gap-2 md:gap-0 items-stretch">
          {steps.map((step, i) => {
            const Icon = step.icon
            return (
              <div key={i} className="flex md:flex-row flex-col items-stretch gap-0 flex-1 min-w-0">
                <div
                  className="w-full h-full rounded-2xl p-5 flex flex-col gap-4 transition-all duration-200 hover:-translate-y-1"
                  style={{
                    background: "#1A1D27",
                    border: `1px solid ${step.border}`,
                    borderLeft: `3px solid ${step.color}`,
                    boxShadow: `0 2px 20px ${step.glow}`,
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.boxShadow = `0 8px 32px ${step.glow}`
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.boxShadow = `0 2px 20px ${step.glow}`
                  }}
                >
                  {/* Top row: icon + step number */}
                  <div className="flex items-center justify-between">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{
                        background: step.bg,
                        border: `1px solid ${step.border}`,
                        boxShadow: `0 0 14px ${step.glow}`,
                      }}
                    >
                      <Icon className="w-5 h-5" style={{ color: step.color }} />
                    </div>
                    <span
                      className="text-xs font-bold font-mono px-2 py-0.5 rounded-full"
                      style={{
                        color: step.color,
                        background: step.bg,
                        border: `1px solid ${step.border}`,
                      }}
                    >
                      {step.number}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h3
                      className="font-bold text-base mb-1.5"
                      style={{ color: "#F4F4F5" }}
                    >
                      {step.title}
                    </h3>
                    <p className="text-sm leading-relaxed" style={{ color: "#8B8FA8" }}>
                      {step.description}
                    </p>
                  </div>

                  {/* Detail */}
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ background: step.color, boxShadow: `0 0 5px ${step.color}` }}
                    />
                    <span className="text-xs font-semibold" style={{ color: step.color }}>
                      {step.detail}
                    </span>
                  </div>
                </div>

                {/* Connector arrow between cards */}
                {i < steps.length - 1 && (
                  <div className="hidden md:flex items-center px-2 shrink-0">
                    <ArrowRight className="w-4 h-4" style={{ color: "#2A2D3A" }} />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
