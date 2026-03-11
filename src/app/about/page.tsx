import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { Target, Zap, ShieldCheck, Heart, ArrowRight } from "lucide-react"
import { Navbar } from "@/components/landing/Navbar"
import { Footer } from "@/components/landing/Footer"

export const metadata: Metadata = {
  title: "Sobre | Lucro Oculto",
  description: "Conheça a história e missão do Lucro Oculto — diagnóstico financeiro inteligente para PMEs.",
}

const values = [
  {
    icon: Target,
    title: "Clareza antes de complexidade",
    desc: "Gestão financeira não precisa ser difícil. Traduzimos dados em ações práticas e objetivas, sem jargão contábil.",
    color: "#00D084",
  },
  {
    icon: ShieldCheck,
    title: "Privacidade em primeiro lugar",
    desc: "Seus dados financeiros são seu patrimônio. Tratamos com o mesmo cuidado que você esperaria de um banco.",
    color: "#3B82F6",
  },
  {
    icon: Zap,
    title: "Resultado imediato",
    desc: "Diagnóstico em menos de 60 segundos. Insights acionáveis, não relatórios para encher gaveta.",
    color: "#F59E0B",
  },
  {
    icon: Heart,
    title: "Feito para o empreendedor",
    desc: "Construído por pessoas que entendem a realidade de gerir uma PME no Brasil — com todas as complexidades fiscais e financeiras.",
    color: "#8B5CF6",
  },
]

const stats = [
  { value: "R$ 2,8M+", label: "em desperdício identificado" },
  { value: "1.240+", label: "empresas analisadas" },
  { value: "12+", label: "segmentos atendidos" },
  { value: "34pts", label: "melhora média no score" },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen" style={{ background: "#0F1117" }}>
      <Navbar />

      {/* Hero */}
      <section className="pt-28 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <span
            className="inline-block text-xs font-semibold uppercase tracking-widest mb-4 px-3 py-1 rounded-full"
            style={{ color: "#00D084", background: "rgba(0,208,132,0.08)", border: "1px solid rgba(0,208,132,0.15)" }}
          >
            Nossa história
          </span>
          <h1
            className="text-4xl sm:text-5xl font-extrabold mb-6 leading-tight"
            style={{ color: "#F4F4F5", letterSpacing: "-0.03em" }}
          >
            Nascemos da frustração de ver<br />
            <span style={{ color: "#00D084" }}>lucro escorrendo pelo ralo</span>
          </h1>
          <p className="text-lg max-w-2xl mx-auto leading-relaxed" style={{ color: "#8B8FA8" }}>
            Depois de acompanhar dezenas de pequenas empresas saudáveis perdendo dinheiro em custos invisíveis — assinaturas esquecidas, fornecedores encarecendo, pagamentos duplicados — percebemos que o problema não era faturamento. Era diagnóstico.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 px-4" style={{ background: "#1A1D27", borderTop: "1px solid #2A2D3A", borderBottom: "1px solid #2A2D3A" }}>
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {stats.map((s, i) => (
            <div key={i}>
              <p className="text-3xl font-extrabold font-mono" style={{ color: "#F4F4F5" }}>{s.value}</p>
              <p className="text-xs mt-1" style={{ color: "#8B8FA8" }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-6 text-center" style={{ color: "#F4F4F5", letterSpacing: "-0.02em" }}>
            Nossa missão
          </h2>
          <div
            className="p-8 rounded-2xl text-center"
            style={{ background: "rgba(0,208,132,0.05)", border: "1px solid rgba(0,208,132,0.2)" }}
          >
            <p className="text-xl font-bold leading-relaxed" style={{ color: "#F4F4F5" }}>
              &ldquo;Dar a qualquer pequena e média empresa brasileira o mesmo nível de diagnóstico financeiro que antes só grandes corporações com consultorias caras podiam ter.&rdquo;
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 px-4" style={{ background: "#1A1D27", borderTop: "1px solid #2A2D3A", borderBottom: "1px solid #2A2D3A" }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-12 text-center" style={{ color: "#F4F4F5", letterSpacing: "-0.02em" }}>
            Nossos valores
          </h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {values.map((v, i) => {
              const Icon = v.icon
              return (
                <div key={i} className="p-6 rounded-2xl" style={{ background: "#0F1117", border: "1px solid #2A2D3A" }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: `${v.color}14`, border: `1px solid ${v.color}30` }}>
                    <Icon className="w-5 h-5" style={{ color: v.color }} />
                  </div>
                  <h3 className="font-bold mb-2" style={{ color: "#F4F4F5" }}>{v.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "#8B8FA8" }}>{v.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-2xl font-extrabold mb-4" style={{ color: "#F4F4F5" }}>
            Pronto para descobrir onde seu lucro está?
          </h2>
          <p className="text-base mb-8" style={{ color: "#8B8FA8" }}>
            Faça seu primeiro diagnóstico grátis. Sem cartão de crédito. Resultado em menos de 60 segundos.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-base"
            style={{ background: "#00D084", color: "#0F1117" }}
          >
            Começar grátis <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}
