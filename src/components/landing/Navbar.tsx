"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Menu, X, ArrowRight, Zap, Sun, Moon, TrendingUp, BarChart3, DollarSign, HelpCircle, LogIn, ChevronRight } from "lucide-react"
import { useTheme } from "@/lib/theme"

function LogoBrand({ size = 32 }: { size?: number }) {
  return (
    <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      {/* Ícone */}
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden>
        <rect width="48" height="48" rx="12" fill="#0D0F14" />
        <rect width="48" height="48" rx="12" fill="none" stroke="#00D084" strokeOpacity="0.22" strokeWidth="1" />
        <clipPath id="lc">
          <circle cx="20" cy="21" r="11" />
        </clipPath>
        <defs>
          <linearGradient id="bg" x1="20" y1="32" x2="20" y2="10" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#006640" />
            <stop offset="100%" stopColor="#00FF99" />
          </linearGradient>
        </defs>
        <circle cx="20" cy="21" r="11" fill="#07090E" />
        <g clipPath="url(#lc)">
          <rect x="13" y="22" width="3.5" height="22" rx="1" fill="url(#bg)" opacity="0.40" />
          <rect x="18.25" y="17" width="3.5" height="27" rx="1" fill="url(#bg)" opacity="0.68" />
          <rect x="23.5" y="12" width="3.5" height="32" rx="1" fill="url(#bg)" />
        </g>
        <circle cx="20" cy="21" r="11" fill="none" stroke="#00D084" strokeWidth="1.8" />
        <line x1="28.5" y1="29.5" x2="36.5" y2="37.5" stroke="#00D084" strokeWidth="2.4" strokeLinecap="round" />
      </svg>
      {/* Wordmark */}
      <span style={{
        fontSize: size * 0.52,
        fontWeight: 700,
        letterSpacing: "-0.3px",
        lineHeight: 1,
        color: "var(--text-primary)",
      }}>
        Lucro <span style={{ color: "#00D084" }}>Oculto</span>
      </span>
    </span>
  )
}

