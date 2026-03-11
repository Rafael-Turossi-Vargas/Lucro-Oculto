"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu, X } from "lucide-react"


export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const links = [
    { href: "#how-it-works", label: "Como funciona" },
    { href: "#features", label: "Recursos" },
    { href: "#pricing", label: "Preços" },
    { href: "#faq", label: "FAQ" },
  ]

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? "rgba(15, 17, 23, 0.92)" : "transparent",
        backdropFilter: scrolled ? "blur(16px)" : "none",
        borderBottom: scrolled ? "1px solid #2A2D3A" : "1px solid transparent",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center transition-opacity duration-200 hover:opacity-85">
            <Image src="/logo.svg" alt="Lucro Oculto" width={160} height={38} priority />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-sm font-medium transition-colors duration-150 hover:opacity-80"
                style={{ color: "#8B8FA8" }}
                onMouseOver={(e) => (e.currentTarget.style.color = "#F4F4F5")}
                onMouseOut={(e) => (e.currentTarget.style.color = "#8B8FA8")}
              >
                {l.label}
              </a>
            ))}
          </nav>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium px-4 py-2 rounded-lg transition-all duration-150"
              style={{ color: "#8B8FA8", border: "1px solid #2A2D3A", background: "transparent" }}
              onMouseOver={(e) => {
                e.currentTarget.style.color = "#F4F4F5"
                e.currentTarget.style.borderColor = "#3D4158"
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.color = "#8B8FA8"
                e.currentTarget.style.borderColor = "#2A2D3A"
              }}
            >
              Entrar
            </Link>
            <Link
              href="/register"
              className="text-sm font-bold px-4 py-2 rounded-lg transition-all duration-200 animate-pulse-glow"
              style={{ background: "#00D084", color: "#0F1117" }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = "#00A86B"
                e.currentTarget.style.transform = "scale(1.03)"
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = "#00D084"
                e.currentTarget.style.transform = "scale(1)"
              }}
            >
              Começar grátis →
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg"
            style={{ color: "#8B8FA8", background: "#1A1D27", border: "1px solid #2A2D3A" }}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div
            className="md:hidden py-4 border-t animate-slide-down"
            style={{ borderColor: "#2A2D3A" }}
          >
            <div className="flex flex-col gap-2">
              {links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  className="px-3 py-2.5 rounded-lg text-sm font-medium"
                  style={{ color: "#8B8FA8" }}
                  onClick={() => setMobileOpen(false)}
                >
                  {l.label}
                </a>
              ))}
              <div className="border-t pt-3 mt-1 flex flex-col gap-2" style={{ borderColor: "#2A2D3A" }}>
                <Link
                  href="/login"
                  className="px-3 py-2.5 rounded-lg text-sm font-medium text-center"
                  style={{ color: "#8B8FA8", border: "1px solid #2A2D3A" }}
                  onClick={() => setMobileOpen(false)}
                >
                  Entrar
                </Link>
                <Link
                  href="/register"
                  className="px-3 py-2.5 rounded-lg text-sm font-bold text-center"
                  style={{ background: "#00D084", color: "#0F1117" }}
                  onClick={() => setMobileOpen(false)}
                >
                  Começar grátis
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
