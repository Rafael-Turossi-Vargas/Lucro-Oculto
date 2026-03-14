"use client"

import Link from "next/link"
import Image from "next/image"
import { useTheme } from "@/lib/theme"

const links = {
  Produto: [
    { label: "Como funciona", href: "#how-it-works" },
    { label: "Recursos", href: "#features" },
    { label: "Preços", href: "#pricing" },
    { label: "FAQ", href: "#faq" },
  ],
  Empresa: [
    { label: "Sobre", href: "/about" },
    { label: "Contato", href: "/contact" },
  ],
  Legal: [
    { label: "Termos de uso", href: "/terms" },
    { label: "Privacidade", href: "/privacy" },
    { label: "Reembolso", href: "/refund" },
    { label: "Cookies", href: "/cookies" },
  ],
}

export function Footer() {
  const { theme } = useTheme()
  return (
    <footer style={{ background: "var(--bg-page)", borderTop: "1px solid var(--border)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center mb-3 w-fit hover:opacity-85 transition-opacity">
              <Image src={theme === "light" ? "/logo-light.svg" : "/logo.svg"} alt="Lucro Oculto" width={148} height={38} />
            </Link>
            <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
              Veja onde seu lucro está vazando. Diagnóstico financeiro inteligente para PMEs.
            </p>
          </div>

          {/* Link groups */}
          {Object.entries(links).map(([group, items]) => (
            <div key={group}>
              <p className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: "var(--text-faint)" }}>
                {group}
              </p>
              <ul className="space-y-2.5">
                {items.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="text-sm transition-colors"
                      style={{ color: "var(--text-muted)" }}
                      onMouseOver={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
                      onMouseOut={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div
          className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          <p className="text-xs" style={{ color: "var(--text-faint)" }}>
            © {new Date().getFullYear()} Lucro Oculto. Todos os direitos reservados.
          </p>
          <p className="text-xs" style={{ color: "var(--text-faint)" }}>
            Mais lucro sem vender mais.
          </p>
        </div>
      </div>
    </footer>
  )
}
