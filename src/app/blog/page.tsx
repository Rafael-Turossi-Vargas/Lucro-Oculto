import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, Rss, Bell } from "lucide-react"
import { Navbar } from "@/components/landing/Navbar"
import { Footer } from "@/components/landing/Footer"

export const metadata: Metadata = {
  title: "Blog | Lucro Oculto",
  description: "Conteúdo sobre gestão financeira, redução de custos e crescimento para PMEs brasileiras.",
}

const comingSoonPosts = [
  {
    tag: "Gestão Financeira",
    title: "Os 7 vazamentos mais comuns nas PMEs brasileiras (e como identificar)",
    desc: "Análise baseada em mais de 1.200 diagnósticos reais: onde o dinheiro some sem que os donos percebam.",
    color: "#00D084",
  },
  {
    tag: "Fluxo de Caixa",
    title: "Como prever uma crise de caixa 30 dias antes de acontecer",
    desc: "Os sinais que os extratos bancários dão semanas antes — e como agir com antecedência.",
    color: "#3B82F6",
  },
  {
    tag: "Redução de Custos",
    title: "Assinaturas SaaS: quanto sua empresa realmente paga vs usa",
    desc: "Metodologia para auditar ferramentas digitais e eliminar gastos desnecessários.",
    color: "#F59E0B",
  },
  {
    tag: "LGPD & Finanças",
    title: "O que mudar na gestão financeira após a LGPD",
    desc: "Impactos práticos para PMEs que lidam com dados de clientes e fornecedores.",
    color: "#8B5CF6",
  },
]

export default function BlogPage() {
  return (
    <div className="min-h-screen" style={{ background: "#0F1117" }}>
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
        <Link href="/" className="inline-flex items-center gap-2 text-sm mb-8 hover:opacity-70 transition-opacity" style={{ color: "#4B4F6A" }}>
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Link>

        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-6" style={{ background: "rgba(0,208,132,0.1)", border: "1px solid rgba(0,208,132,0.2)" }}>
            <Rss className="w-6 h-6" style={{ color: "#00D084" }} />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-4" style={{ color: "#F4F4F5", letterSpacing: "-0.02em" }}>
            Blog em breve
          </h1>
          <p className="text-lg max-w-xl mx-auto" style={{ color: "#8B8FA8" }}>
            Estamos preparando conteúdo prático sobre gestão financeira para PMEs. Sem teorias — só o que funciona na prática.
          </p>
        </div>

        {/* Coming soon posts */}
        <div className="grid sm:grid-cols-2 gap-5 mb-16">
          {comingSoonPosts.map((post, i) => (
            <div
              key={i}
              className="p-5 rounded-2xl relative overflow-hidden"
              style={{ background: "#1A1D27", border: "1px solid #2A2D3A" }}
            >
              <div className="absolute top-3 right-3 text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: "#212435", color: "#4B4F6A" }}>
                Em breve
              </div>
              <span
                className="inline-block text-xs font-semibold px-2 py-0.5 rounded-full mb-3"
                style={{ background: `${post.color}14`, color: post.color, border: `1px solid ${post.color}28` }}
              >
                {post.tag}
              </span>
              <h3 className="font-bold text-sm leading-snug mb-2" style={{ color: "#F4F4F5" }}>{post.title}</h3>
              <p className="text-xs leading-relaxed" style={{ color: "#4B4F6A" }}>{post.desc}</p>
            </div>
          ))}
        </div>

        {/* Notify */}
        <div
          className="p-8 rounded-2xl text-center"
          style={{ background: "rgba(0,208,132,0.05)", border: "1px solid rgba(0,208,132,0.2)" }}
        >
          <Bell className="w-8 h-8 mx-auto mb-4" style={{ color: "#00D084" }} />
          <h2 className="text-xl font-bold mb-2" style={{ color: "#F4F4F5" }}>
            Seja notificado quando publicarmos
          </h2>
          <p className="text-sm mb-6" style={{ color: "#8B8FA8" }}>
            Crie sua conta gratuitamente e receba os primeiros artigos por email.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm"
            style={{ background: "#00D084", color: "#0F1117" }}
          >
            Criar conta grátis
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  )
}
