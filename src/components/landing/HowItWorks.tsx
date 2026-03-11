import { Upload, Cpu, FileBarChart } from "lucide-react"

const steps = [
  {
    number: "01",
    icon: Upload,
    title: "Suba seus dados",
    description:
      "Importe seu extrato bancário, planilha de despesas ou exportação do seu sistema financeiro. Formatos CSV e Excel — sem configuração complexa.",
    detail: "Leva menos de 30 segundos",
    color: "#3B82F6",
    bg: "rgba(59,130,246,0.08)",
    border: "rgba(59,130,246,0.2)",
  },
  {
    number: "02",
    icon: Cpu,
    title: "Análise automática",
    description:
      "Nosso sistema analisa padrões, detecta anomalias, identifica assinaturas, compara fornecedores e calcula riscos de caixa automaticamente.",
    detail: "Processamento em menos de 60 segundos",
    color: "#F59E0B",
    bg: "rgba(245,158,11,0.08)",
    border: "rgba(245,158,11,0.2)",
  },
  {
    number: "03",
    icon: FileBarChart,
    title: "Receba seu diagnóstico",
    description:
      "Score de eficiência, vazamentos detectados, economia em reais, alertas priorizados e um plano de ação claro para agir imediatamente.",
    detail: "Plano de ação pronto para executar",
    color: "#00D084",
    bg: "rgba(0,208,132,0.08)",
    border: "rgba(0,208,132,0.2)",
  },
]

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="py-24"
      style={{ background: "#1A1D27", borderTop: "1px solid #2A2D3A", borderBottom: "1px solid #2A2D3A" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <span
            className="inline-block text-xs font-semibold uppercase tracking-widest mb-3 px-3 py-1 rounded-full"
            style={{ color: "#00D084", background: "rgba(0,208,132,0.08)", border: "1px solid rgba(0,208,132,0.15)" }}
          >
            Como funciona
          </span>
          <h2
            className="text-3xl sm:text-4xl font-extrabold mb-4"
            style={{ color: "#F4F4F5", letterSpacing: "-0.02em" }}
          >
            3 passos para descobrir onde seu lucro está vazando
          </h2>
          <p className="text-lg max-w-xl mx-auto" style={{ color: "#8B8FA8" }}>
            Simples como uma planilha. Poderoso como um auditor.
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-6 relative">
          {/* Connector line (desktop only) */}
          <div
            className="hidden md:block absolute top-10 left-1/3 right-1/3 h-px"
            style={{ background: "linear-gradient(90deg, transparent, #2A2D3A, transparent)" }}
          />

          {steps.map((step, i) => {
            const Icon = step.icon
            return (
              <div
                key={i}
                className="relative flex flex-col rounded-2xl p-6 transition-all duration-200 hover:-translate-y-1"
                style={{ background: "#0F1117", border: "1px solid #2A2D3A" }}
              >
                {/* Step number */}
                <span
                  className="absolute top-4 right-4 text-xs font-mono font-bold"
                  style={{ color: "#2A2D3A" }}
                >
                  {step.number}
                </span>

                {/* Icon */}
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                  style={{ background: step.bg, border: `1px solid ${step.border}` }}
                >
                  <Icon className="w-6 h-6" style={{ color: step.color }} />
                </div>

                <h3 className="font-bold text-lg mb-3" style={{ color: "#F4F4F5" }}>
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed flex-1" style={{ color: "#8B8FA8" }}>
                  {step.description}
                </p>

                <div
                  className="mt-4 pt-4 flex items-center gap-2"
                  style={{ borderTop: "1px solid #2A2D3A" }}
                >
                  <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: step.color }} />
                  <span className="text-xs font-medium" style={{ color: step.color }}>
                    {step.detail}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
