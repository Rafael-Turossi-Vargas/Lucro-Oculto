"use client"

import { useState } from "react"
import Script from "next/script"
import { Plus, Minus } from "lucide-react"

const faqs = [
  {
    q: "Que tipo de arquivo posso subir?",
    a: "CSV e Excel (.xlsx, .xls) com pelo menos 3 colunas: data, descrição e valor. Exportações de bancos, ContaAzul, Omie e Google Sheets são suportados.",
  },
  {
    q: "Meus dados financeiros são seguros?",
    a: "Sim. Dados criptografados em trânsito (HTTPS/TLS) e em repouso (AES-256). Não compartilhamos com terceiros. Você pode solicitar exclusão a qualquer momento. Hospedagem ISO 27001.",
  },
  {
    q: "Como a análise detecta os vazamentos?",
    a: "Detectamos padrões mensais recorrentes, comparamos categorias com períodos anteriores, identificamos ferramentas duplicadas, valores repetidos em janelas de 7 dias e concentração anormal de custos.",
  },
  {
    q: "Quanto tempo leva a análise?",
    a: "Menos de 60 segundos para arquivos de até 10.000 linhas. Você recebe score, vazamentos, alertas e plano de ação assim que terminar.",
  },
  {
    q: "Para qual tipo de empresa funciona?",
    a: "PMEs de qualquer segmento: agências, clínicas, academias, e-commerces, restaurantes, escritórios, construtoras, franquias. Se há despesas recorrentes, o diagnóstico funciona.",
  },
  {
    q: "Posso cancelar a qualquer momento?",
    a: "Sim, sem multa e em 2 cliques pelo painel. Seu acesso continua até o fim do período pago. Dados ficam disponíveis por 30 dias após o cancelamento.",
  },
  {
    q: "O sistema integra com meu banco ou ERP?",
    a: "Atualmente via upload de arquivo — cobre 95% dos casos. Integração com Open Finance, ContaAzul e Omie está no roadmap.",
  },
  {
    q: "O relatório PDF serve para apresentar a sócios?",
    a: "Sim. O PDF tem visual de consultoria estratégica com score, vazamentos, oportunidades de economia e plano de ação. Ideal para reuniões de diretoria e investidores.",
  },
]

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
}

export function FAQSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(null)
  const left = faqs.slice(0, 4)
  const right = faqs.slice(4)

  return (
    <>
      <Script
        id="faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <section
        id="faq"
        className="py-14 relative overflow-hidden"
        style={{ background: "var(--bg-page)", borderTop: "1px solid var(--border)" }}
      >
        {/* Subtle glow */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none"
          style={{
            width: "600px",
            height: "300px",
            background: "radial-gradient(ellipse at 50% 0%, rgba(0,208,132,0.04) 0%, transparent 70%)",
          }}
        />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <span
              className="inline-block text-xs font-semibold uppercase tracking-widest mb-3 px-3 py-1.5 rounded-full"
              style={{
                color: "#00D084",
                background: "rgba(0,208,132,0.08)",
                border: "1px solid rgba(0,208,132,0.18)",
              }}
            >
              FAQ
            </span>
            <h2
              className="text-2xl sm:text-3xl font-extrabold mb-2"
              style={{ color: "var(--text-primary)", letterSpacing: "-0.02em" }}
            >
              Tem dúvidas? Respondemos aqui.
            </h2>
            <p className="text-sm max-w-md mx-auto" style={{ color: "var(--text-muted)" }}>
              As perguntas mais comuns sobre o Lucro Oculto.
            </p>
          </div>

          {/* 2-col accordion */}
          <div className="grid md:grid-cols-2 gap-3">
            {[left, right].map((col, colIdx) => (
              <div key={colIdx} className="space-y-2">
                {col.map((faq, rowIdx) => {
                  const i = colIdx * 4 + rowIdx
                  const isOpen = openIdx === i
                  return (
                    <div
                      key={i}
                      className="rounded-xl overflow-hidden transition-all duration-200"
                      style={{
                        background: isOpen ? "rgba(0,208,132,0.04)" : "var(--bg-card)",
                        border: isOpen
                          ? "1px solid rgba(0,208,132,0.22)"
                          : "1px solid var(--border)",
                        borderLeft: isOpen
                          ? "3px solid #00D084"
                          : "3px solid transparent",
                      }}
                    >
                      <button
                        className="w-full flex items-center justify-between px-4 py-3.5 text-left gap-3"
                        onClick={() => setOpenIdx(isOpen ? null : i)}
                      >
                        <span
                          className="font-semibold text-sm leading-snug"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {faq.q}
                        </span>
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all duration-200"
                          style={{
                            background: isOpen ? "rgba(0,208,132,0.12)" : "var(--bg-subtle)",
                            border: isOpen
                              ? "1px solid rgba(0,208,132,0.25)"
                              : "1px solid var(--border)",
                          }}
                        >
                          {isOpen
                            ? <Minus className="w-2.5 h-2.5" style={{ color: "#00D084" }} />
                            : <Plus className="w-2.5 h-2.5" style={{ color: "var(--text-faint)" }} />
                          }
                        </div>
                      </button>

                      {isOpen && (
                        <div className="px-4 pb-4">
                          <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
                            {faq.a}
                          </p>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
