import { ShieldCheck, Lock, FileCheck2, Trash2, Server, Eye } from "lucide-react"

const badges = [
  {
    icon: Lock,
    title: "HTTPS/TLS",
    subtitle: "Criptografia em trânsito",
    color: "#00D084",
  },
  {
    icon: ShieldCheck,
    title: "AES-256",
    subtitle: "Criptografia em repouso",
    color: "#3B82F6",
  },
  {
    icon: FileCheck2,
    title: "LGPD",
    subtitle: "Conformidade total",
    color: "#F59E0B",
  },
  {
    icon: Trash2,
    title: "Auto-delete",
    subtitle: "Você controla seus dados",
    color: "#8B5CF6",
  },
  {
    icon: Server,
    title: "ISO 27001",
    subtitle: "Infraestrutura certificada",
    color: "#06B6D4",
  },
  {
    icon: Eye,
    title: "Zero compartilhamento",
    subtitle: "Seus dados não são vendidos",
    color: "#FF4D4F",
  },
]

export function SecuritySection() {
  return (
    <section
      className="py-20"
      style={{ background: "#0F1117", borderTop: "1px solid #2A2D3A" }}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span
            className="inline-block text-xs font-semibold uppercase tracking-widest mb-3 px-3 py-1 rounded-full"
            style={{ color: "#3B82F6", background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.15)" }}
          >
            Segurança & Privacidade
          </span>
          <h2
            className="text-2xl sm:text-3xl font-extrabold mb-3"
            style={{ color: "#F4F4F5", letterSpacing: "-0.02em" }}
          >
            Seus dados financeiros são tratados com máxima segurança
          </h2>
          <p className="text-base max-w-xl mx-auto" style={{ color: "#8B8FA8" }}>
            Entendemos que subir extratos bancários exige confiança. Por isso seguimos os mesmos padrões dos melhores fintechs do mercado.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {badges.map((b, i) => {
            const Icon = b.icon
            return (
              <div
                key={i}
                className="flex items-center gap-3 p-4 rounded-xl"
                style={{ background: "#1A1D27", border: "1px solid #2A2D3A" }}
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: `${b.color}12`, border: `1px solid ${b.color}28` }}
                >
                  <Icon className="w-4 h-4" style={{ color: b.color }} />
                </div>
                <div>
                  <p className="font-semibold text-sm" style={{ color: "#F4F4F5" }}>{b.title}</p>
                  <p className="text-xs" style={{ color: "#4B4F6A" }}>{b.subtitle}</p>
                </div>
              </div>
            )
          })}
        </div>

        <div
          className="mt-8 flex items-start gap-3 p-4 rounded-xl max-w-2xl mx-auto"
          style={{ background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.15)" }}
        >
          <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" style={{ color: "#3B82F6" }} />
          <p className="text-sm leading-relaxed" style={{ color: "#8B8FA8" }}>
            Você pode solicitar a <strong style={{ color: "#F4F4F5" }}>exclusão completa dos seus dados</strong> a qualquer momento pelo painel de configurações — em conformidade com a LGPD (Lei 13.709/2018).
          </p>
        </div>
      </div>
    </section>
  )
}
