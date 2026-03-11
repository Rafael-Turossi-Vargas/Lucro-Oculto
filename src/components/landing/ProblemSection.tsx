import { Eye, EyeOff } from "lucide-react"

const visible = [
  { emoji: "💰", text: "Faturamento do mês" },
  { emoji: "📋", text: "Contas a pagar" },
  { emoji: "🏦", text: "Saldo em conta" },
]

const invisible = [
  { emoji: "🔄", text: "Assinaturas esquecidas e renovando todo mês" },
  { emoji: "🛠️", text: "2 ou 3 ferramentas fazendo a mesma coisa" },
  { emoji: "📈", text: "Fornecedor encarecendo mês a mês sem avisar" },
  { emoji: "🚨", text: "Custo crescendo silenciosamente em uma categoria" },
  { emoji: "💸", text: "Pagamentos duplicados passando despercebidos" },
  { emoji: "⚠️", text: "35% das despesas concentradas em um único item" },
  { emoji: "📉", text: "Margem caindo sem ninguém perceber" },
  { emoji: "🔍", text: "Risco de caixa se aproximando nos próximos 30 dias" },
]

export function ProblemSection() {
  return (
    <section
      id="problem"
      className="py-24"
      style={{ background: "#0F1117" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2
            className="text-3xl sm:text-4xl font-extrabold mb-4 tracking-tight"
            style={{ color: "#F4F4F5", letterSpacing: "-0.02em" }}
          >
            Você fatura bem. Mas onde vai o lucro?
          </h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: "#8B8FA8" }}>
            A maioria dos donos de empresa tem uma visão parcial das finanças.
            Eles veem o óbvio — mas os vazamentos ficam invisíveis.
          </p>
        </div>

        {/* Two columns */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* What you see */}
          <div
            className="rounded-2xl p-6"
            style={{ background: "#1A1D27", border: "1px solid #2A2D3A" }}
          >
            <div className="flex items-center gap-2 mb-5">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)" }}
              >
                <Eye className="w-4 h-4" style={{ color: "#3B82F6" }} />
              </div>
              <div>
                <p className="font-semibold text-sm" style={{ color: "#F4F4F5" }}>O que você vê</p>
                <p className="text-xs" style={{ color: "#8B8FA8" }}>Visão parcial</p>
              </div>
            </div>

            <div className="space-y-3">
              {visible.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl"
                  style={{ background: "#212435", border: "1px solid #2A2D3A" }}
                >
                  <span className="text-lg">{item.emoji}</span>
                  <span className="text-sm font-medium" style={{ color: "#F4F4F5" }}>{item.text}</span>
                </div>
              ))}
            </div>

            <p className="mt-4 text-xs text-center" style={{ color: "#4B4F6A" }}>
              Parece suficiente... mas não é.
            </p>
          </div>

          {/* What you don't see */}
          <div
            className="rounded-2xl p-6"
            style={{
              background: "linear-gradient(135deg, rgba(255,77,79,0.06) 0%, rgba(15,17,23,0) 60%)",
              border: "1px solid rgba(255,77,79,0.2)",
            }}
          >
            <div className="flex items-center gap-2 mb-5">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: "rgba(255,77,79,0.1)", border: "1px solid rgba(255,77,79,0.2)" }}
              >
                <EyeOff className="w-4 h-4" style={{ color: "#FF4D4F" }} />
              </div>
              <div>
                <p className="font-semibold text-sm" style={{ color: "#F4F4F5" }}>O que você não vê</p>
                <p className="text-xs" style={{ color: "#FF4D4F" }}>Onde o lucro vaza</p>
              </div>
            </div>

            <div className="space-y-2">
              {invisible.map((item, i) => (
                <div key={i} className="flex items-start gap-2.5 py-1.5">
                  <span className="text-base mt-0.5 shrink-0">{item.emoji}</span>
                  <span className="text-sm" style={{ color: "#8B8FA8" }}>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Call out */}
        <div className="mt-12 text-center">
          <div
            className="inline-block px-8 py-5 rounded-2xl"
            style={{
              background: "linear-gradient(135deg, rgba(0,208,132,0.08) 0%, rgba(59,130,246,0.04) 100%)",
              border: "1px solid rgba(0,208,132,0.2)",
            }}
          >
            <p className="text-xl font-bold" style={{ color: "#F4F4F5", letterSpacing: "-0.02em" }}>
              &ldquo;Seu problema pode não ser vender mais.
            </p>
            <p className="text-xl font-bold" style={{ color: "#00D084", letterSpacing: "-0.02em" }}>
              Pode ser parar de perder dinheiro.&rdquo;
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
