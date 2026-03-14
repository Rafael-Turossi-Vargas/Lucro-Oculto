"use client"

import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useTheme } from "@/lib/theme"
import { ArrowLeft, SearchX } from "lucide-react"

export default function NotFound() {
  const router = useRouter()
  const { theme } = useTheme()

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "var(--bg-page)" }}
    >
      <div className="text-center max-w-md">
        <div
          className="flex items-center justify-center w-20 h-20 rounded-3xl mx-auto mb-6"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
        >
          <SearchX className="w-9 h-9" style={{ color: "var(--text-faint)" }} />
        </div>

        <p className="text-7xl font-black mb-4" style={{ color: "var(--border)" }}>404</p>

        <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
          Página não encontrada
        </h1>
        <p className="text-sm leading-relaxed mb-8" style={{ color: "var(--text-muted)" }}>
          A página que você está procurando não existe ou foi movida.
        </p>

        <div className="flex flex-col gap-3 items-center">
          <Link
            href="/app/dashboard"
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm"
            style={{ background: "#00D084", color: "var(--bg-page)" }}
          >
            Ir para o Dashboard
          </Link>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm"
            style={{ color: "var(--text-muted)" }}
          >
            <ArrowLeft className="w-4 h-4" /> Voltar
          </button>
        </div>

        <div className="flex justify-center mt-10 opacity-30">
          <Image src={theme === "light" ? "/logo-light.svg" : "/logo.svg"} alt="Lucro Oculto" width={120} height={30} />
        </div>
      </div>
    </div>
  )
}
