import Link from "next/link"
import Image from "next/image"
import { ArrowLeft } from "lucide-react"
import { Footer } from "./Footer"
import { Navbar } from "./Navbar"

interface LegalPageWrapperProps {
  title: string
  lastUpdated: string
  children: React.ReactNode
}

export function LegalPageWrapper({ title, lastUpdated, children }: LegalPageWrapperProps) {
  return (
    <div className="min-h-screen" style={{ background: "var(--bg-page)" }}>
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm mb-8 transition-opacity hover:opacity-70"
          style={{ color: "var(--text-faint)" }}
        >
          <ArrowLeft className="w-4 h-4" /> Voltar ao início
        </Link>

        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-3" style={{ color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
            {title}
          </h1>
          <p className="text-sm" style={{ color: "var(--text-faint)" }}>
            Última atualização: {lastUpdated}
          </p>
        </div>

        <div
          className="prose max-w-none space-y-6"
          style={{ color: "var(--text-muted)", lineHeight: "1.8" }}
        >
          {children}
        </div>
      </main>
      <Footer />
    </div>
  )
}

export function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>{title}</h2>
      <div className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>{children}</div>
    </section>
  )
}

export function LegalHighlight({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="px-4 py-3 rounded-xl text-sm leading-relaxed"
      style={{ background: "rgba(0,208,132,0.06)", border: "1px solid rgba(0,208,132,0.15)", color: "var(--text-muted)" }}
    >
      {children}
    </div>
  )
}
