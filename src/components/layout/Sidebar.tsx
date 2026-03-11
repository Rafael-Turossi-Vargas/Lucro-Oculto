"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import {
  BarChart3, TrendingDown, Lightbulb, Bell, ClipboardList,
  History, FileText, Upload, Settings, LogOut, Zap, Menu, X, ShieldCheck,
  Users, Building2, ChevronsUpDown,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { can, ROLES, type Permission } from "@/lib/roles"

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

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [notifOpen, setNotifOpen] = useState(false)
  const [alertCount, setAlertCount] = useState(0)

  useEffect(() => {
    fetch("/api/app/dashboard").then(r => r.json()).then((d: unknown) => {
      const data = d as { analysis?: { alerts?: { isDismissed?: boolean }[] } } | null
      setAlertCount(data?.analysis?.alerts?.filter((a) => !a.isDismissed)?.length ?? 0)
    }).catch(() => {})
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
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-[#2A2D3A]">
        <Image src="/logo-icon.svg" alt="Lucro Oculto" width={32} height={32} />
        <div className="flex-1 min-w-0">
          <p className="text-[#F4F4F5] font-semibold text-sm leading-tight truncate">
            {isAdmin ? "Lucro Oculto" : (organizationName || "Minha Empresa")}
          </p>
          <p className="text-[#4B4F6A] text-xs">{ROLES[role as keyof typeof ROLES]?.label ?? "Membro"}</p>
        </div>
        <button
          onClick={() => setNotifOpen(!notifOpen)}
          className="relative p-1.5 rounded-lg hover:bg-[#212435] transition-colors"
          style={{ color: "#8B8FA8" }}
          aria-label="Notificações"
        >
          <Bell className="w-4 h-4" />
          {alertCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center" style={{ background: "#FF4D4F", color: "#fff" }}>
              {alertCount > 9 ? "9+" : alertCount}
            </span>
          )}
        </button>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.filter(item => !item.permission || can(role, item.permission)).map((item) => {
          const isActive = pathname === item.href || (item.href !== "/app/dashboard" && pathname.startsWith(item.href))
          const Icon = item.icon
          return (
            <Link key={item.href} href={item.href} onClick={onNavigate}
              className={cn(
                "group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 relative",
                isActive
                  ? "bg-[#00D084]/10 text-[#00D084] border border-[#00D084]/20"
                  : "text-[#8B8FA8] hover:text-[#F4F4F5] hover:bg-[#212435] border border-transparent"
              )}>
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-[#00D084] rounded-r-full" />
              )}
              <Icon className={cn("w-4 h-4 shrink-0", isActive ? "text-[#00D084]" : "text-current")} />
              <span className="text-sm font-medium truncate">{item.label}</span>
              {item.badge === "danger" && <span className="ml-auto w-2 h-2 rounded-full bg-[#FF4D4F] shrink-0" />}
              {item.badge === "warning" && <span className="ml-auto w-2 h-2 rounded-full bg-[#F59E0B] shrink-0" />}
            </Link>
          )
        })}

        {(isPremium || isAdmin) && (can(role, "team:view") || can(role, "companies:manage")) && (
          <>
            <div className="px-3 pt-3 pb-1">
              <p className="text-[10px] font-semibold text-[#4B4F6A] uppercase tracking-widest">Premium</p>
            </div>
            {can(role, "team:view") && (
              <Link href="/app/team" onClick={onNavigate}
                className={cn(
                  "group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 relative border",
                  pathname.startsWith("/app/team")
                    ? "bg-[#A855F7]/10 text-[#A855F7] border-[#A855F7]/20"
                    : "text-[#8B8FA8] hover:text-[#F4F4F5] hover:bg-[#212435] border-transparent"
                )}>
                {pathname.startsWith("/app/team") && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-[#A855F7] rounded-r-full" />
                )}
                <Users className="w-4 h-4 shrink-0" />
                <span className="text-sm font-medium">Equipe</span>
              </Link>
            )}
            {can(role, "companies:manage") && (
              <Link href="/app/companies" onClick={onNavigate}
                className={cn(
                  "group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 relative border",
                  pathname.startsWith("/app/companies")
                    ? "bg-[#A855F7]/10 text-[#A855F7] border-[#A855F7]/20"
                    : "text-[#8B8FA8] hover:text-[#F4F4F5] hover:bg-[#212435] border-transparent"
                )}>
                {pathname.startsWith("/app/companies") && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-[#A855F7] rounded-r-full" />
                )}
                <Building2 className="w-4 h-4 shrink-0" />
                <span className="text-sm font-medium">Empresas</span>
              </Link>
            )}
          </>
        )}

        {isAdmin && (
          <Link href="/app/admin" onClick={onNavigate}
            className={cn(
              "group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 relative border",
              pathname.startsWith("/app/admin")
                ? "bg-[#3B82F6]/10 text-[#3B82F6] border-[#3B82F6]/20"
                : "text-[#3B82F6]/70 hover:text-[#3B82F6] hover:bg-[#3B82F6]/08 border-transparent"
            )}>
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span className="text-sm font-medium">Painel Admin</span>
          </Link>
        )}
      </nav>

      <div className="px-3 pb-3">
        {isAdmin ? (
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-[#3B82F6]/10 border border-[#3B82F6]/20">
            <ShieldCheck className="w-3.5 h-3.5 text-[#3B82F6] shrink-0" />
            <span className="text-xs text-[#3B82F6] font-semibold flex-1">Admin</span>
            <span className="text-[10px] text-[#4B4F6A]">Acesso total</span>
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
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-[#212435] border border-[#2A2D3A]">
            <Zap className="w-3.5 h-3.5 text-[#F59E0B] shrink-0" />
            <span className="text-xs text-[#8B8FA8] flex-1">Plano Grátis</span>
            <Link href="/app/settings#upgrade" onClick={onNavigate}
              className="text-xs text-[#00D084] font-medium hover:underline shrink-0">
              Upgrade
            </Link>
          </div>
        )}
      </div>

      {(can(role, "settings:profile") || can(role, "finance:view")) && (
        <div className="px-3 pb-2">
          <Link href="/app/settings" onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 border",
              pathname === "/app/settings"
                ? "bg-[#00D084]/10 text-[#00D084] border-[#00D084]/20"
                : "text-[#8B8FA8] hover:text-[#F4F4F5] hover:bg-[#212435] border-transparent"
            )}>
            <Settings className="w-4 h-4 shrink-0" />
            <span className="text-sm font-medium">Configurações</span>
          </Link>
        </div>
      )}

      <div className="px-3 pb-4 border-t border-[#2A2D3A] pt-3">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[#212435] transition-colors cursor-pointer group">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#00D084]/20 border border-[#00D084]/30 shrink-0">
            <span className="text-xs font-semibold text-[#00D084]">{userInitials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[#F4F4F5] truncate leading-tight">{userName}</p>
            <p className="text-xs text-[#4B4F6A] truncate">{userEmail}</p>
          </div>
          <button type="button" onClick={() => signOut({ callbackUrl: "/login" })}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-[#FF4D4F]/10 hover:text-[#FF4D4F] text-[#4B4F6A]"
            title="Sair">
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}

export function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { data: session } = useSession()
  const plan = (session?.user as { plan?: string })?.plan ?? "free"
  const isAdmin = plan === "admin"
  const orgName = (session?.user as { organizationName?: string })?.organizationName ?? ""
  const displayName = isAdmin ? "Lucro Oculto" : (orgName || "Minha Empresa")

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-[260px] h-full bg-[#1A1D27] border-r border-[#2A2D3A] shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3 bg-[#1A1D27] border-b border-[#2A2D3A]">
        <div className="flex items-center gap-2">
          <Image src="/logo-icon.svg" alt="Lucro Oculto" width={28} height={28} />
          <p className="text-[#F4F4F5] font-semibold text-sm truncate">{displayName}</p>
        </div>
        <button onClick={() => setMobileOpen(true)} className="p-2 rounded-lg text-[#8B8FA8] hover:bg-[#212435]">
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
        className={cn(
          "lg:hidden fixed left-0 top-0 bottom-0 z-50 w-[280px] bg-[#1A1D27] border-r border-[#2A2D3A] overflow-y-auto transition-transform duration-300 ease-out",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#2A2D3A]">
          <div className="flex items-center gap-2">
            <Image src="/logo-icon.svg" alt="Lucro Oculto" width={28} height={28} />
            <p className="text-[#F4F4F5] font-semibold text-sm truncate">{displayName}</p>
          </div>
          <button onClick={() => setMobileOpen(false)} className="p-1.5 rounded-lg text-[#8B8FA8] hover:bg-[#212435]">
            <X className="w-4 h-4" />
          </button>
        </div>
        <SidebarContent onNavigate={() => setMobileOpen(false)} />
      </aside>
    </>
  )
}