const navLinks = [
  { href: "#how-it-works", label: "Como funciona", desc: "Diagnóstico em 3 etapas simples", icon: TrendingUp, color: "#00D084" },
  { href: "#features", label: "Recursos", desc: "Ferramentas de análise financeira", icon: BarChart3, color: "#3B82F6" },
  { href: "#pricing", label: "Preços", desc: "A partir de R$0 · 7 dias grátis", icon: DollarSign, color: "#F59E0B" },
  { href: "#faq", label: "FAQ", desc: "Perguntas frequentes", icon: HelpCircle, color: "#8B5CF6" },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()

  useEffect(() => {
    let rafId: number | null = null
    const onScroll = () => {
      if (rafId !== null) return
      rafId = requestAnimationFrame(() => {
        setScrolled(window.scrollY > 20)
        rafId = null
      })
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", onScroll)
      if (rafId !== null) cancelAnimationFrame(rafId)
    }
  }, [])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [mobileOpen])

  const close = () => setMobileOpen(false)

  return (
    <>
      {/* ─── Header ─────────────────────────────────────────── */}
      <header
        className="fixed top-0 left-0 right-0 transition-all duration-300"
        style={{ zIndex: 40 }}
      >
        <div
          className="transition-all duration-300"
          style={{
            background: scrolled || mobileOpen ? "var(--bg-page)" : "transparent",
            borderBottom: scrolled || mobileOpen ? "1px solid var(--border)" : "1px solid transparent",
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">

              {/* Logo */}
              <Link href="/" onClick={close} className="flex items-center hover:opacity-80 transition-opacity">
                <LogoBrand size={32} />
              </Link>

              {/* Desktop nav */}
              <nav className="hidden md:flex items-center gap-6">
                {navLinks.map((l) => (
                  <a key={l.href} href={l.href}
                    className="text-sm font-medium transition-colors duration-150"
                    style={{ color: "var(--text-muted)" }}
                    onMouseOver={(e) => { e.currentTarget.style.color = "var(--text-primary)" }}
                    onMouseOut={(e) => { e.currentTarget.style.color = "var(--text-muted)" }}
                  >
                    {l.label}
                  </a>
                ))}
              </nav>

              {/* Desktop CTAs */}
              <div className="hidden md:flex items-center gap-3">
                <button
                  onClick={toggleTheme}
                  title={theme === "dark" ? "Mudar para modo claro" : "Mudar para modo escuro"}
                  className="flex items-center justify-center w-9 h-9 rounded-lg transition-all"
                  style={{ color: "var(--text-muted)", border: "1px solid var(--border)", background: "transparent" }}
                  onMouseOver={(e) => { e.currentTarget.style.color = "var(--text-primary)"; e.currentTarget.style.borderColor = "var(--border-hover)" }}
                  onMouseOut={(e) => { e.currentTarget.style.color = "var(--text-muted)"; e.currentTarget.style.borderColor = "var(--border)" }}
                >
                  {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>
                <Link href="/login"
                  className="text-sm font-medium px-4 py-2 rounded-lg transition-all"
                  style={{ color: "var(--text-muted)", border: "1px solid var(--border)" }}
                  onMouseOver={(e) => { e.currentTarget.style.color = "var(--text-primary)"; e.currentTarget.style.borderColor = "var(--border-hover)" }}
                  onMouseOut={(e) => { e.currentTarget.style.color = "var(--text-muted)"; e.currentTarget.style.borderColor = "var(--border)" }}
                >
                  Entrar
                </Link>
                <Link href="/register"
                  className="text-sm font-bold px-4 py-2 rounded-lg transition-all"
                  style={{ background: "#00D084", color: "#fff" }}
                  onMouseOver={(e) => { e.currentTarget.style.background = "#00A86B" }}
                  onMouseOut={(e) => { e.currentTarget.style.background = "#00D084" }}
                >
                  Começar grátis →
                </Link>
              </div>

              {/* Mobile hamburger */}
              <button
                className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl transition-all"
                style={{
                  background: mobileOpen ? "rgba(0,208,132,0.12)" : "var(--bg-subtle)",
                  border: mobileOpen ? "1px solid rgba(0,208,132,0.3)" : "1px solid var(--border)",
                  color: mobileOpen ? "#00D084" : "var(--text-primary)",
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

      {/* ─── Backdrop ───────────────────────────────────────── */}
      <div
        onClick={close}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.55)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
          zIndex: 41,
          opacity: mobileOpen ? 1 : 0,
          pointerEvents: mobileOpen ? "auto" : "none",
          transition: "opacity 0.3s ease",
        }}
      />

      {/* ─── Side drawer (right) ────────────────────────────── */}
      <div
        className="md:hidden"
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: "min(340px, 92vw)",
          zIndex: 42,
          transform: mobileOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.38s cubic-bezier(0.32,0.72,0,1)",
          background: "var(--bg-page)",
          display: "flex",
          flexDirection: "column",
          boxShadow: "-24px 0 80px rgba(0,0,0,0.35)",
        }}
      >
        {/* ── Top bar: logo + close ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "18px 20px 16px",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <Link href="/" onClick={close}>
            <LogoBrand size={28} />
          </Link>
          <button
            onClick={close}
            className="flex items-center justify-center w-9 h-9 rounded-xl transition-all"
            style={{ background: "var(--bg-subtle)", border: "1px solid var(--border)", color: "var(--text-muted)" }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Nav links ── */}
        <div style={{ padding: "12px 16px", flex: 1, overflowY: "auto" }}>
          <p style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-faint)", padding: "4px 8px 10px" }}>
            Navegação
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {navLinks.map((l) => {
              const Icon = l.icon
              return (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={close}
                  className="group"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                    padding: "12px 14px",
                    borderRadius: "14px",
                    textDecoration: "none",
                    transition: "background 150ms",
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.background = "var(--bg-subtle)" }}
                  onMouseOut={(e) => { e.currentTarget.style.background = "transparent" }}
                >
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "12px",
                      background: `${l.color}15`,
                      border: `1px solid ${l.color}30`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Icon style={{ width: "18px", height: "18px", color: l.color }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.2, marginBottom: "2px" }}>
                      {l.label}
                    </p>
                    <p style={{ fontSize: "12px", color: "var(--text-faint)", lineHeight: 1.3 }}>
                      {l.desc}
                    </p>
                  </div>
                  <ChevronRight style={{ width: "16px", height: "16px", color: "var(--text-faint)", flexShrink: 0 }} />
                </a>
              )
            })}
          </div>
        </div>

        {/* ── Bottom CTAs ── */}
        <div
          style={{
            padding: "16px 16px 32px",
            borderTop: "1px solid var(--border)",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          {/* Primary CTA */}
          <Link
            href="/register"
            onClick={close}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              padding: "15px",
              borderRadius: "16px",
              background: "linear-gradient(135deg, #00D084 0%, #00A86B 100%)",
              color: "#fff",
              fontWeight: 800,
              fontSize: "15px",
              textDecoration: "none",
              boxShadow: "0 4px 24px rgba(0,208,132,0.35)",
            }}
          >
            <Zap style={{ width: "16px", height: "16px" }} />
            Começar grátis agora
            <ArrowRight style={{ width: "16px", height: "16px" }} />
          </Link>

          {/* Login */}
          <Link
            href="/login"
            onClick={close}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              padding: "13px",
              borderRadius: "14px",
              color: "var(--text-muted)",
              background: "var(--bg-subtle)",
              border: "1px solid var(--border)",
              fontWeight: 600,
              fontSize: "14px",
              textDecoration: "none",
            }}
          >
            <LogIn style={{ width: "15px", height: "15px" }} />
            Entrar na minha conta
          </Link>

          {/* Theme toggle + trust row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "4px" }}>
            <button
              onClick={toggleTheme}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "7px 12px",
                borderRadius: "10px",
                background: "var(--bg-subtle)",
                border: "1px solid var(--border)",
                color: "var(--text-muted)",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {theme === "dark" ? <Sun style={{ width: "13px", height: "13px" }} /> : <Moon style={{ width: "13px", height: "13px" }} />}
              {theme === "dark" ? "Modo claro" : "Modo escuro"}
            </button>
            <div style={{ display: "flex", gap: "6px" }}>
              {["7d grátis", "Sem cartão"].map((t) => (
                <span
                  key={t}
                  style={{
                    fontSize: "11px",
                    padding: "4px 8px",
                    borderRadius: "8px",
                    color: "#00D084",
                    background: "rgba(0,208,132,0.08)",
                    border: "1px solid rgba(0,208,132,0.2)",
                    fontWeight: 600,
                  }}
                >
                  ✓ {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
