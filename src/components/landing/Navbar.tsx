"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu, X, ArrowRight, ChevronRight, Zap } from "lucide-react"

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [mobileOpen])

  const links = [
    { href: "#how-it-works", label: "Como funciona" },
    { href: "#features", label: "Recursos" },
    { href: "#pricing", label: "Preços" },
    { href: "#faq", label: "FAQ" },
  ]

  const close = () => setMobileOpen(false)

  return (
    <>
      {/* ─── Header ─────────────────────────────────────────── */}
      <header
        className="fixed top-0 left-0 right-0 transition-all duration-300"
        style={{ zIndex: 100000 }}
      >
        <div
          className="transition-all duration-300"
          style={{
            background: scrolled || mobileOpen ? "rgb(10,12,18)" : "transparent",
            borderBottom: scrolled || mobileOpen ? "1px solid rgba(255,255,255,0.07)" : "1px solid transparent",
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">

              {/* Logo */}
              <Link href="/" onClick={close} className="flex items-center hover:opacity-80 transition-opacity">
                <Image src="/logo.svg" alt="Lucro Oculto" width={150} height={36} priority />
              </Link>

              {/* Desktop nav */}
              <nav className="hidden md:flex items-center gap-6">
                {links.map((l) => (
                  <a key={l.href} href={l.href}
                    className="text-sm font-medium transition-colors duration-150 hover:text-white"
                    style={{ color: "#8B8FA8" }}
                  >
                    {l.label}
                  </a>
                ))}
              </nav>

              {/* Desktop CTAs */}
              <div className="hidden md:flex items-center gap-3">
                <Link href="/login"
                  className="text-sm font-medium px-4 py-2 rounded-lg transition-all"
                  style={{ color: "#8B8FA8", border: "1px solid #2A2D3A" }}
                  onMouseOver={(e) => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "#3D4158" }}
                  onMouseOut={(e) => { e.currentTarget.style.color = "#8B8FA8"; e.currentTarget.style.borderColor = "#2A2D3A" }}
                >
                  Entrar
                </Link>
                <Link href="/register"
                  className="text-sm font-bold px-4 py-2 rounded-lg transition-all"
                  style={{ background: "#00D084", color: "#0F1117" }}
                  onMouseOver={(e) => { e.currentTarget.style.background = "#00A86B" }}
                  onMouseOut={(e) => { e.currentTarget.style.background = "#00D084" }}
                >
                  Começar grátis →
                </Link>
              </div>

              {/* Mobile toggle */}
              <button
                className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl transition-all"
                style={{
                  background: mobileOpen ? "rgba(0,208,132,0.1)" : "rgba(30,33,48,0.9)",
                  border: mobileOpen ? "1px solid rgba(0,208,132,0.25)" : "1px solid rgba(255,255,255,0.08)",
                  color: mobileOpen ? "#00D084" : "#F4F4F5",
                }}
                onClick={() => setMobileOpen((v) => !v)}
                aria-label="Menu"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

            </div>
          </div>
        </div>
      </header>

      {/* ─── Mobile drawer — fora do header para evitar stacking context ── */}
      {/* Backdrop */}
      {mobileOpen && (
        <div
          onClick={close}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
            zIndex: 99997,
          }}
        />
      )}

      {/* Drawer panel — slides in from top */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 99998,
          transform: mobileOpen ? "translateY(0)" : "translateY(-100%)",
          transition: "transform 0.35s cubic-bezier(0.32,0.72,0,1)",
          paddingTop: "64px", // below header
          background: "linear-gradient(180deg, #0A0C12 0%, #0D0F18 100%)",
          borderBottom: "1px solid rgba(0,208,132,0.15)",
          boxShadow: mobileOpen ? "0 20px 60px rgba(0,0,0,0.7)" : "none",
        }}
        className="md:hidden"
      >
        <div className="px-4 pt-4 pb-8 flex flex-col gap-3 max-w-lg mx-auto">

          {/* Nav links */}
          <div
            className="flex flex-col overflow-hidden"
            style={{
              borderRadius: "16px",
              border: "1px solid rgba(255,255,255,0.07)",
              background: "rgba(255,255,255,0.025)",
            }}
          >
            {links.map((l, i) => (
              <a
                key={l.href}
                href={l.href}
                onClick={close}
                className="flex items-center justify-between px-5 py-4 transition-colors active:bg-white/5"
                style={{
                  color: "#E4E4E7",
                  borderBottom: i < links.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                }}
              >
                <span className="text-[15px] font-semibold">{l.label}</span>
                <ChevronRight className="w-4 h-4" style={{ color: "#4B4F6A" }} />
              </a>
            ))}
          </div>

          {/* Login */}
          <Link
            href="/login"
            onClick={close}
            className="flex items-center justify-center py-4 rounded-2xl text-[15px] font-semibold transition-all active:opacity-70"
            style={{
              color: "#E4E4E7",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            Entrar na minha conta
          </Link>

          {/* CTA principal */}
          <Link
            href="/register"
            onClick={close}
            className="flex items-center justify-center gap-2.5 py-4 rounded-2xl text-[15px] font-bold transition-all active:opacity-90"
            style={{
              background: "linear-gradient(135deg, #00D084 0%, #00A86B 100%)",
              color: "#0A0C12",
              boxShadow: "0 4px 32px rgba(0,208,132,0.30)",
            }}
          >
            <Zap className="w-4 h-4" />
            Começar grátis agora
            <ArrowRight className="w-4 h-4" />
          </Link>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {["✓ 7 dias grátis", "✓ Sem cartão", "✓ Cancele quando quiser"].map((t) => (
              <span key={t} className="text-xs px-3 py-1 rounded-full"
                style={{ color: "#4B4F6A", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                {t}
              </span>
            ))}
          </div>

        </div>
      </div>
    </>
  )
}
