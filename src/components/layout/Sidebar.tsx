"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import {
  BarChart3, TrendingDown, Lightbulb, Bell, ClipboardList,
  History, FileText, Upload, Settings, LogOut, Zap, Menu, X, ShieldCheck,
  Users, Building2, ChevronsUpDown, Sun, Moon,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { can, ROLES, type Permission } from "@/lib/roles"
import { useTheme } from "@/lib/theme"
import { NotificationPanel } from "./NotificationPanel"

type NavItem = {
  href: string
  label: string
  icon: LucideIcon
  badge?: "danger" | "warning"
  permission?: Permission
}

const navItems: NavItem[] = [
  { href: "/app/dashboard",    label: "Dashboard",      icon: BarChart3,    permission: "dashboard:view" },
  { href: "/app/leaks",        label: "Vazamentos",     icon: TrendingDown, permission: "leaks:view",    badge: "danger" },
  { href: "/app/opportunities",label: "Oportunidades",  icon: Lightbulb,    permission: "opportunities:view" },
  { href: "/app/alerts",       label: "Alertas",        icon: Bell,         permission: "alerts:view",   badge: "warning" },
  { href: "/app/action-plan",  label: "Plano de Ação",  icon: ClipboardList,permission: "action_plan:view" },
  { href: "/app/history",      label: "Histórico",      icon: History,      permission: "history:view" },
  { href: "/app/reports",      label: "Relatórios",     icon: FileText,     permission: "reports:view" },
  { href: "/app/upload",       label: "Novo Upload",    icon: Upload,       permission: "upload:create" },
]

type NotifAlert = {
  id: string
  type: string
  severity: string
  title: string
  message: string
  amount: string | null
  isRead: boolean
  createdAt: string
  analysisId: string
}

