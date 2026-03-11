"use client"

import { useState } from "react"
import Script from "next/script"
import { Plus, Minus } from "lucide-react"

const faqs = [
  {
    q: "Que tipo de arquivo posso subir?",
    a: "Aceitamos arquivos CSV e Excel (.xlsx, .xls). O arquivo deve ter pelo menos 3 colunas: data, descrição e valor. Exportações de bancos, sistemas contábeis como ContaAzul e Omie, e planilhas do Google Sheets ou Excel são suportados. Disponibilizamos também um template de exemplo para download.",
  },
  {
    q: "Meus dados financeiros são seguros?",
    a: "Sim. Seus dados são criptografados em trânsito (HTTPS/TLS) e em repouso. Armazenamos apenas os dados necessários para a análise, não compartilhamos com terceiros, e você pode solicitar a exclusão dos seus dados a qualquer momento. Hospedagem em infraestrutura ISO 27001.",
  },
  {
    q: "Como a análise detecta os vazamentos?",
    a: "Usamos um conjunto de regras de negócio determinísticas: detectamos padrões mensais recorrentes, comparamos categorias com períodos anteriores, identificamos ferramentas com funções sobrepostas, detectamos valores duplicados em janelas de 7 dias e analisamos concentração de custos por categoria e fornecedor.",
  },
  {
    q: "Quanto tempo leva para analisar meus dados?",
    a: "O upload e processamento levam menos de 60 segundos para arquivos de até 10.000 linhas. Você recebe o diagnóstico completo — score, vazamentos, alertas e plano de ação — assim que a análise finalizar. Você pode inclusive subir dados de 6 a 12 meses para uma análise mais rica.",
  },
  {
    q: "Para qual tipo de empresa funciona?",
    a: "O Lucro Oculto foi construído para pequenas e médias empresas de qualquer segmento: agências, escritórios de serviço, clínicas, academias, e-commerces, restaurantes, construtoras, franquias. Se você tem despesas recorrentes, o diagnóstico vai identificar onde economizar.",
  },
  {
    q: "Posso cancelar o plano a qualquer momento?",
    a: "Sim, sem multa e sem burocracia. Cancele em até 2 cliques pelo painel de configurações. Após o cancelamento, seu acesso continua até o fim do período pago. Seus dados ficam disponíveis por 30 dias após o cancelamento, tempo suficiente para exportar tudo.",
  },
  {
    q: "O sistema se integra com meu banco ou ERP?",
    a: "No MVP, a integração é via upload manual de arquivos — o que cobre 95% dos casos. Integração direta com Open Finance, ContaAzul, Omie e outros ERPs está no nosso roadmap e será disponibilizada nos próximos meses.",
  },
  {
    q: "O relatório PDF pode ser apresentado para sócios ou investidores?",
    a: "Sim! O relatório PDF foi desenhado com visual de consultoria estratégica, não de planilha. Inclui score de eficiência, principais vazamentos, oportunidades de economia, plano de ação priorizado e estimativa de retorno. Ideal para reuniões de diretoria e apresentações para investidores.",
  },
]

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqs.map((f) => ({
    "@type": "Question",
    "name": f.q,
    "acceptedAnswer": { "@type": "Answer", "text": f.a },
  })),
}

export function FAQSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(null)

  return (
    <>
      <Script
        id="faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    <section
      id="faq"
      className="py-24"
      style={{ background: "#0F1117" }}
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <span
            className="inline-block text-xs font-semibold uppercase tracking-widest mb-3 px-3 py-1 rounded-full"
            style={{ color: "#00D084", background: "rgba(0,208,132,0.08)", border: "1px solid rgba(0,208,132,0.15)" }}
          >
            FAQ
          </span>
          <h2
            className="text-3xl sm:text-4xl font-extrabold mb-4"
            style={{ color: "#F4F4F5", letterSpacing: "-0.02em" }}
          >
            Perguntas frequentes
          </h2>
        </div>

        {/* Accordion */}
        <div className="space-y-2">
          {faqs.map((faq, i) => {
            const isOpen = openIdx === i
            return (
              <div
                key={i}
                className="rounded-xl overflow-hidden transition-all duration-200"
                style={{
                  background: isOpen ? "#1A1D27" : "#1A1D27",
                  border: isOpen ? "1px solid rgba(0,208,132,0.2)" : "1px solid #2A2D3A",
                }}
              >
                <button
                  className="w-full flex items-center justify-between px-5 py-4 text-left gap-4"
                  onClick={() => setOpenIdx(isOpen ? null : i)}
                >
                  <span
                    className="font-semibold text-sm leading-snug"
                    style={{ color: isOpen ? "#F4F4F5" : "#F4F4F5" }}
                  >
                    {faq.q}
                  </span>
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all"
                    style={{
                      background: isOpen ? "rgba(0,208,132,0.1)" : "#212435",
                      border: isOpen ? "1px solid rgba(0,208,132,0.2)" : "1px solid #2A2D3A",
                    }}
                  >
                    {isOpen
                      ? <Minus className="w-3 h-3" style={{ color: "#00D084" }} />
                      : <Plus className="w-3 h-3" style={{ color: "#8B8FA8" }} />
                    }
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-4">
                    <p className="text-sm leading-relaxed" style={{ color: "#8B8FA8" }}>
                      {faq.a}
                    </p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
    </>
  )
}
