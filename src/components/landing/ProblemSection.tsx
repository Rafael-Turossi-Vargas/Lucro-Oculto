import { Eye, EyeOff, TrendingDown, AlertTriangle } from "lucide-react"

const visible = [
  { text: "Faturamento do mês", sub: "Receita bruta" },
  { text: "Contas a pagar", sub: "Obrigações fixas" },
  { text: "Saldo em conta", sub: "Posição de caixa" },
]

const leaks = [
  { text: "Assinaturas esquecidas renovando", value: "R$ 200–800/mês" },
  { text: "Ferramentas com funções duplicadas", value: "R$ 300–1.200/mês" },
  { text: "Fornecedor encarecendo sem avisar", value: "R$ 400–2.000/mês" },
  { text: "Pagamentos duplicados passando", value: "R$ 150–600/mês" },
  { text: "Custos concentrados num item", value: "até 35% da receita" },
  { text: "Margem caindo silenciosamente", value: "-2% a -8% ao mês" },
]

export function ProblemSection() {
  return (
    <section
      id="problem"
      className="py-16 relative overflow-hidden"
      style={{ background: "var(--bg-page)", borderTop: "1px solid var(--border)" }}
    >
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-10">
          <span
            className="inline-block text-xs font-semibold uppercase tracking-widest mb-4 px-3 py-1.5 rounded-full"
            style={{
              color: "#FF4D4F",
              background: "rgba(255,77,79,0.08)",
              border: "1px solid rgba(255,77,79,0.2)",
            }}
          >
            O problema
          </span>
          <h2
            className="text-2xl sm:text-3xl font-extrabold mb-3"
            style={{ color: "var(--text-primary)", letterSpacing: "-0.02em" }}
          >
            Você fatura bem. Mas onde vai o lucro?
          </h2>
          <p className="text-base max-w-lg mx-auto" style={{ color: "var(--text-muted)" }}>
            Você monitora o óbvio — mas os maiores vazamentos de caixa são os que você nunca vê.
          </p>
        </div>

        {/* Two cards */}
        <div className="grid md:grid-cols-2 gap-5">

          {/* Left — what you see */}
          <div
            className="rounded-2xl p-5"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
            }}
          >
            {/* Card header */}
            <div
              className="flex items-center gap-2 pb-4 mb-4"
              style={{ borderBottom: "1px solid var(--border)" }}
            >
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)" }}
              >
                <Eye className="w-3.5 h-3.5" style={{ color: "#3B82F6" }} />
              </div>
              <div>
                <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>O que você monitora</p>
                <p className="text-xs" style={{ color: "var(--text-faint)" }}>Visão parcial — apenas o óbvio</p>
              </div>
            </div>

            <div className="space-y-2">
              {visible.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl"
                  style={{ background: "var(--bg-subtle)", border: "1px solid var(--border)" }}
                >
                  <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{item.text}</span>
                  <span className="text-xs" style={{ color: "var(--text-faint)" }}>{item.sub}</span>
                </div>
              ))}
            </div>

            <div
              className="mt-4 px-3 py-2.5 rounded-xl text-center"
              style={{ background: "rgba(59,130,246,0.05)", border: "1px solid rgba(59,130,246,0.12)" }}
            >
              <p className="text-xs font-medium" style={{ color: "var(--text-faint)" }}>
                3 métricas visíveis · parece suficiente...
              </p>
            </div>
          </div>

          {/* Right — what you don't see */}
          <div
            className="rounded-2xl p-5 relative overflow-hidden"
            style={{
              background: "linear-gradient(145deg, rgba(255,77,79,0.08) 0%, var(--bg-page-overlay) 60%)",
              border: "1px solid rgba(255,77,79,0.22)",
              boxShadow: "0 4px 32px rgba(255,77,79,0.06)",
            }}
          >
            {/* Corner glow */}
            <div
              className="absolute top-0 right-0 w-48 h-48 pointer-events-none"
              style={{
                background: "radial-gradient(circle at top right, rgba(255,77,79,0.12) 0%, transparent 65%)",
              }}
            />

            {/* Card header */}
            <div
              className="flex items-center gap-2 pb-4 mb-4 relative z-10"
              style={{ borderBottom: "1px solid rgba(255,77,79,0.15)" }}
            >
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                style={{
                  background: "rgba(255,77,79,0.12)",
                  border: "1px solid rgba(255,77,79,0.3)",
                  boxShadow: "0 0 10px rgba(255,77,79,0.15)",
                }}
              >
                <EyeOff className="w-3.5 h-3.5" style={{ color: "#FF4D4F" }} />
              </div>
              <div>
                <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>O que drena seu lucro</p>
                <p className="text-xs font-semibold" style={{ color: "#FF4D4F" }}>Invisível — até agora</p>
              </div>
            </div>

            <div className="space-y-1.5 relative z-10">
              {leaks.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-3 py-2 rounded-xl"
                  style={{
                    background: "rgba(255,77,79,0.05)",
                    borderLeft: "2px solid rgba(255,77,79,0.4)",
                  }}
                >
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>{item.text}</span>
                  <span
                    className="text-xs font-bold shrink-0 ml-2"
                    style={{ color: "#FF4D4F" }}
                  >
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom callout */}
        <div
          className="mt-8 flex items-center gap-4 px-6 py-5 rounded-2xl"
          style={{
            background: "linear-gradient(135deg, rgba(0,208,132,0.07) 0%, rgba(0,208,132,0.02) 100%)",
            border: "1px solid rgba(0,208,132,0.2)",
          }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{
              background: "rgba(0,208,132,0.1)",
              border: "1px solid rgba(0,208,132,0.25)",
            }}
          >
            <TrendingDown className="w-5 h-5" style={{ color: "#00D084" }} />
          </div>
          <p className="text-base font-bold" style={{ color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
            Seu problema pode não ser vender mais.{" "}
            <span
              style={{
                background: "linear-gradient(90deg, #00D084 0%, #3FFFB0 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Pode ser parar de perder dinheiro.
            </span>
          </p>
        </div>

      </div>
    </section>
  )
}
