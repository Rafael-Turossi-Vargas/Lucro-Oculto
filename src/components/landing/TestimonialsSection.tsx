"use client"

import { Star, Quote } from "lucide-react"

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
      className="py-24"
      style={{ background: "#1A1D27", borderTop: "1px solid #2A2D3A", borderBottom: "1px solid #2A2D3A" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <span
            className="inline-block text-xs font-semibold uppercase tracking-widest mb-3 px-3 py-1 rounded-full"
            style={{ color: "#00D084", background: "rgba(0,208,132,0.08)", border: "1px solid rgba(0,208,132,0.15)" }}
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
              className="rounded-2xl p-6 flex flex-col transition-all duration-300"
              style={{ background: "#0F1117", border: "1px solid #2A2D3A" }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = t.color + "55"
                e.currentTarget.style.boxShadow = `0 8px 32px ${t.color}12`
                e.currentTarget.style.transform = "translateY(-2px)"
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = "#2A2D3A"
                e.currentTarget.style.boxShadow = "none"
                e.currentTarget.style.transform = "translateY(0)"
              }}
            >
              {/* Stars */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-current" style={{ color: "#F59E0B" }} />
                  ))}
                </div>
                <Quote className="w-5 h-5 opacity-20" style={{ color: t.color }} />
              </div>

              {/* Quote */}
              <p className="text-sm leading-relaxed flex-1 mb-6 italic" style={{ color: "#8B8FA8" }}>
                &ldquo;{t.quote}&rdquo;
              </p>

              {/* Saving highlight */}
              <div
                className="mb-5 px-4 py-3 rounded-xl"
                style={{ background: `${t.color}10`, border: `1px solid ${t.color}28` }}
              >
                <p className="text-2xl font-extrabold font-mono" style={{ color: t.color }}>
                  {t.saving}
                </p>
                <p className="text-xs mt-0.5" style={{ color: "#4B4F6A" }}>
                  {t.period}
                </p>
              </div>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shrink-0"
                  style={{ background: `${t.color}18`, border: `1px solid ${t.color}35`, color: t.color }}
                >
                  {t.initials}
                </div>
                <div>
                  <p className="font-semibold text-sm" style={{ color: "#F4F4F5" }}>{t.name}</p>
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
