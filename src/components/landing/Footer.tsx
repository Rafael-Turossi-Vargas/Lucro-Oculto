"use client"

import Link from "next/link"
import Image from "next/image"
import { GitBranch, LinkedinIcon, ExternalLink } from "lucide-react"

const links = {
  Produto: [
    { label: "Como funciona", href: "#how-it-works" },
    { label: "Recursos", href: "#features" },
    { label: "Preços", href: "#pricing" },
    { label: "Changelog", href: "/changelog" },
    { label: "FAQ", href: "#faq" },
  ],
  Empresa: [
    { label: "Sobre", href: "/about" },
    { label: "Blog", href: "/blog" },
    { label: "Contato", href: "/contact" },
    { label: "Status", href: "/status" },
  ],
  Legal: [
    { label: "Termos de uso", href: "/terms" },
    { label: "Privacidade", href: "/privacy" },
    { label: "Cookies", href: "/cookies" },
  ],
}

const socials = [
  {
    Icon: ExternalLink,
    label: "Twitter / X",
    href: "https://twitter.com/lucrooculto",
  },
  {
    Icon: LinkedinIcon,
    label: "LinkedIn",
    href: "https://linkedin.com/company/lucro-oculto",
  },
  {
    Icon: GitBranch,
    label: "GitHub",
    href: "https://github.com/lucro-oculto",
  },
]

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
            <p className="text-sm leading-relaxed mb-4" style={{ color: "#8B8FA8" }}>
              Veja onde seu lucro está vazando. Diagnóstico financeiro inteligente para PMEs.
            </p>
            {/* Social */}
            <div className="flex gap-3">
              {socials.map(({ Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                  style={{ background: "#1A1D27", border: "1px solid #2A2D3A", color: "#8B8FA8" }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderColor = "#3D4158"
                    e.currentTarget.style.color = "#F4F4F5"
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = "#2A2D3A"
                    e.currentTarget.style.color = "#8B8FA8"
                  }}
                >
                  <Icon className="w-3.5 h-3.5" />
                </a>
              ))}
            </div>
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
            Mais lucro sem vender mais. 💡
          </p>
        </div>
      </div>
    </footer>
  )
}
