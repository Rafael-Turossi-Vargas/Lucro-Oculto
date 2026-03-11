"use client"

import { Star } from "lucide-react"

const testimonials = [
  {
    quote: "Encontramos R$2.400/mês em ferramentas que pagávamos e nem usávamos mais. O sistema identificou em 2 minutos o que não vimos em 2 anos.",
    name: "Carla Mendes",
    role: "Sócia-diretora",
    company: "Agência de Marketing",
    initials: "CM",
    color: "#00D084",
    saving: "R$2.400",
    period: "economizados por mês",
  },
  {
    quote: "Sempre achei que o problema era vender mais. O diagnóstico mostrou que eu estava perdendo 18% da receita em custos que nem sabia que tinha.",
    name: "Roberto Alves",
    role: "Proprietário",
    company: "Clínica Odontológica",
    initials: "RA",
    color: "#3B82F6",
    saving: "R$5.800",
    period: "recuperados no 1º mês",
  },
  {
    quote: "Apresentei o relatório para os sócios na semana seguinte. Eliminamos 3 fornecedores duplicados. Profissional demais para um software tão simples.",
    name: "Ana Paula Costa",
    role: "Gestora Financeira",
    company: "Rede de Academias",
    initials: "APC",
    color: "#F59E0B",
    saving: "R$3.200",
    period: "em cortes identificados",
  },
]

export function TestimonialsSection() {
  return (
    <section
      className="py-16 relative overflow-hidden"
      style={{
        background: "linear-gradient(180deg, #1A1D27 0%, #1C1F2E 100%)",
        borderTop: "1px solid #2A2D3A",
        borderBottom: "1px solid #2A2D3A",
      }}
    >
      {/* Subtle background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(0,208,132,0.05) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <span
            className="inline-block text-xs font-semibold uppercase tracking-widest mb-4 px-3 py-1.5 rounded-full"
            style={{
              color: "#00D084",
              background: "rgba(0,208,132,0.08)",
              border: "1px solid rgba(0,208,132,0.18)",
            }}
          >
            Resultados reais
          </span>
          <h2
            className="text-3xl sm:text-4xl font-extrabold mb-4"
            style={{ color: "#F4F4F5", letterSpacing: "-0.02em" }}
          >
            O que nossos clientes encontraram
          </h2>
          <p className="text-lg max-w-xl mx-auto" style={{ color: "#8B8FA8" }}>
            Empresas reais. Resultados reais. Sem consultores caros.
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="rounded-2xl p-7 flex flex-col transition-all duration-300 relative overflow-hidden group"
              style={{
                background: `linear-gradient(160deg, ${t.color}0D 0%, rgba(15,17,23,0) 60%)`,
                border: `1px solid ${t.color}28`,
                boxShadow: `0 4px 24px ${t.color}08`,
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = t.color + "50"
                e.currentTarget.style.boxShadow = `0 12px 40px ${t.color}18`
                e.currentTarget.style.transform = "translateY(-3px)"
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = t.color + "28"
                e.currentTarget.style.boxShadow = `0 4px 24px ${t.color}08`
                e.currentTarget.style.transform = "translateY(0)"
              }}
            >
              {/* Decorative large quote mark background element */}
              <div
                className="absolute top-4 right-5 text-[7rem] font-serif leading-none pointer-events-none select-none"
                style={{
                  color: t.color,
                  opacity: 0.07,
                  fontFamily: "Georgia, serif",
                  lineHeight: 1,
                }}
              >
                &ldquo;
              </div>

              {/* Stars with pill bg */}
              <div className="flex items-center justify-between mb-5">
                <div
                  className="inline-flex items-center gap-0.5 px-2.5 py-1 rounded-full"
                  style={{
                    background: "rgba(245,158,11,0.1)",
                    border: "1px solid rgba(245,158,11,0.2)",
                  }}
                >
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} className="w-3.5 h-3.5 fill-current" style={{ color: "#F59E0B" }} />
                  ))}
                </div>
              </div>

              {/* Quote */}
              <p
                className="text-base leading-relaxed flex-1 mb-6 relative z-10"
                style={{ color: "#D4D4D8", fontStyle: "italic" }}
              >
                &ldquo;{t.quote}&rdquo;
              </p>

              {/* Savings highlight — prominent at bottom */}
              <div
                className="mb-5 px-4 py-4 rounded-xl"
                style={{
                  background: `linear-gradient(135deg, ${t.color}14 0%, ${t.color}08 100%)`,
                  border: `1px solid ${t.color}30`,
                }}
              >
                <p
                  className="text-3xl font-extrabold font-mono"
                  style={{
                    color: t.color,
                    textShadow: `0 0 20px ${t.color}40`,
                  }}
                >
                  {t.saving}
                </p>
                <p className="text-xs mt-0.5 font-medium" style={{ color: "#8B8FA8" }}>
                  {t.period}
                </p>
              </div>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shrink-0"
                  style={{
                    background: `linear-gradient(135deg, ${t.color}20 0%, ${t.color}10 100%)`,
                    border: `1px solid ${t.color}40`,
                    color: t.color,
                    boxShadow: `0 0 10px ${t.color}20`,
                  }}
                >
                  {t.initials}
                </div>
                <div>
                  <p className="font-semibold text-sm" style={{ color: "#F4F4F5" }}>
                    {t.name}
                  </p>
                  <p className="text-xs" style={{ color: "#4B4F6A" }}>
                    {t.role} · {t.company}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center mt-8 text-xs" style={{ color: "#4B4F6A" }}>
          * Valores de economia identificados pela plataforma. Resultados variam por empresa e período analisado.
        </p>
      </div>
    </section>
  )
}
