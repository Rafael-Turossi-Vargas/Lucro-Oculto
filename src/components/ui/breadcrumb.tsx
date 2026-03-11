"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight, Home } from "lucide-react"

const LABELS: Record<string, string> = {
  app: "App",
  dashboard: "Dashboard",
  upload: "Novo Upload",
  leaks: "Vazamentos",
  opportunities: "Oportunidades",
  alerts: "Alertas",
  "action-plan": "Plano de Ação",
  history: "Histórico",
  reports: "Relatórios",
  settings: "Configurações",
  analysis: "Análise",
  admin: "Admin",
}

export function Breadcrumb() {
  const pathname = usePathname()
  const segments = pathname.split("/").filter(Boolean)

  // Only show in /app/** routes, and only if more than 2 segments deep
  if (!segments[0] === ("app" as unknown as boolean) || segments.length < 2) return null
  // Don't show on dashboard itself
  if (segments.length === 2 && segments[1] === "dashboard") return null

  const crumbs = segments.map((seg, i) => {
    const href = "/" + segments.slice(0, i + 1).join("/")
    const label = LABELS[seg] ?? (seg.length > 20 ? seg.slice(0, 16) + "…" : seg)
    const isLast = i === segments.length - 1
    return { href, label, isLast }
  })

  return (
    <nav className="flex items-center gap-1.5 mb-6 flex-wrap" aria-label="Breadcrumb">
      <Link
        href="/app/dashboard"
        className="flex items-center gap-1 text-xs transition-colors hover:opacity-80"
        style={{ color: "#4B4F6A" }}
      >
        <Home className="w-3 h-3" />
      </Link>
      {crumbs.map((crumb, i) => (
        <span key={i} className="flex items-center gap-1.5">
          <ChevronRight className="w-3 h-3" style={{ color: "#2A2D3A" }} />
          {crumb.isLast ? (
            <span className="text-xs font-medium" style={{ color: "#F4F4F5" }}>
              {crumb.label}
            </span>
          ) : (
            <Link
              href={crumb.href}
              className="text-xs transition-colors hover:opacity-80"
              style={{ color: "#4B4F6A" }}
            >
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  )
}
