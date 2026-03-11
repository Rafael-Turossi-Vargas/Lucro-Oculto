"use client"

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
      className="py-14 relative overflow-hidden"
      style={{
        background: "linear-gradient(180deg, #0F1117 0%, #111420 100%)",
        borderTop: "1px solid #2A2D3A",
      }}
    >
      {/* Subtle gradient background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(59,130,246,0.06) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title row — more prominent */}
        <div className="text-center mb-12">
          <span
            className="inline-block text-xs font-semibold uppercase tracking-widest mb-4 px-3 py-1.5 rounded-full"
            style={{
              color: "#3B82F6",
              background: "rgba(59,130,246,0.08)",
              border: "1px solid rgba(59,130,246,0.18)",
            }}
          >
            Segurança &amp; Privacidade
          </span>
          <h2
            className="text-2xl sm:text-3xl font-extrabold mb-3"
            style={{
              color: "#F4F4F5",
              letterSpacing: "-0.02em",
            }}
          >
            Seus dados financeiros são tratados com{" "}
            <span
              style={{
                background: "linear-gradient(90deg, #3B82F6 0%, #60A5FA 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              máxima segurança
            </span>
          </h2>
          <p className="text-base max-w-xl mx-auto" style={{ color: "#8B8FA8" }}>
            Entendemos que subir extratos bancários exige confiança. Por isso seguimos os mesmos padrões dos melhores fintechs do mercado.
          </p>
        </div>

        {/* Badges — horizontal row with better icon colors */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {badges.map((b, i) => {
            const Icon = b.icon
            return (
              <div
                key={i}
                className="flex items-center gap-3 p-4 rounded-xl transition-all duration-200 hover:-translate-y-0.5"
                style={{
                  background: `linear-gradient(135deg, ${b.color}08 0%, rgba(26,29,39,0) 100%)`,
                  border: `1px solid ${b.color}20`,
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = b.color + "40"
                  e.currentTarget.style.boxShadow = `0 6px 20px ${b.color}12`
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = b.color + "20"
                  e.currentTarget.style.boxShadow = "none"
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{
                    background: `linear-gradient(135deg, ${b.color}18 0%, ${b.color}08 100%)`,
                    border: `1px solid ${b.color}30`,
                    boxShadow: `0 0 12px ${b.color}18`,
                  }}
                >
                  <Icon className="w-4 h-4" style={{ color: b.color }} />
                </div>
                <div>
                  <p
                    className="font-bold text-sm"
                    style={{ color: "#F4F4F5" }}
                  >
                    {b.title}
                  </p>
                  <p className="text-xs" style={{ color: "#4B4F6A" }}>
                    {b.subtitle}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* LGPD note */}
        <div
          className="mt-8 flex items-start gap-3 p-5 rounded-xl max-w-2xl mx-auto"
          style={{
            background: "linear-gradient(135deg, rgba(59,130,246,0.07) 0%, rgba(59,130,246,0.02) 100%)",
            border: "1px solid rgba(59,130,246,0.18)",
          }}
        >
          <ShieldCheck
            className="w-5 h-5 shrink-0 mt-0.5"
            style={{ color: "#3B82F6" }}
          />
          <p className="text-sm leading-relaxed" style={{ color: "#8B8FA8" }}>
            Você pode solicitar a{" "}
            <strong style={{ color: "#F4F4F5" }}>exclusão completa dos seus dados</strong> a qualquer
            momento pelo painel de configurações — em conformidade com a LGPD (Lei 13.709/2018).
          </p>
        </div>
      </div>
    </section>
  )
}
