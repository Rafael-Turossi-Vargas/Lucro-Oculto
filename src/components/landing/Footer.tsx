"use client"

import Link from "next/link"
import Image from "next/image"

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
  return (
    <footer style={{ background: "#0F1117", borderTop: "1px solid #2A2D3A" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center mb-3 w-fit hover:opacity-85 transition-opacity">
              <Image src="/logo.svg" alt="Lucro Oculto" width={148} height={38} />
            </Link>
            <p className="text-sm leading-relaxed" style={{ color: "#8B8FA8" }}>
              Veja onde seu lucro está vazando. Diagnóstico financeiro inteligente para PMEs.
            </p>
          </div>

          {/* Link groups */}
          {Object.entries(links).map(([group, items]) => (
            <div key={group}>
              <p className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: "#4B4F6A" }}>
                {group}
              </p>
              <ul className="space-y-2.5">
                {items.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="text-sm transition-colors"
                      style={{ color: "#8B8FA8" }}
                      onMouseOver={(e) => (e.currentTarget.style.color = "#F4F4F5")}
                      onMouseOut={(e) => (e.currentTarget.style.color = "#8B8FA8")}
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
          style={{ borderTop: "1px solid #2A2D3A" }}
        >
          <p className="text-xs" style={{ color: "#4B4F6A" }}>
            © {new Date().getFullYear()} Lucro Oculto. Todos os direitos reservados.
          </p>
          <p className="text-xs" style={{ color: "#4B4F6A" }}>
            Mais lucro sem vender mais.
          </p>
        </div>
      </div>
    </footer>
  )
}
