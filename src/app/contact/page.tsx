"use client"

import { useState } from "react"
import Link from "next/link"
import { Mail, MessageSquare, Clock, ArrowLeft, Send, CheckCircle } from "lucide-react"
import { Navbar } from "@/components/landing/Navbar"
import { Footer } from "@/components/landing/Footer"

const channels = [
  {
    icon: Mail,
    title: "Email de suporte",
    desc: "Para dúvidas sobre a plataforma, conta ou faturamento",
    info: "suporte@lucrooculto.com.br",
    href: "mailto:suporte@lucrooculto.com.br",
    color: "#00D084",
  },
  {
    icon: MessageSquare,
    title: "Privacidade e LGPD",
    desc: "Questões sobre seus dados, exclusão de conta e direitos LGPD",
    info: "privacidade@lucrooculto.com.br",
    href: "mailto:privacidade@lucrooculto.com.br",
    color: "#3B82F6",
  },
  {
    icon: Clock,
    title: "Tempo de resposta",
    desc: "Respondemos todos os contatos em até 1 dia útil",
    info: "Seg–Sex, 9h–18h (BRT)",
    color: "#F59E0B",
  },
]

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" })
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    setLoading(true)
    await new Promise(r => setTimeout(r, 1000))
    setSent(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen" style={{ background: "#0F1117" }}>
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
        <Link href="/" className="inline-flex items-center gap-2 text-sm mb-8 hover:opacity-70 transition-opacity" style={{ color: "#4B4F6A" }}>
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Link>

        <div className="mb-12 text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-3" style={{ color: "#F4F4F5", letterSpacing: "-0.02em" }}>
            Fale conosco
          </h1>
          <p className="text-lg" style={{ color: "#8B8FA8" }}>
            Estamos aqui para ajudar. Escolha o canal mais adequado.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-10">
          {/* Channels */}
          <div className="space-y-4">
            {channels.map((c, i) => {
              const Icon = c.icon
              return (
                <div key={i} className="p-5 rounded-2xl" style={{ background: "#1A1D27", border: "1px solid #2A2D3A" }}>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${c.color}12`, border: `1px solid ${c.color}28` }}>
                      <Icon className="w-5 h-5" style={{ color: c.color }} />
                    </div>
                    <div>
                      <p className="font-bold text-sm" style={{ color: "#F4F4F5" }}>{c.title}</p>
                      <p className="text-xs mt-0.5" style={{ color: "#8B8FA8" }}>{c.desc}</p>
                      {c.href ? (
                        <a href={c.href} className="text-xs font-medium mt-1 block" style={{ color: c.color }}>{c.info}</a>
                      ) : (
                        <p className="text-xs font-medium mt-1" style={{ color: c.color }}>{c.info}</p>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}

            <div className="p-5 rounded-2xl" style={{ background: "rgba(0,208,132,0.05)", border: "1px solid rgba(0,208,132,0.15)" }}>
              <p className="text-sm font-semibold mb-1" style={{ color: "#F4F4F5" }}>Já é cliente?</p>
              <p className="text-xs" style={{ color: "#8B8FA8" }}>
                Acesse o suporte diretamente pelo painel em{" "}
                <Link href="/app/settings" style={{ color: "#00D084" }}>Configurações</Link>.
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="p-6 rounded-2xl" style={{ background: "#1A1D27", border: "1px solid #2A2D3A" }}>
            {sent ? (
              <div className="flex flex-col items-center justify-center h-full py-10 text-center">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: "rgba(0,208,132,0.1)", border: "1px solid rgba(0,208,132,0.2)" }}>
                  <CheckCircle className="w-7 h-7" style={{ color: "#00D084" }} />
                </div>
                <h3 className="text-lg font-bold mb-2" style={{ color: "#F4F4F5" }}>Mensagem enviada!</h3>
                <p className="text-sm" style={{ color: "#8B8FA8" }}>Respondemos em até 1 dia útil. Obrigado!</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="font-bold mb-4" style={{ color: "#F4F4F5" }}>Enviar mensagem</h3>

                {[
                  { label: "Nome", key: "name", type: "text", placeholder: "Seu nome completo" },
                  { label: "Email", key: "email", type: "email", placeholder: "seu@email.com" },
                  { label: "Assunto", key: "subject", type: "text", placeholder: "Ex: Dúvida sobre análise" },
                ].map((f) => (
                  <div key={f.key}>
                    <label className="text-xs font-medium block mb-1" style={{ color: "#8B8FA8" }}>{f.label}</label>
                    <input
                      type={f.type}
                      placeholder={f.placeholder}
                      required
                      value={form[f.key as keyof typeof form]}
                      onChange={(e) => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all"
                      style={{ background: "#212435", border: "1px solid #2A2D3A", color: "#F4F4F5" }}
                      onFocus={(e) => (e.target.style.borderColor = "#00D084")}
                      onBlur={(e) => (e.target.style.borderColor = "#2A2D3A")}
                    />
                  </div>
                ))}

                <div>
                  <label className="text-xs font-medium block mb-1" style={{ color: "#8B8FA8" }}>Mensagem</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Descreva sua dúvida ou sugestão..."
                    value={form.message}
                    onChange={(e) => setForm(p => ({ ...p, message: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all resize-none"
                    style={{ background: "#212435", border: "1px solid #2A2D3A", color: "#F4F4F5" }}
                    onFocus={(e) => (e.target.style.borderColor = "#00D084")}
                    onBlur={(e) => (e.target.style.borderColor = "#2A2D3A")}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-70"
                  style={{ background: "#00D084", color: "#0F1117" }}
                >
                  {loading ? "Enviando..." : <><Send className="w-4 h-4" /> Enviar mensagem</>}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