function SidebarContent({ onNavigate, collapsed = false }: { onNavigate?: () => void; collapsed?: boolean }) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const { theme, toggleTheme } = useTheme()
  const [alertCount, setAlertCount] = useState(0)
  const [quickScore, setQuickScore] = useState<number | null>(null)
  const [quickLeaks, setQuickLeaks] = useState<number | null>(null)
  const [scoreLoading, setScoreLoading] = useState(true)

  // Notification panel state
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifAlerts, setNotifAlerts] = useState<NotifAlert[]>([])
  const [notifLoading, setNotifLoading] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const bellRef = useRef<HTMLButtonElement>(null)
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  // Poll unread count every 60s
  const fetchUnread = useCallback(async () => {
    try {
      const r = await fetch("/api/app/notifications")
      if (r.ok) {
        const d = await r.json()
        setUnreadCount(d.unreadCount ?? 0)
      }
    } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    fetchUnread()
    const id = setInterval(fetchUnread, 60_000)
    return () => clearInterval(id)
  }, [fetchUnread])

  // Open panel: fetch alerts + mark as read
  const openNotif = useCallback(async () => {
    setNotifOpen(true)
    setNotifLoading(true)
    try {
      const r = await fetch("/api/app/notifications")
      if (r.ok) {
        const d = await r.json()
        setNotifAlerts(d.alerts ?? [])
      }
    } catch { /* ignore */ }
    setNotifLoading(false)
    // Mark as read (fire and forget)
    fetch("/api/app/notifications", { method: "PATCH" }).then(() => setUnreadCount(0)).catch(() => { /* ignore */ })
  }, [])

  const closeNotif = useCallback(() => setNotifOpen(false), [])

  useEffect(() => {
    // Cache de 30s no sessionStorage — evita fetch repetido em cada navegação
    const CACHE_KEY = "sidebar_dash_v1"
    const CACHE_TTL = 30_000

    type SidebarData = {
      analysis?: {
        alerts?: { isDismissed?: boolean }[]
        score?: number
        insights?: { type: string }[]
      }
    } | null

    const applyData = (d: SidebarData) => {
      setAlertCount(d?.analysis?.alerts?.filter(a => !a.isDismissed)?.length ?? 0)
      if (d?.analysis?.score != null) setQuickScore(d.analysis.score)
      if (d?.analysis?.insights) setQuickLeaks(d.analysis.insights.filter(i => i.type === "leak").length)
    }

    try {
      const raw = sessionStorage.getItem(CACHE_KEY)
      if (raw) {
        const { ts, data } = JSON.parse(raw) as { ts: number; data: SidebarData }
        if (Date.now() - ts < CACHE_TTL) { applyData(data); setScoreLoading(false); return }
      }
    } catch { /* ignora */ }

    fetch("/api/app/dashboard")
      .then(r => r.json())
      .then((d: SidebarData) => {
        applyData(d)
        setScoreLoading(false)
        try { sessionStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data: d })) } catch { /* ignora */ }
      })
      .catch(() => { setScoreLoading(false) })
  }, [])

  const userName = session?.user?.name ?? "Usuário"
  const userEmail = session?.user?.email ?? ""
  const userInitials = userName.split(" ").slice(0, 2).map((n: string) => n[0] ?? "").join("").toUpperCase()
  const plan = (session?.user as { plan?: string; trialEndsAt?: string | null })?.plan ?? "free"
  const trialEndsAt = (session?.user as { trialEndsAt?: string | null })?.trialEndsAt ?? null
  const organizationName = (session?.user as { organizationName?: string })?.organizationName ?? ""
  const role       = session?.user?.role ?? "viewer"
  const isPro      = plan === "pro"
  const isPremium  = plan === "premium"
  const isAdmin    = plan === "admin"
  const isTrial    = isPro && trialEndsAt !== null
  const trialDaysLeft = trialEndsAt
    ? Math.max(0, Math.ceil((new Date(trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div
        className={cn("flex items-center border-b transition-all duration-200", collapsed ? "justify-center px-3 py-4" : "gap-2.5 px-5 py-5")}
        style={{ borderColor: "var(--border)" }}
      >
        <Image src="/logo-icon.svg" alt="Lucro Oculto" width={32} height={32} className="shrink-0" />
        {!collapsed && (
          <>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm leading-tight truncate" style={{ color: "var(--text-primary)" }}>
                {isAdmin ? "Lucro Oculto" : (organizationName || "Minha Empresa")}
              </p>
              <p className="text-xs" style={{ color: "var(--text-faint)" }}>{ROLES[role as keyof typeof ROLES]?.label ?? "Membro"}</p>
            </div>
            <button
              ref={bellRef}
              onClick={openNotif}
              className="relative p-1.5 rounded-lg transition-colors"
              style={{ color: notifOpen ? "var(--text-primary)" : "var(--text-muted)", background: notifOpen ? "var(--bg-subtle)" : undefined }}
              aria-label="Notificações"
              title="Notificações"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center" style={{ background: "#FF4D4F", color: "#fff" }}>
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
            {mounted && (
              <NotificationPanel
                open={notifOpen}
                alerts={notifAlerts}
                loading={notifLoading}
                onClose={closeNotif}
                anchorRef={bellRef}
              />
            )}
          </>
        )}
      </div>

      <nav className={cn("flex-1 py-4 space-y-0.5 overflow-y-auto", collapsed ? "px-2" : "px-3")}>
        {navItems.filter(item => !item.permission || can(role, item.permission)).map((item) => {
          const isActive = pathname === item.href || (item.href !== "/app/dashboard" && pathname.startsWith(item.href))
          const Icon = item.icon
          return (
            <Link key={item.href} href={item.href} onClick={onNavigate}
              title={collapsed ? item.label : undefined}
              className={cn(
                "group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 relative",
                collapsed && "justify-center px-0 py-2.5",
                isActive
                  ? "bg-[#00D084]/10 text-[#00D084] border border-[#00D084]/20"
                  : "border border-transparent"
              )}
              style={!isActive ? { color: "var(--text-muted)" } : undefined}
              onMouseEnter={!isActive ? (e) => {
                (e.currentTarget as HTMLElement).style.color = "var(--text-primary)"
                ;(e.currentTarget as HTMLElement).style.background = "var(--bg-subtle)"
              } : undefined}
              onMouseLeave={!isActive ? (e) => {
                (e.currentTarget as HTMLElement).style.color = "var(--text-muted)"
                ;(e.currentTarget as HTMLElement).style.background = ""
              } : undefined}>
              {isActive && !collapsed && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-[#00D084] rounded-r-full" />
              )}
              <Icon className={cn("w-4 h-4 shrink-0", isActive ? "text-[#00D084]" : "text-current")} />
              {!collapsed && <span className="text-sm font-medium truncate">{item.label}</span>}
              {!collapsed && item.badge === "danger" && <span className="ml-auto w-2 h-2 rounded-full bg-[#FF4D4F] shrink-0" />}
              {!collapsed && item.badge === "warning" && <span className="ml-auto w-2 h-2 rounded-full bg-[#F59E0B] shrink-0" />}
            </Link>
          )
        })}

        {(isPremium || isAdmin) && (can(role, "team:view") || can(role, "companies:manage")) && (
          <>
            {!collapsed && (
              <div className="px-3 pt-3 pb-1">
                <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "var(--text-faint)" }}>Premium</p>
              </div>
            )}
            {can(role, "team:view") && (
              <Link href="/app/team" onClick={onNavigate}
                title={collapsed ? "Equipe" : undefined}
                className={cn(
                  "group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 relative border",
                  collapsed && "justify-center px-0 py-2.5",
                  pathname.startsWith("/app/team")
                    ? "bg-[#A855F7]/10 text-[#A855F7] border-[#A855F7]/20"
                    : "border-transparent"
                )}
                style={!pathname.startsWith("/app/team") ? { color: "var(--text-muted)" } : undefined}>
                {pathname.startsWith("/app/team") && !collapsed && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-[#A855F7] rounded-r-full" />
                )}
                <Users className="w-4 h-4 shrink-0" />
                {!collapsed && <span className="text-sm font-medium">Equipe</span>}
              </Link>
            )}
            {can(role, "companies:manage") && (
              <Link href="/app/companies" onClick={onNavigate}
                title={collapsed ? "Empresas" : undefined}
                className={cn(
                  "group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 relative border",
                  collapsed && "justify-center px-0 py-2.5",
                  pathname.startsWith("/app/companies")
                    ? "bg-[#A855F7]/10 text-[#A855F7] border-[#A855F7]/20"
                    : "border-transparent"
                )}
                style={!pathname.startsWith("/app/companies") ? { color: "var(--text-muted)" } : undefined}>
                {pathname.startsWith("/app/companies") && !collapsed && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-[#A855F7] rounded-r-full" />
                )}
                <Building2 className="w-4 h-4 shrink-0" />
                {!collapsed && <span className="text-sm font-medium">Empresas</span>}
              </Link>
            )}
          </>
        )}

        {isAdmin && (
          <Link href="/app/admin" onClick={onNavigate}
            title={collapsed ? "Painel Admin" : undefined}
            className={cn(
              "group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 relative border",
              collapsed && "justify-center px-0 py-2.5",
              pathname.startsWith("/app/admin")
                ? "bg-[#3B82F6]/10 text-[#3B82F6] border-[#3B82F6]/20"
                : "text-[#3B82F6]/70 hover:text-[#3B82F6] hover:bg-[#3B82F6]/08 border-transparent"
            )}>
            <ShieldCheck className="w-4 h-4 shrink-0" />
            {!collapsed && <span className="text-sm font-medium">Painel Admin</span>}
          </Link>
        )}
      </nav>

      {/* Quick summary mini card — skeleton while loading */}
      {scoreLoading && !collapsed && (
        <div className="px-3 pb-2">
          <div className="rounded-lg px-3 py-2.5 animate-pulse" style={{ background: "var(--bg-subtle)", border: "1px solid var(--border)" }}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg shrink-0" style={{ background: "var(--border)" }} />
              <div className="flex-1 space-y-1.5">
                <div className="h-2.5 rounded" style={{ background: "var(--border)", width: "60%" }} />
                <div className="h-2 rounded" style={{ background: "var(--border)", width: "40%" }} />
              </div>
            </div>
          </div>
        </div>
      )}
      {quickScore !== null && !collapsed && (
        <div className="px-3 pb-2">
          <Link href="/app/dashboard"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors hover:opacity-80"
            style={{ background: "var(--bg-subtle)", border: "1px solid var(--border)" }}>
            <div className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0 font-black text-sm"
              style={{
                background: quickScore >= 75 ? "rgba(0,208,132,0.12)" : quickScore >= 50 ? "rgba(245,158,11,0.12)" : "rgba(255,77,79,0.12)",
                color: quickScore >= 75 ? "#00D084" : quickScore >= 50 ? "#F59E0B" : "#FF4D4F",
              }}>
              {quickScore}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-semibold leading-tight" style={{ color: "var(--text-primary)" }}>Score atual</p>
              {quickLeaks !== null && quickLeaks > 0 && (
                <p className="text-[10px]" style={{ color: "#FF4D4F" }}>{quickLeaks} vazamento{quickLeaks > 1 ? "s" : ""} ativo{quickLeaks > 1 ? "s" : ""}</p>
              )}
              {quickLeaks === 0 && (
                <p className="text-[10px]" style={{ color: "#00D084" }}>Sem vazamentos</p>
              )}
            </div>
          </Link>
        </div>
      )}

      {/* Plan badge */}
      {!collapsed && (
        <div className="px-3 pb-3">
          {isAdmin ? (
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-[#3B82F6]/10 border border-[#3B82F6]/20">
              <ShieldCheck className="w-3.5 h-3.5 text-[#3B82F6] shrink-0" />
              <span className="text-xs text-[#3B82F6] font-semibold flex-1">Admin</span>
              <span className="text-[10px]" style={{ color: "var(--text-faint)" }}>Acesso total</span>
            </div>
          ) : isPremium ? (
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-[#A855F7]/10 border border-[#A855F7]/20">
              <ChevronsUpDown className="w-3.5 h-3.5 text-[#A855F7] shrink-0" />
              <span className="text-xs text-[#A855F7] font-semibold flex-1">Plano Premium</span>
              {can(role, "companies:manage") && (
                <Link href="/app/companies" onClick={onNavigate}
                  className="text-[10px] text-[#A855F7]/70 hover:text-[#A855F7] font-medium hover:underline shrink-0">
                  Empresas
                </Link>
              )}
            </div>
          ) : isPro ? (
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-[#F59E0B]/10 border border-[#F59E0B]/20">
              <Zap className="w-3.5 h-3.5 text-[#F59E0B] shrink-0" />
              <span className="text-xs text-[#F59E0B] font-semibold flex-1">
                {isTrial ? "Trial Pro" : "Plano Pro"}
              </span>
              {isTrial ? (
                <span className="text-[10px] font-bold text-[#F59E0B]">{trialDaysLeft}d</span>
              ) : (
                <Link href="/app/settings#upgrade" onClick={onNavigate}
                  className="text-[10px] text-[#A855F7] font-medium hover:underline shrink-0">
                  Premium
                </Link>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg border" style={{ background: "var(--bg-subtle)", borderColor: "var(--border)" }}>
              <Zap className="w-3.5 h-3.5 text-[#F59E0B] shrink-0" />
              <span className="text-xs flex-1" style={{ color: "var(--text-muted)" }}>Plano Grátis</span>
              <Link href="/app/settings#upgrade" onClick={onNavigate}
                className="text-xs text-[#00D084] font-medium hover:underline shrink-0">
                Upgrade
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Settings */}
      {(can(role, "settings:profile") || can(role, "finance:view")) && (
        <div className={cn("pb-2", collapsed ? "px-2" : "px-3")}>
          <Link href="/app/settings" onClick={onNavigate}
            title={collapsed ? "Configurações" : undefined}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 border",
              collapsed && "justify-center px-0",
              pathname === "/app/settings"
                ? "bg-[#00D084]/10 text-[#00D084] border-[#00D084]/20"
                : "border-transparent"
            )}
            style={pathname !== "/app/settings" ? { color: "var(--text-muted)" } : undefined}>
            <Settings className="w-4 h-4 shrink-0" />
            {!collapsed && <span className="text-sm font-medium">Configurações</span>}
          </Link>
        </div>
      )}

      {/* Theme toggle */}
      <div className={cn("pb-2", collapsed ? "px-2" : "px-3")}>
        <button
          onClick={toggleTheme}
          className={cn(
            "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg transition-all duration-150 border border-transparent",
            collapsed && "justify-center px-0"
          )}
          style={{ color: "var(--text-muted)" }}
          title={theme === "dark" ? "Mudar para modo claro" : "Mudar para modo escuro"}
        >
          {theme === "dark" ? <Sun className="w-4 h-4 shrink-0" /> : <Moon className="w-4 h-4 shrink-0" />}
          {!collapsed && <span className="text-sm font-medium">{theme === "dark" ? "Modo claro" : "Modo escuro"}</span>}
        </button>
      </div>

      {/* User footer */}
      <div className={cn("pb-4 border-t pt-3", collapsed ? "px-2" : "px-3")} style={{ borderColor: "var(--border)" }}>
        <div className={cn("flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors cursor-pointer group", collapsed && "justify-center px-0")}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--bg-subtle)" }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "" }}>
          <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-[#00D084]/20 border border-[#00D084]/30 shrink-0">
            <span className="text-xs font-semibold text-[#00D084]">{userInitials}</span>
            {collapsed && (
              <button type="button" onClick={() => signOut({ callbackUrl: "/login" })}
                className="absolute inset-0 w-full h-full rounded-full flex items-center justify-center opacity-0 hover:opacity-100 bg-[#FF4D4F]/80 transition-opacity"
                title="Sair">
                <LogOut className="w-3.5 h-3.5 text-white" />
              </button>
            )}
          </div>
          {!collapsed && (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate leading-tight" style={{ color: "var(--text-primary)" }}>{userName}</p>
                <p className="text-xs truncate" style={{ color: "var(--text-faint)" }}>{userEmail}</p>
              </div>
              <button type="button" onClick={() => signOut({ callbackUrl: "/login" })}
                className="opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-[#FF4D4F]/10 hover:text-[#FF4D4F]"
                style={{ color: "var(--text-faint)" }}
                title="Sair">
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const swipeStartX = useRef<number | null>(null)

  const handleTouchStart = (e: React.TouchEvent) => {
    swipeStartX.current = e.touches[0].clientX
  }
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (swipeStartX.current === null) return
    const dx = swipeStartX.current - e.changedTouches[0].clientX
    if (dx > 60) setMobileOpen(false) // swipe left to close
    swipeStartX.current = null
  }
  const { data: session } = useSession()
  const plan = (session?.user as { plan?: string })?.plan ?? "free"
  const isAdmin = plan === "admin"
  const orgName = (session?.user as { organizationName?: string })?.organizationName ?? ""
  const displayName = isAdmin ? "Lucro Oculto" : (orgName || "Minha Empresa")

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="hidden lg:flex flex-col h-full shrink-0 border-r transition-all duration-200"
        style={{
          width: collapsed ? "64px" : "260px",
          background: "var(--bg-card)",
          borderColor: "var(--border)",
        }}
      >
        {/* Collapse toggle button */}
        <button
          onClick={() => setCollapsed(v => !v)}
          className="absolute left-0 top-20 z-10 flex items-center justify-center w-5 h-8 rounded-r-lg transition-all"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderLeft: "none",
            color: "var(--text-faint)",
            marginLeft: collapsed ? "64px" : "260px",
          }}
          title={collapsed ? "Expandir menu" : "Recolher menu"}
        >
          <svg width="8" height="12" viewBox="0 0 8 12" fill="none">
            <path d={collapsed ? "M2 1l4 5-4 5" : "M6 1L2 6l4 5"} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <SidebarContent collapsed={collapsed} />
      </aside>

      {/* Mobile header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3 border-b" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
        <div className="flex items-center gap-2">
          <Image src="/logo-icon.svg" alt="Lucro Oculto" width={28} height={28} />
          <p className="font-semibold text-sm truncate" style={{ color: "var(--text-primary)" }}>{displayName}</p>
        </div>
        <button onClick={() => setMobileOpen(true)} className="p-2 rounded-lg" style={{ color: "var(--text-muted)" }}>
          <Menu className="w-5 h-5" />
        </button>
      </header>

      {/* Mobile overlay */}
      <div
        onClick={() => setMobileOpen(false)}
        className={cn(
          "lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-300",
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      />

      {/* Mobile drawer */}
      <aside
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className={cn(
          "lg:hidden fixed left-0 top-0 bottom-0 z-50 w-[280px] overflow-y-auto transition-transform duration-300 ease-out border-r",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
        style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center gap-2">
            <Image src="/logo-icon.svg" alt="Lucro Oculto" width={28} height={28} />
            <p className="font-semibold text-sm truncate" style={{ color: "var(--text-primary)" }}>{displayName}</p>
          </div>
          <button onClick={() => setMobileOpen(false)} className="p-1.5 rounded-lg" style={{ color: "var(--text-muted)" }}>
            <X className="w-4 h-4" />
          </button>
        </div>
        <SidebarContent onNavigate={() => setMobileOpen(false)} />
      </aside>
    </>
  )
}
