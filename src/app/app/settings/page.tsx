"use client"

import { useState, useEffect, Suspense } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { AccessGuard } from "@/components/auth/AccessGuard"
import { FinanceGuard } from "@/components/auth/FinanceGuard"
import { useSearchParams } from "next/navigation"
import {
  Save, Loader2, CheckCircle, Zap, Crown, User, Building2, Shield,
  CreditCard, Bell, KeyRound, ChevronRight, Sparkles, AlertTriangle, Lock,
  Plug, Webhook, Plus, Eye, EyeOff, Link2, Unlink, RefreshCw, WifiOff,
} from "lucide-react"
import { BANK_LOGOS } from "@/components/bank-logos"
import dynamic from "next/dynamic"

// Load PluggyConnect only client-side (it manipulates the DOM directly)
const PluggyConnect = dynamic(
  () => import("react-pluggy-connect").then(m => m.PluggyConnect),
  { ssr: false }
)
import { can } from "@/lib/roles"

type Tab = "profile" | "plan" | "notifications" | "security" | "integracoes"

const TABS: { id: Tab; label: string; icon: typeof User; permission: "settings:profile" | "finance:view" }[] = [
  { id: "profile",      label: "Perfil",           icon: User,       permission: "settings:profile" },
  { id: "plan",         label: "Plano & Cobrança",  icon: CreditCard, permission: "finance:view" },
  { id: "notifications",label: "Notificações",      icon: Bell,       permission: "settings:profile" },
  { id: "security",     label: "Segurança",          icon: Shield,     permission: "settings:profile" },
  { id: "integracoes",  label: "Integrações",        icon: Plug,       permission: "finance:view" },
]

const PRO_FEATURES = [
  "Análises ilimitadas por mês",
  "Até 10.000 transações por arquivo",
  "Relatório PDF com logo da empresa",
  "Benchmarks do seu setor",
  "Alertas automáticos em tempo real",
  "Exportação para Excel e CSV",
  "Suporte prioritário por email",
  "Histórico ilimitado de análises",
]

const PREMIUM_FEATURES = [
  "Tudo do plano Pro",
  "Até 50.000 transações por arquivo",
  "Até 3 empresas no mesmo painel",
  "Multi-usuário (até 5 membros)",
  "Relatórios avançados e comparativos",
  "Benchmark exclusivo por nicho",
  "Webhooks e integrações externas",
  "Integração bancária — Open Finance",
  "Suporte prioritário por WhatsApp",
]

function ProfileTab() {
  const { data: session } = useSession()
  const isOwner = session?.user?.role === "owner"
  const [name, setName] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [niche, setNiche] = useState("")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState("")
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    fetch("/api/app/settings")
      .then((r) => r.json())
      .then((d) => {
        setName(d.user?.name ?? "")
        setCompanyName(d.org?.name ?? "")
        setNiche(d.org?.niche ?? "")
      })
      .catch(() => {})
      .finally(() => setLoadingData(false))
  }, [])

  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((n: string) => n[0] ?? "")
    .join("")
    .toUpperCase()

  const handleSave = async () => {
    setSaving(true)
    setError("")
    try {
      const payload: { name: string; companyName?: string; niche?: string } = { name }
      if (isOwner) { payload.companyName = companyName; payload.niche = niche }
      const res = await fetch("/api/app/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const d = await res.json() as { error?: string }
        setError(d.error ?? "Erro ao salvar")
      } else {
        setSaved(true)
        setTimeout(() => setSaved(false), 2500)
      }
    } catch {
      setError("Erro ao salvar")
    } finally {
      setSaving(false)
    }
  }

  if (loadingData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-5 h-5 animate-spin" style={{ color: "#00D084" }} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Avatar + name */}
      <div className="rounded-2xl p-6" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
        <div className="flex items-center gap-4 mb-6 pb-6" style={{ borderBottom: "1px solid var(--border)" }}>
          <div
            className="flex items-center justify-center w-16 h-16 rounded-2xl text-xl font-black shrink-0"
            style={{ background: "rgba(0,208,132,0.12)", border: "2px solid rgba(0,208,132,0.25)", color: "#00D084" }}
          >
            {initials || <User className="w-7 h-7" />}
          </div>
          <div>
            <p className="text-base font-bold" style={{ color: "var(--text-primary)" }}>{name || "Seu nome"}</p>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>{session?.user?.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: "var(--text-faint)" }}>
              Nome completo
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
              style={{ background: "var(--bg-subtle)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
              onFocus={(e) => (e.target.style.borderColor = "#00D084")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: "var(--text-faint)" }}>
              Email
            </label>
            <div className="relative">
              <input
                type="email"
                value={session?.user?.email ?? ""}
                readOnly
                className="w-full px-4 py-3 pr-10 rounded-xl text-sm"
                style={{ background: "var(--bg-subtle)", border: "1px solid var(--border)", color: "var(--text-faint)", cursor: "not-allowed" }}
              />
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: "var(--text-faint)" }} />
            </div>
          </div>
        </div>
      </div>

      {/* Company */}
      <div className="rounded-2xl p-6" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
        <div className="flex items-center gap-3 mb-5">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg" style={{ background: "var(--bg-subtle)" }}>
            <Building2 className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Empresa</p>
            <p className="text-xs" style={{ color: "var(--text-faint)" }}>{isOwner ? "Dados da organização" : "Dados da organização (somente leitura)"}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: "var(--text-faint)" }}>
              Nome da empresa
            </label>
            <div className="relative">
              <input
                type="text"
                value={companyName}
                onChange={isOwner ? (e) => setCompanyName(e.target.value) : undefined}
                readOnly={!isOwner}
                placeholder="Minha Empresa Ltda"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{ background: "var(--bg-subtle)", border: "1px solid var(--border)", color: isOwner ? "var(--text-primary)" : "var(--text-faint)", cursor: isOwner ? "text" : "not-allowed" }}
                onFocus={isOwner ? (e) => (e.target.style.borderColor = "#00D084") : undefined}
                onBlur={isOwner ? (e) => (e.target.style.borderColor = "var(--border)") : undefined}
              />
              {!isOwner && <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: "var(--text-faint)" }} />}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: "var(--text-faint)" }}>
              Setor / Nicho
            </label>
            <div className="relative">
              <input
                type="text"
                value={niche}
                onChange={isOwner ? (e) => setNiche(e.target.value) : undefined}
                readOnly={!isOwner}
                placeholder="Ex: Agência, Academia..."
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{ background: "var(--bg-subtle)", border: "1px solid var(--border)", color: isOwner ? "var(--text-primary)" : "var(--text-faint)", cursor: isOwner ? "text" : "not-allowed" }}
                onFocus={isOwner ? (e) => (e.target.style.borderColor = "#00D084") : undefined}
                onBlur={isOwner ? (e) => (e.target.style.borderColor = "var(--border)") : undefined}
              />
              {!isOwner && <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: "var(--text-faint)" }} />}
            </div>
          </div>
        </div>
      </div>

      {/* Save */}
      <div className="flex items-center justify-between pt-2">
        <p className="text-xs" style={{ color: error ? "#FF4D4F" : saved ? "#00D084" : "var(--text-faint)" }}>
          {error || (saved ? "Alterações salvas com sucesso." : "")}
        </p>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-60"
          style={{ background: "#00D084", color: "var(--bg-page)" }}
        >
          {saving ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</>
          ) : saved ? (
            <><CheckCircle className="w-4 h-4" /> Salvo!</>
          ) : (
            <><Save className="w-4 h-4" /> Salvar alterações</>
          )}
        </button>
      </div>
    </div>
  )
}

function PlanUpgradeCard({
  targetPlan,
  features,
  price,
  label,
  badge,
  description,
  accentColor,
  loading,
  onUpgrade,
  error,
}: {
  targetPlan: "pro" | "premium"
  features: string[]
  price: number
  label: string
  badge?: string
  description: string
  accentColor: string
  loading: boolean
  onUpgrade: (p: "pro" | "premium") => void
  error: string
}) {
  return (
    <div id={`upgrade-${targetPlan}`} className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${accentColor}44` }}>
      <div className="px-6 py-5 flex items-center justify-between" style={{ background: `${accentColor}0d`, borderBottom: `1px solid ${accentColor}22` }}>
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl shrink-0" style={{ background: `${accentColor}1a` }}>
            {targetPlan === "premium"
              ? <Building2 className="w-5 h-5" style={{ color: accentColor }} />
              : <Crown className="w-5 h-5" style={{ color: accentColor }} />
            }
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-base font-black" style={{ color: "var(--text-primary)" }}>{label}</p>
              {badge && (
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider" style={{ background: accentColor, color: "var(--bg-page)" }}>
                  {badge}
                </span>
              )}
            </div>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>{description}</p>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-2xl font-black" style={{ color: accentColor }}>R${price}</p>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>por mês</p>
        </div>
      </div>
      <div className="px-6 py-5" style={{ background: "var(--bg-card)" }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-6">
          {features.map((f) => (
            <div key={f} className="flex items-center gap-2.5">
              <Sparkles className="w-3.5 h-3.5 shrink-0" style={{ color: accentColor }} />
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>{f}</span>
            </div>
          ))}
        </div>
        {error && (
          <p className="text-xs mb-3 text-center" style={{ color: "#FF4D4F" }}>{error}</p>
        )}
        <button
          onClick={() => onUpgrade(targetPlan)}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-all disabled:opacity-70"
          style={{ background: accentColor, color: "var(--bg-page)" }}
        >
          {loading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Redirecionando...</>
          ) : (
            <>{targetPlan === "premium" ? <Building2 className="w-4 h-4" /> : <Crown className="w-4 h-4" />} Fazer upgrade para {label} — R${price}/mês</>
          )}
        </button>
        <p className="text-center text-xs mt-2" style={{ color: "var(--text-faint)" }}>
          Cancele a qualquer momento. Sem taxa de cancelamento.
        </p>
      </div>
    </div>
  )
}

function PlanTab({ showUpgradedBanner }: { showUpgradedBanner: boolean }) {
  const { data: session } = useSession()
  const user = session?.user as { plan?: string; trialEndsAt?: string | null } | undefined
  const plan = user?.plan
  const isAdmin = plan === "admin"
  const isPremium = plan === "premium"
  const isPro = plan === "pro"
  const isFree = !isPro && !isPremium && !isAdmin
  const trialEndsAt = user?.trialEndsAt ?? null
  const isTrial = isPro && trialEndsAt !== null
  const trialDaysLeft = trialEndsAt
    ? Math.max(0, Math.ceil((new Date(trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0
  const [checkoutLoading, setCheckoutLoading] = useState<"pro" | "premium" | null>(null)
  const [checkoutError, setCheckoutError] = useState("")

  const handleUpgrade = async (targetPlan: "pro" | "premium") => {
    setCheckoutLoading(targetPlan)
    setCheckoutError("")
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: targetPlan }),
      })
      const data = await res.json() as { url?: string; error?: string }
      if (!res.ok || !data.url) {
        setCheckoutError(data.error ?? "Erro ao iniciar pagamento")
        return
      }
      window.location.href = data.url
    } catch {
      setCheckoutError("Erro ao iniciar pagamento. Tente novamente.")
    } finally {
      setCheckoutLoading(null)
    }
  }

  // Determina plano atual para exibição
  const currentPlanLabel = isAdmin ? "Admin" : isPremium ? "Plano Premium" : isPro ? "Plano Pro" : "Plano Grátis"
  const currentPlanDesc = isAdmin
    ? "Acesso total ao sistema"
    : isPremium
      ? "Análises ilimitadas · 50.000 transações · Multi-empresa · Webhooks"
      : isPro
        ? "Análises ilimitadas · 10.000 transações · PDF completo"
        : "1 análise/mês · 200 transações · Relatório básico"
  const currentPlanPrice = isAdmin ? "∞" : isPremium ? "R$297" : isPro ? "R$97" : "R$0"
  const currentPlanPriceLabel = isAdmin ? "acesso total" : isPremium || isPro ? "por mês" : "para sempre"
  const planColor = isAdmin ? "#3B82F6" : isPremium ? "#A855F7" : isPro ? "#F59E0B" : "#00D084"

  // Mostra card de upgrade para Pro quando: Free ou Pro em trial
  const showProCard = (isFree || isTrial) && !isAdmin
  // Mostra card de upgrade para Premium quando: Free, Pro (trial ou pago)
  const showPremiumCard = (isFree || isPro) && !isAdmin && !isPremium

  return (
    <div className="space-y-6">
      {/* Upgrade success banner */}
      {showUpgradedBanner && (
        <div className="flex items-center gap-3 p-4 rounded-xl" style={{ background: "rgba(0,208,132,0.08)", border: "1px solid rgba(0,208,132,0.25)" }}>
          <CheckCircle className="w-5 h-5 shrink-0" style={{ color: "#00D084" }} />
          <div>
            <p className="text-sm font-bold" style={{ color: "#00D084" }}>Upgrade realizado com sucesso!</p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>Seu novo plano está ativo. Aproveite todas as funcionalidades.</p>
          </div>
        </div>
      )}

      {/* Trial banner */}
      {isTrial && (
        <div className="flex items-start gap-3 p-4 rounded-xl" style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.25)" }}>
          <Zap className="w-5 h-5 shrink-0 mt-0.5" style={{ color: "#F59E0B" }} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold" style={{ color: "#F59E0B" }}>
              {trialDaysLeft > 0 ? `Trial Pro — ${trialDaysLeft} dia${trialDaysLeft !== 1 ? "s" : ""} restante${trialDaysLeft !== 1 ? "s" : ""}` : "Trial Pro — expira hoje"}
            </p>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
              Você está aproveitando todos os recursos Pro gratuitamente. Assine antes de expirar para não perder o acesso.
            </p>
          </div>
        </div>
      )}

      {/* Current plan banner */}
      <div
        className="rounded-2xl p-5 flex items-center gap-4"
        style={{ background: `${planColor}0d`, border: `1px solid ${planColor}2a` }}
      >
        <div className="flex items-center justify-center w-10 h-10 rounded-xl shrink-0" style={{ background: `${planColor}1a` }}>
          {isAdmin ? <Shield className="w-5 h-5" style={{ color: planColor }} />
            : isPremium ? <Building2 className="w-5 h-5" style={{ color: planColor }} />
            : isPro ? <Crown className="w-5 h-5" style={{ color: planColor }} />
            : <Zap className="w-5 h-5" style={{ color: planColor }} />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{currentPlanLabel}</p>
            <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold" style={{ background: `${planColor}20`, color: planColor }}>
              Plano atual
            </span>
          </div>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>{currentPlanDesc}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-lg font-black" style={{ color: "var(--text-primary)" }}>{currentPlanPrice}</p>
          <p className="text-xs" style={{ color: "var(--text-faint)" }}>{currentPlanPriceLabel}</p>
        </div>
      </div>

      {/* Comparativo de planos para free users */}
      {isFree && (
        <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
          <div className="px-5 py-4" style={{ background: "var(--bg-subtle)", borderBottom: "1px solid var(--border)" }}>
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>O que você está perdendo no plano Grátis</p>
          </div>
          <div className="overflow-x-auto">
            <div className="grid grid-cols-3 divide-x min-w-[360px]" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
              {[
                { label: "Uploads/mês", free: "1", pro: "Ilimitado", premium: "Ilimitado" },
                { label: "Transações", free: "200", pro: "10.000", premium: "50.000" },
                { label: "Empresas", free: "1", pro: "1", premium: "Até 3" },
                { label: "PDF", free: "—", pro: "✓", premium: "✓" },
                { label: "Webhooks", free: "—", pro: "—", premium: "✓" },
                { label: "Usuários", free: "1", pro: "1", premium: "Até 5" },
              ].map((row, i) => (
                <div key={i} className="contents">
                  <div className="px-4 py-2.5 col-span-1" style={{ borderBottom: "1px solid var(--border)" }}>
                    <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>{row.label}</p>
                  </div>
                  <div className="px-4 py-2.5 text-center" style={{ borderBottom: "1px solid var(--border)" }}>
                    <p className="text-xs" style={{ color: row.free === "—" ? "var(--text-faint)" : "var(--text-primary)" }}>{row.free}</p>
                  </div>
                  <div className="px-4 py-2.5 text-center" style={{ borderBottom: "1px solid var(--border)", background: "rgba(245,158,11,0.03)" }}>
                    <p className="text-xs font-medium" style={{ color: row.pro === "—" ? "var(--text-faint)" : "#F59E0B" }}>{row.pro}</p>
                  </div>
                  <div className="px-4 py-2.5 text-center" style={{ borderBottom: "1px solid var(--border)", background: "rgba(168,85,247,0.03)" }}>
                    <p className="text-xs font-medium" style={{ color: row.premium === "—" ? "var(--text-faint)" : "#A855F7" }}>{row.premium}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-4 px-0 min-w-[360px]" style={{ background: "var(--bg-card)" }}>
              <div className="px-4 py-3" />
              <div className="px-4 py-3 text-center">
                <p className="text-xs font-bold" style={{ color: "var(--text-faint)" }}>Grátis</p>
              </div>
              <div className="px-4 py-3 text-center" style={{ background: "rgba(245,158,11,0.03)" }}>
                <p className="text-xs font-bold" style={{ color: "#F59E0B" }}>Pro — R$97</p>
              </div>
              <div className="px-4 py-3 text-center" style={{ background: "rgba(168,85,247,0.03)" }}>
                <p className="text-xs font-bold" style={{ color: "#A855F7" }}>Premium — R$297</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Card upgrade Pro */}
      {showProCard && (
        <PlanUpgradeCard
          targetPlan="pro"
          features={PRO_FEATURES}
          price={97}
          label="Plano Pro"
          badge="Recomendado"
          description="Tudo que você precisa para dominar as finanças"
          accentColor="#F59E0B"
          loading={checkoutLoading === "pro"}
          onUpgrade={handleUpgrade}
          error={checkoutLoading === null ? checkoutError : ""}
        />
      )}

      {/* Card upgrade Premium */}
      {showPremiumCard && (
        <PlanUpgradeCard
          targetPlan="premium"
          features={PREMIUM_FEATURES}
          price={297}
          label="Plano Premium"
          badge={isPro && !isTrial ? "Upgrade" : undefined}
          description="Para empresas maiores ou múltiplos negócios"
          accentColor="#A855F7"
          loading={checkoutLoading === "premium"}
          onUpgrade={handleUpgrade}
          error={checkoutLoading === null ? checkoutError : ""}
        />
      )}

      {/* Billing history / Stripe Portal */}
      <div className="rounded-2xl p-6" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
        <p className="text-sm font-semibold mb-1" style={{ color: "var(--text-primary)" }}>Histórico de cobrança</p>
        <p className="text-xs mb-4" style={{ color: "var(--text-faint)" }}>
          {isPremium || (isPro && !isTrial)
            ? "Gerencie cobranças, altere cartão e cancele pelo portal seguro do Stripe."
            : "Nenhuma cobrança registrada no plano Grátis ou Trial."}
        </p>
        <div className="flex items-center gap-2 p-3 rounded-xl mb-4" style={{ background: "var(--bg-subtle)" }}>
          <CreditCard className="w-4 h-4 shrink-0" style={{ color: "var(--text-faint)" }} />
          <span className="text-xs" style={{ color: "var(--text-faint)" }}>
            {isPremium ? "Assinatura Premium ativa via Stripe" : isPro && !isTrial ? "Assinatura Pro ativa via Stripe" : "Nenhum método de pagamento cadastrado"}
          </span>
        </div>
        {(isPremium || (isPro && !isTrial)) && (
          <button
            onClick={async () => {
              const res = await fetch("/api/stripe/portal", { method: "POST" })
              const data = await res.json() as { url?: string; error?: string }
              if (data.url) window.open(data.url, "_blank")
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{ background: "var(--bg-subtle)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
            onMouseOver={(e) => (e.currentTarget.style.borderColor = "var(--border-hover)")}
            onMouseOut={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
          >
            <CreditCard className="w-4 h-4" style={{ color: "#00D084" }} />
            Gerenciar assinatura no Stripe →
          </button>
        )}
      </div>
    </div>
  )
}

function NotificationsTab() {
  const [toggles, setToggles] = useState({ leaks: true, alerts: true, weekly: false, tips: true, billing: true })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch("/api/account/notifications")
      .then(r => r.json())
      .then((d: { prefs?: typeof toggles }) => { if (d.prefs) setToggles(d.prefs) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const toggle = (key: keyof typeof toggles) => {
    const next = { ...toggles, [key]: !toggles[key] }
    setToggles(next)
    setSaved(false)
  }

  const handleSave = async () => {
    setSaving(true)
    await fetch("/api/account/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(toggles),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const items = [
    { key: "leaks" as const, label: "Novos vazamentos detectados", desc: "Notifica quando uma nova análise encontra vazamentos financeiros" },
    { key: "alerts" as const, label: "Alertas críticos", desc: "Avisos de caixa negativo, duplicatas e anomalias urgentes" },
    { key: "weekly" as const, label: "Resumo semanal", desc: "Relatório resumido toda segunda-feira com sua evolução financeira" },
    { key: "tips" as const, label: "Dicas e insights", desc: "Conteúdo personalizado para o seu tipo de negócio" },
    { key: "billing" as const, label: "Cobrança e plano", desc: "Notificações sobre renovação, upgrade e mudanças de plano" },
  ]

  return (
    <div className="space-y-4">
      <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
        <div className="px-6 py-4" style={{ background: "var(--bg-card)", borderBottom: "1px solid var(--border)" }}>
          <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Preferências de email</p>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-faint)" }}>Escolha quais notificações deseja receber</p>
        </div>
        <div style={{ background: "var(--bg-card)", opacity: loading ? 0.5 : 1 }}>
          {items.map((item, i) => (
            <div
              key={item.key}
              className="flex items-center justify-between px-6 py-4"
              style={{ borderBottom: i < items.length - 1 ? "1px solid var(--bg-subtle)" : "none" }}
            >
              <div className="flex-1 min-w-0 pr-4">
                <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{item.label}</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--text-faint)" }}>{item.desc}</p>
              </div>
              <button
                onClick={() => toggle(item.key)}
                disabled={loading}
                className="relative rounded-full transition-all duration-200 shrink-0"
                style={{ background: toggles[item.key] ? "#00D084" : "var(--border)", width: 40, height: 22 }}
              >
                <span
                  className="absolute top-0.5 rounded-full transition-all duration-200"
                  style={{ background: "#fff", width: 18, height: 18, left: toggles[item.key] ? 20 : 2 }}
                />
              </button>
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-end gap-3">
        {saved && <span className="text-xs" style={{ color: "#00D084" }}>✓ Preferências salvas</span>}
        <button
          onClick={handleSave}
          disabled={saving || loading}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
          style={{ background: "#00D084", color: "var(--bg-page)" }}
        >
          {saving ? "Salvando..." : "Salvar preferências"}
        </button>
      </div>
    </div>
  )
}

function FinancePinSection() {
  const [hasPin, setHasPin] = useState<boolean | null>(null)
  const [newPin, setNewPin] = useState("")
  const [confirmPin, setConfirmPin] = useState("")
  const [showPin, setShowPin] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [removing, setRemoving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    fetch("/api/app/finance/set-pin")
      .then(r => r.json())
      .then((d: { hasPin?: boolean }) => setHasPin(d.hasPin ?? false))
      .catch(() => setHasPin(false))
  }, [])

  const handleSave = async () => {
    setError("")
    if (!/^\d{4,8}$/.test(newPin)) { setError("PIN deve ter de 4 a 8 dígitos numéricos"); return }
    if (newPin !== confirmPin) { setError("Os PINs não coincidem"); return }
    setSaving(true)
    try {
      const res = await fetch("/api/app/finance/set-pin", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: newPin }),
      })
      const d = await res.json() as { error?: string }
      if (!res.ok) { setError(d.error ?? "Erro ao salvar PIN"); return }
      setHasPin(true)
      setNewPin("")
      setConfirmPin("")
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch { setError("Erro ao salvar PIN") }
    finally { setSaving(false) }
  }

  const handleRemove = async () => {
    setRemoving(true)
    try {
      await fetch("/api/app/finance/set-pin", { method: "DELETE" })
      setHasPin(false)
      setNewPin("")
      setConfirmPin("")
    } catch { /* ignore */ }
    finally { setRemoving(false) }
  }

  return (
    <div className="rounded-2xl p-6" style={{ background: "var(--bg-card)", border: "1px solid rgba(245,158,11,0.2)" }}>
      <div className="flex items-center gap-3 mb-5">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg" style={{ background: "rgba(245,158,11,0.1)" }}>
          <KeyRound className="w-4 h-4" style={{ color: "#F59E0B" }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>PIN de Acesso Financeiro</p>
          <p className="text-xs" style={{ color: "var(--text-faint)" }}>
            Contadores precisam digitar este PIN para visualizar dados de plano e integrações bancárias
          </p>
        </div>
        {hasPin !== null && (
          <span
            className="text-[10px] px-2 py-0.5 rounded-full font-semibold shrink-0"
            style={hasPin
              ? { background: "rgba(0,208,132,0.1)", color: "#00D084" }
              : { background: "rgba(139,143,168,0.1)", color: "var(--text-muted)" }}
          >
            {hasPin ? "Configurado" : "Não configurado"}
          </span>
        )}
      </div>

      <div className="space-y-3">
        {[
          { label: hasPin ? "Novo PIN" : "PIN (4–8 dígitos)", value: newPin, onChange: setNewPin },
          { label: "Confirmar PIN", value: confirmPin, onChange: setConfirmPin },
        ].map(({ label, value, onChange }) => (
          <div key={label}>
            <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: "var(--text-faint)" }}>{label}</label>
            <div className="relative">
              <input
                type={showPin ? "text" : "password"}
                inputMode="numeric"
                maxLength={8}
                value={value}
                onChange={(e) => { setError(""); onChange(e.target.value.replace(/\D/g, "")) }}
                placeholder="••••••"
                className="w-full px-4 py-3 pr-10 rounded-xl text-sm outline-none transition-all"
                style={{ background: "var(--bg-subtle)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                onFocus={(e) => (e.target.style.borderColor = "#F59E0B")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
              />
              <button
                type="button"
                onClick={() => setShowPin(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100"
                style={{ color: "var(--text-muted)" }}
              >
                {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mt-5 pt-5 flex-wrap gap-3" style={{ borderTop: "1px solid var(--bg-subtle)" }}>
        <p className="text-xs" style={{ color: error ? "#FF4D4F" : saved ? "#00D084" : "var(--text-faint)" }}>
          {error || (saved ? "PIN salvo com sucesso." : "Apenas números. Mínimo 4, máximo 8 dígitos.")}
        </p>
        <div className="flex items-center gap-2">
          {hasPin && (
            <button
              onClick={handleRemove}
              disabled={removing}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold disabled:opacity-60 transition-all"
              style={{ background: "rgba(255,77,79,0.1)", color: "#FF4D4F", border: "1px solid rgba(255,77,79,0.2)" }}
            >
              {removing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
              Remover PIN
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={saving || !newPin || !confirmPin}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold disabled:opacity-60 transition-all"
            style={{ background: "#F59E0B", color: "var(--bg-page)" }}
          >
            {saving ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Salvando...</> : (hasPin ? "Alterar PIN" : "Definir PIN")}
          </button>
        </div>
      </div>
    </div>
  )
}

function SecurityTab() {
  const { data: session } = useSession()
  const role = session?.user?.role ?? ""
  // canChangePassword: apenas owner pode alterar senha (alinhado com /api/app/password)
  const canChangePassword = role === "owner"
  // isOwner: owner e admin acessam zona de perigo e exportação LGPD
  const isOwner = role === "owner" || role === "admin"
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState("")
  // Delete account — multi-step: password → type EXCLUIR → confirm
  const [deleteStep, setDeleteStep] = useState<"idle" | "password" | "confirm" | "final">("idle")
  const [deletePassword, setDeletePassword] = useState("")
  const [deleteConfirm, setDeleteConfirm] = useState("")
  const [deleteError, setDeleteError] = useState("")
  const [deleting, setDeleting] = useState(false)

  const handleSave = async () => {
    setError("")
    if (newPassword !== confirmPassword) {
      setError("As senhas não coincidem")
      return
    }
    setSaving(true)
    try {
      const res = await fetch("/api/app/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      const d = await res.json() as { error?: string }
      if (!res.ok) {
        setError(d.error ?? "Erro ao alterar senha")
      } else {
        setSaved(true)
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
        setTimeout(() => setSaved(false), 2500)
      }
    } catch {
      setError("Erro ao alterar senha")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Change password — owner only */}
      {canChangePassword && (
        <div className="rounded-2xl p-6" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <div className="flex items-center gap-3 mb-5">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg" style={{ background: "var(--bg-subtle)" }}>
              <KeyRound className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Alterar senha</p>
              <p className="text-xs" style={{ color: "var(--text-faint)" }}>Recomendamos uma senha forte com letras, números e símbolos</p>
            </div>
          </div>
          <div className="space-y-3">
            {[
              { label: "Senha atual", value: currentPassword, onChange: setCurrentPassword },
              { label: "Nova senha", value: newPassword, onChange: setNewPassword },
              { label: "Confirmar nova senha", value: confirmPassword, onChange: setConfirmPassword },
            ].map(({ label, value, onChange }) => (
              <div key={label}>
                <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: "var(--text-faint)" }}>
                  {label}
                </label>
                <input
                  type="password"
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                  style={{ background: "var(--bg-subtle)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                  onFocus={(e) => (e.target.style.borderColor = "#00D084")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                />
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between mt-5 pt-5" style={{ borderTop: "1px solid var(--bg-subtle)" }}>
            <p className="text-xs" style={{ color: error ? "#FF4D4F" : saved ? "#00D084" : "var(--text-faint)" }}>
              {error || (saved ? "Senha alterada com sucesso." : "Use no mínimo 8 caracteres.")}
            </p>
            <button
              onClick={handleSave}
              disabled={saving || !currentPassword || !newPassword || !confirmPassword}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-60"
              style={{ background: "#00D084", color: "var(--bg-page)" }}
            >
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</> : "Atualizar senha"}
            </button>
          </div>
        </div>
      )}

      {/* Finance PIN — owner only */}
      {can(role, "finance:manage") && <FinancePinSection />}

      {/* Sessions */}
      <div className="rounded-2xl p-6" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
        <p className="text-sm font-semibold mb-1" style={{ color: "var(--text-primary)" }}>Sessões ativas</p>
        <p className="text-xs mb-4" style={{ color: "var(--text-faint)" }}>Dispositivos com sessão aberta na sua conta</p>
        <div className="flex items-center gap-3 p-3.5 rounded-xl" style={{ background: "var(--bg-subtle)" }}>
          <div className="w-2 h-2 rounded-full shrink-0" style={{ background: "#00D084" }} />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>Este dispositivo</p>
            <p className="text-xs" style={{ color: "var(--text-faint)" }}>Navegador web · Agora</p>
          </div>
          <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: "rgba(0,208,132,0.1)", color: "#00D084" }}>
            Atual
          </span>
        </div>
      </div>

      {/* LGPD — Dados pessoais (somente proprietário pode exportar dados da organização) */}
      {isOwner && (
        <div className="rounded-2xl p-6" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <p className="text-sm font-semibold mb-1" style={{ color: "var(--text-primary)" }}>Seus dados (LGPD)</p>
          <p className="text-xs mb-4" style={{ color: "var(--text-faint)" }}>
            Conforme a Lei Geral de Proteção de Dados, você pode exportar ou excluir todos os seus dados a qualquer momento.
          </p>
          <a
            href="/api/account/export"
            download
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all"
            style={{ background: "var(--bg-subtle)", color: "var(--text-muted)", border: "1px solid var(--border)", display: "inline-flex" }}
          >
            <Save className="w-3.5 h-3.5" />
            Exportar todos os meus dados (.json)
          </a>
        </div>
      )}

      {/* Danger zone — owner only */}
      {isOwner && (
        <div className="rounded-2xl p-6" style={{ background: "var(--bg-card)", border: "1px solid rgba(255,77,79,0.2)" }}>
          <div className="flex items-start gap-3 mb-4">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "#FF4D4F" }} />
            <div>
              <p className="text-sm font-semibold" style={{ color: "#FF4D4F" }}>Zona de perigo</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                Excluir a conta remove permanentemente todos os dados, análises, equipe e histórico da organização. Ação irreversível.
              </p>
            </div>
          </div>

          {deleteStep === "idle" && (
            <button
              onClick={() => setDeleteStep("password")}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all"
              style={{ background: "rgba(255,77,79,0.08)", color: "#FF4D4F", border: "1px solid rgba(255,77,79,0.2)" }}
            >
              <AlertTriangle className="w-3.5 h-3.5" /> Iniciar processo de exclusão
            </button>
          )}

          {deleteStep === "password" && (
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-faint)" }}>
                Etapa 1 de 2 — Confirme sua senha
              </p>
              <input
                type="password"
                value={deletePassword}
                onChange={(e) => { setDeletePassword(e.target.value); setDeleteError("") }}
                placeholder="Sua senha atual"
                autoFocus
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                style={{ background: "var(--bg-subtle)", border: `1px solid ${deleteError ? "#FF4D4F" : "rgba(255,77,79,0.2)"}`, color: "var(--text-primary)" }}
              />
              {deleteError && <p className="text-xs" style={{ color: "#FF4D4F" }}>{deleteError}</p>}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setDeleteStep("idle"); setDeletePassword(""); setDeleteError("") }}
                  className="px-4 py-2 rounded-xl text-xs font-medium"
                  style={{ background: "var(--bg-subtle)", color: "var(--text-muted)" }}
                >
                  Cancelar
                </button>
                <button
                  disabled={!deletePassword}
                  onClick={() => {
                    if (!deletePassword) return
                    setDeleteStep("confirm")
                    setDeleteError("")
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold disabled:opacity-50"
                  style={{ background: "rgba(255,77,79,0.12)", color: "#FF4D4F", border: "1px solid rgba(255,77,79,0.3)" }}
                >
                  Continuar
                </button>
              </div>
            </div>
          )}

          {deleteStep === "confirm" && (
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-faint)" }}>
                Etapa 2 de 2 — Digite EXCLUIR para confirmar
              </p>
              <input
                type="text"
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                placeholder="EXCLUIR"
                autoFocus
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                style={{ background: "var(--bg-subtle)", border: "1px solid rgba(255,77,79,0.2)", color: "var(--text-primary)" }}
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setDeleteStep("idle"); setDeletePassword(""); setDeleteConfirm(""); setDeleteError("") }}
                  className="px-4 py-2 rounded-xl text-xs font-medium"
                  style={{ background: "var(--bg-subtle)", color: "var(--text-muted)" }}
                >
                  Cancelar
                </button>
                {deleteConfirm === "EXCLUIR" && (
                  <button
                    disabled={deleting}
                    onClick={async () => {
                      setDeleting(true)
                      setDeleteError("")
                      try {
                        const res = await fetch("/api/account", {
                          method: "DELETE",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ password: deletePassword }),
                        })
                        const d = await res.json() as { error?: string }
                        if (!res.ok) {
                          setDeleteError(d.error ?? "Erro ao excluir conta")
                          setDeleteStep("password")
                          setDeletePassword("")
                          setDeleteConfirm("")
                          setDeleting(false)
                          return
                        }
                        window.location.href = "/login"
                      } catch {
                        setDeleteError("Erro ao excluir conta. Tente novamente.")
                        setDeleting(false)
                      }
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all disabled:opacity-60"
                    style={{ background: "rgba(255,77,79,0.15)", color: "#FF4D4F", border: "1px solid rgba(255,77,79,0.35)" }}
                  >
                    {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                    {deleting ? "Excluindo..." : "Excluir conta permanentemente"}
                  </button>
                )}
              </div>
              {deleteError && <p className="text-xs" style={{ color: "#FF4D4F" }}>{deleteError}</p>}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const SUPPORTED_BANKS = [
  { name: "Nubank", color: "#820AD1" },
  { name: "Itaú", color: "#FF6600" },
  { name: "Bradesco", color: "#CC092F" },
  { name: "Santander", color: "#EC0000" },
  { name: "Banco do Brasil", color: "#F9CF00" },
  { name: "Caixa Econômica", color: "#0070AF" },
  { name: "Inter", color: "#FF7A00" },
  { name: "C6 Bank", color: "#1A1A1A" },
]

interface BankConnection {
  id: string
  pluggyItemId: string
  bankName: string
  status: string
  lastSyncAt: string | null
}

const WEBHOOK_EVENTS = [
  { key: "leak_detected", label: "Novo vazamento detectado" },
  { key: "critical_alert", label: "Alerta crítico" },
  { key: "analysis_done", label: "Análise concluída" },
  { key: "score_changed", label: "Score alterado" },
]

function IntegrationTab() {
  const { data: session } = useSession()
  const plan = (session?.user as { plan?: string } | undefined)?.plan
  const isPremium = plan === "premium" || plan === "admin"
  const [webhookUrl, setWebhookUrl] = useState("")
  const [webhookEvents, setWebhookEvents] = useState<Set<string>>(new Set(["analysis_done", "critical_alert"]))
  const [webhookSaved, setWebhookSaved] = useState(false)

  // Bank connections state
  const [connections, setConnections] = useState<BankConnection[]>([])
  const [connectingBank, setConnectingBank] = useState<string | null>(null)
  const [activeConnectToken, setActiveConnectToken] = useState<string | null>(null)
  const [disconnecting, setDisconnecting] = useState<string | null>(null)
  const [syncing, setSyncing] = useState<string | null>(null)
  const [bankError, setBankError] = useState<string | null>(null)
  const [bankSyncInfo, setBankSyncInfo] = useState<string | null>(null)
  const [pluggyConfigured, setPluggyConfigured] = useState(true)

  useEffect(() => {
    fetch("/api/app/bank/connections")
      .then(r => r.json())
      .then(d => setConnections(d.connections ?? []))
      .catch(() => null)
  }, [])

  const normalize = (s: string) =>
    s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()

  const isConnected = (bankName: string) =>
    connections.some(c => normalize(c.bankName).includes(normalize(bankName)) && c.status !== "disconnected")

  const getConnection = (bankName: string) =>
    connections.find(c => normalize(c.bankName).includes(normalize(bankName)) && c.status !== "disconnected")

  // Banks connected in DB that don't match any SUPPORTED_BANKS entry
  const unrecognizedConnections = connections.filter(
    c => c.status !== "disconnected" && !SUPPORTED_BANKS.some(b => normalize(c.bankName).includes(normalize(b.name)))
  )

  const handleConnect = async (bankName: string) => {
    setBankError(null)
    setConnectingBank(bankName)

    try {
      const res = await fetch("/api/app/bank/connect-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      })

      if (res.status === 503) {
        setPluggyConfigured(false)
        setBankError("Credenciais Pluggy não configuradas. Adicione PLUGGY_CLIENT_ID e PLUGGY_CLIENT_SECRET no .env.")
        setConnectingBank(null)
        return
      }

      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error ?? "Erro ao conectar banco")
      }

      const { connectToken } = await res.json()
      setActiveConnectToken(connectToken)
    } catch (err) {
      setBankError(err instanceof Error ? err.message : "Erro desconhecido")
      setConnectingBank(null)
    }
  }

  const handlePluggySuccess = async (itemData: { item: { id: string; connector: { id: number; name: string } } }) => {
    const itemId = itemData.item.id
    const bankName = itemData.item.connector.name

    setActiveConnectToken(null)

    const saveRes = await fetch("/api/app/bank/connections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId, bankName }),
    })

    if (saveRes.ok) {
      const { connection } = await saveRes.json()
      setConnections(prev => [...prev.filter(c => c.pluggyItemId !== itemId), connection])
      setBankSyncInfo("Banco conectado! Sincronizando transações em background — os dados aparecerão no Dashboard em alguns instantes.")
      setTimeout(() => setBankSyncInfo(null), 8000)
    }

    setConnectingBank(null)
  }

  const handlePluggyClose = () => {
    setActiveConnectToken(null)
    setConnectingBank(null)
  }

  const handleDisconnect = async (bankName: string) => {
    const conn = getConnection(bankName)
    if (!conn) return
    await disconnectConnection(conn)
  }

  const disconnectConnection = async (conn: BankConnection) => {
    setDisconnecting(conn.pluggyItemId)
    const res = await fetch(`/api/app/bank/connections/${conn.pluggyItemId}`, { method: "DELETE" })
    if (res.ok) {
      setConnections(prev => prev.filter(c => c.pluggyItemId !== conn.pluggyItemId))
    }
    setDisconnecting(null)
  }

  const handleSync = async (conn: BankConnection) => {
    setSyncing(conn.pluggyItemId)
    setBankError(null)
    try {
      const res = await fetch(`/api/app/bank/sync/${conn.pluggyItemId}`, { method: "POST" })
      const d = await res.json() as { imported?: number; skipped?: number; error?: string }
      if (!res.ok) throw new Error(d.error ?? "Sync failed")
      setBankSyncInfo(`Sync concluído: ${d.imported ?? 0} transações importadas${d.skipped ? `, ${d.skipped} já existentes` : ""}. Os dados aparecerão no Dashboard em instantes.`)
      setTimeout(() => setBankSyncInfo(null), 8000)
      // Refresh connection list to get updated lastSyncAt
      fetch("/api/app/bank/connections").then(r => r.json()).then(data => setConnections(data.connections ?? [])).catch(() => null)
    } catch (err) {
      setBankError(err instanceof Error ? err.message : "Erro ao sincronizar")
    } finally {
      setSyncing(null)
    }
  }

  const toggleEvent = (key: string) =>
    setWebhookEvents(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })

  const handleSaveWebhook = () => {
    // TODO: save to API
    setWebhookSaved(true)
    setTimeout(() => setWebhookSaved(false), 2500)
  }

  return (
    <div className="space-y-6">
      {/* Open Finance */}
      <div className="relative">
      {/* "Em Breve" overlay */}
      <div className="absolute inset-0 z-10 rounded-2xl flex flex-col items-center justify-center gap-3 backdrop-blur-sm" style={{ background: "var(--bg-page-overlay)" }}>
        <div className="flex flex-col items-center gap-2 px-4 text-center">
          <span className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full" style={{ background: "rgba(59,130,246,0.15)", color: "#3B82F6", border: "1px solid rgba(59,130,246,0.3)" }}>Em Breve</span>
          <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Open Finance em desenvolvimento</p>
          <p className="text-xs max-w-xs" style={{ color: "var(--text-faint)" }}>As conexões bancárias automáticas estarão disponíveis nas próximas atualizações.</p>
        </div>
      </div>
      <div className="rounded-2xl p-6 pointer-events-none select-none" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
        <div className="flex items-start gap-3 mb-5">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl shrink-0" style={{ background: "var(--bg-subtle)" }}>
            <Plug className="w-4 h-4" style={{ color: "#3B82F6" }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Open Finance & Conexões Bancárias</p>
              {connections.length > 0 && (
                <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{ background: "rgba(0,208,132,0.15)", color: "#00D084" }}>
                  {connections.length} conectado{connections.length > 1 ? "s" : ""}
                </span>
              )}
            </div>
            <p className="text-xs" style={{ color: "var(--text-faint)" }}>
              Conecte sua conta bancária para análises automáticas sem precisar fazer upload manual de extratos.
            </p>
          </div>
        </div>

        {bankSyncInfo && (
          <div className="flex items-start gap-2 mb-4 px-3 py-2.5 rounded-xl text-xs" style={{ background: "rgba(0,208,132,0.08)", border: "1px solid rgba(0,208,132,0.25)", color: "#00D084" }}>
            <CheckCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span>{bankSyncInfo}</span>
          </div>
        )}

        {bankError && (
          <div className="flex items-start gap-2 mb-4 px-3 py-2.5 rounded-xl text-xs" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#F87171" }}>
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span>{bankError}</span>
          </div>
        )}

        {!pluggyConfigured && (
          <div className="flex items-start gap-2 mb-4 px-3 py-2.5 rounded-xl text-xs" style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", color: "#F59E0B" }}>
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span>Configure as variáveis <strong>PLUGGY_CLIENT_ID</strong> e <strong>PLUGGY_CLIENT_SECRET</strong> no seu ambiente para ativar as conexões bancárias via Open Finance.</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Connected banks from DB that don't match SUPPORTED_BANKS */}
          {unrecognizedConnections.map(conn => {
            const isDisconnecting = disconnecting === conn.pluggyItemId
            const isSyncing = syncing === conn.pluggyItemId
            return (
              <div
                key={conn.pluggyItemId}
                className="flex items-center justify-between px-4 py-3 rounded-xl transition-all"
                style={{ background: "rgba(0,208,132,0.05)", border: "1px solid rgba(0,208,132,0.25)" }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black"
                    style={{ background: "#3B82F622", color: "#3B82F6" }}
                  >
                    {conn.bankName.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{conn.bankName}</span>
                    {conn.lastSyncAt && (
                      <p className="text-[10px]" style={{ color: "var(--text-faint)" }}>
                        Sync {new Date(conn.lastSyncAt).toLocaleDateString("pt-BR")}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-semibold flex items-center gap-1" style={{ color: "#00D084" }}>
                    <CheckCircle className="w-3 h-3" />
                    Conectado
                  </span>
                  <button
                    onClick={() => handleSync(conn)}
                    disabled={isSyncing || !!syncing}
                    className="p-1 rounded-lg transition-all hover:opacity-80"
                    style={{ color: "#3B82F6" }}
                    title="Sincronizar agora"
                  >
                    {isSyncing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => disconnectConnection(conn)}
                    disabled={isDisconnecting}
                    className="p-1 rounded-lg transition-all hover:opacity-80"
                    style={{ color: "#EF4444" }}
                    title="Desconectar"
                  >
                    {isDisconnecting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Unlink className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            )
          })}

          {SUPPORTED_BANKS.map(bank => {
            const Logo = BANK_LOGOS[bank.name]
            const connected = isConnected(bank.name)
            const conn = getConnection(bank.name)
            const isConnecting = connectingBank === bank.name
            const isDisconnecting = disconnecting === conn?.pluggyItemId
            const isSyncing = syncing === conn?.pluggyItemId

            return (
              <div
                key={bank.name}
                className="flex items-center justify-between px-4 py-3 rounded-xl transition-all"
                style={{
                  background: connected ? "rgba(0,208,132,0.05)" : "var(--bg-subtle)",
                  border: connected ? "1px solid rgba(0,208,132,0.25)" : "1px solid var(--border)",
                }}
              >
                <div className="flex items-center gap-3">
                  {Logo ? (
                    <Logo size={28} />
                  ) : (
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black"
                      style={{ background: bank.color + "22", color: bank.color }}
                    >
                      {bank.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{bank.name}</span>
                    {connected && conn?.lastSyncAt && (
                      <p className="text-[10px]" style={{ color: "var(--text-faint)" }}>
                        Sync {new Date(conn.lastSyncAt).toLocaleDateString("pt-BR")}
                      </p>
                    )}
                  </div>
                </div>

                {connected ? (
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold flex items-center gap-1" style={{ color: "#00D084" }}>
                      <CheckCircle className="w-3 h-3" />
                      Conectado
                    </span>
                    {conn && (
                      <button
                        onClick={() => handleSync(conn)}
                        disabled={isSyncing || !!syncing}
                        className="p-1 rounded-lg transition-all hover:opacity-80"
                        style={{ color: "#3B82F6" }}
                        title="Sincronizar agora"
                      >
                        {isSyncing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                      </button>
                    )}
                    <button
                      onClick={() => handleDisconnect(bank.name)}
                      disabled={isDisconnecting}
                      className="p-1 rounded-lg transition-all hover:opacity-80"
                      style={{ color: "#EF4444" }}
                      title="Desconectar"
                    >
                      {isDisconnecting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Unlink className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleConnect(bank.name)}
                    disabled={isConnecting || connectingBank !== null}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-semibold transition-all disabled:opacity-50"
                    style={{ background: "#00D084", color: "var(--bg-page)" }}
                  >
                    {isConnecting ? (
                      <><Loader2 className="w-3 h-3 animate-spin" />Conectando...</>
                    ) : (
                      <><Link2 className="w-3 h-3" />Conectar</>
                    )}
                  </button>
                )}
              </div>
            )
          })}
        </div>

        <p className="text-xs mt-4 flex items-center gap-1.5" style={{ color: "var(--text-faint)" }}>
          <Shield className="w-3 h-3 shrink-0" />
          Integração via Pluggy.ai (Open Finance) — seus dados bancários nunca são armazenados em nossos servidores
        </p>
      </div>
      </div>{/* end overlay wrapper */}

      {/* Pluggy Connect widget — rendered when user clicks Conectar */}
      {activeConnectToken && (
        <PluggyConnect
          connectToken={activeConnectToken}
          includeSandbox={true}
          onSuccess={handlePluggySuccess}
          onError={(err) => {
            setBankError(err.message ?? "Erro ao conectar")
            handlePluggyClose()
          }}
          onClose={handlePluggyClose}
        />
      )}

      {/* Webhooks */}
      <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
        <div className="flex items-center justify-between px-6 py-4" style={{ background: "var(--bg-card)", borderBottom: "1px solid var(--border)" }}>
          <div className="flex items-center gap-3">
            <Webhook className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
            <div>
              <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Webhooks</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-faint)" }}>
                Receba notificações em tempo real no seu sistema ou Slack
              </p>
            </div>
          </div>
          {!isPremium && (
            <span className="text-[10px] px-2 py-1 rounded-full font-semibold shrink-0" style={{ background: "rgba(245,158,11,0.15)", color: "#F59E0B" }}>
              Premium
            </span>
          )}
        </div>

        <div className="px-6 py-5" style={{ background: "var(--bg-card)" }}>
          {!isPremium ? (
            <div className="text-center py-4">
              <p className="text-sm font-medium mb-1" style={{ color: "var(--text-muted)" }}>Apenas para usuários Premium</p>
              <p className="text-xs mb-4" style={{ color: "var(--text-faint)" }}>
                Configure webhooks para receber notificações em tempo real no seu sistema ou Slack.
              </p>
              <button
                onClick={() => {}}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold"
                style={{ background: "#F59E0B", color: "var(--bg-page)" }}
              >
                <Crown className="w-3.5 h-3.5" />
                Fazer upgrade para Premium
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* URL input */}
              <div>
                <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: "var(--text-faint)" }}>
                  URL do Webhook
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={webhookUrl}
                    onChange={e => setWebhookUrl(e.target.value)}
                    placeholder="https://seu-sistema.com/webhook"
                    className="flex-1 px-4 py-3 rounded-xl text-sm outline-none transition-all"
                    style={{ background: "var(--bg-subtle)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                    onFocus={e => (e.target.style.borderColor = "#00D084")}
                    onBlur={e => (e.target.style.borderColor = "var(--border)")}
                  />
                  <button
                    onClick={handleSaveWebhook}
                    disabled={!webhookUrl}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                    style={{ background: "#00D084", color: "var(--bg-page)" }}
                  >
                    {webhookSaved ? <CheckCircle className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                    {webhookSaved ? "Salvo!" : "Adicionar"}
                  </button>
                </div>
              </div>

              {/* Events */}
              <div>
                <p className="text-xs font-semibold mb-3 uppercase tracking-wider" style={{ color: "var(--text-faint)" }}>
                  Eventos para assinar
                </p>
                <div className="space-y-2">
                  {WEBHOOK_EVENTS.map(event => (
                    <label key={event.key} className="flex items-center gap-3 cursor-pointer group">
                      <div
                        className="w-4 h-4 rounded flex items-center justify-center shrink-0 transition-all"
                        style={{
                          background: webhookEvents.has(event.key) ? "#00D084" : "var(--bg-subtle)",
                          border: webhookEvents.has(event.key) ? "1px solid #00D084" : "1px solid var(--border)",
                        }}
                        onClick={() => toggleEvent(event.key)}
                      >
                        {webhookEvents.has(event.key) && (
                          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                            <path d="M1 4L3.5 6.5L9 1" stroke="var(--bg-page)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                      <span className="text-sm" style={{ color: "var(--text-primary)" }}>{event.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function SettingsContent() {
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const router = useRouter()
  const role = (session?.user?.role ?? "") as string
  const plan = (session?.user as { plan?: string } | undefined)?.plan ?? "free"
  const isOnPaidPlan = plan === "pro" || plan === "premium" || plan === "admin"

  // Filter tabs by permission
  const visibleTabs = TABS.filter(tab => can(role, tab.permission))

  // Default tab: first visible
  const defaultTab = (searchParams.get("upgraded") === "true"
    ? "plan"
    : visibleTabs[0]?.id ?? "profile") as Tab

  const [activeTab, setActiveTab] = useState<Tab>(defaultTab)
  const showUpgradedBanner = searchParams.get("upgraded") === "true"

  // Redirect if no visible tabs
  useEffect(() => {
    if (session && visibleTabs.length === 0) {
      router.replace("/app/dashboard")
    }
    // If active tab is no longer visible, switch to first visible
    if (!visibleTabs.find(t => t.id === activeTab) && visibleTabs.length > 0) {
      setActiveTab(visibleTabs[0]!.id)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, session])

  const content: Record<Tab, React.ReactNode> = {
    profile: <ProfileTab />,
    plan: <FinanceGuard><PlanTab showUpgradedBanner={showUpgradedBanner} /></FinanceGuard>,
    notifications: <NotificationsTab />,
    security: <SecurityTab />,
    integracoes: <FinanceGuard><IntegrationTab /></FinanceGuard>,
  }

  const sidebarWidget = plan === "premium" || plan === "admin"
    ? null
    : plan === "pro"
      ? {
          icon: <Building2 className="w-5 h-5 mb-2" style={{ color: "#A855F7" }} />,
          title: "Upgrade para Premium",
          desc: "Multi-empresa, 50k transações e webhooks.",
          color: "#A855F7",
          bg: "rgba(168,85,247,0.06)",
          border: "1px solid rgba(168,85,247,0.2)",
        }
      : {
          icon: <Crown className="w-5 h-5 mb-2" style={{ color: "#F59E0B" }} />,
          title: "Upgrade para Pro",
          desc: "Análises ilimitadas e relatórios PDF.",
          color: "#F59E0B",
          bg: "rgba(245,158,11,0.06)",
          border: "1px solid rgba(245,158,11,0.15)",
        }

  return (
    <div className="px-4 sm:px-6 py-6 sm:py-8">
      <div className="flex items-start gap-3 mb-8">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl shrink-0 mt-0.5"
          style={{ background: "rgba(0,208,132,0.08)", border: "1px solid rgba(0,208,132,0.18)" }}>
          <User className="w-5 h-5" style={{ color: "#00D084" }} />
        </div>
        <div>
          <h1 className="text-2xl font-black" style={{ color: "var(--text-primary)" }}>Configurações</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>Gerencie sua conta, plano e preferências</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-6 sm:gap-8">
        {/* Sidebar nav */}
        <aside className="w-full sm:w-52 sm:shrink-0">
          <nav className="space-y-1">
            {visibleTabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group"
                style={{
                  background: activeTab === id ? "rgba(0,208,132,0.08)" : "transparent",
                  border: activeTab === id ? "1px solid rgba(0,208,132,0.15)" : "1px solid transparent",
                  color: activeTab === id ? "#00D084" : "var(--text-muted)",
                }}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 shrink-0" />
                  {label}
                </div>
                <ChevronRight
                  className="w-3.5 h-3.5 transition-transform"
                  style={{ opacity: activeTab === id ? 1 : 0, color: "#00D084" }}
                />
              </button>
            ))}
          </nav>

          {sidebarWidget && (
            <div className="mt-6 p-4 rounded-2xl" style={{ background: sidebarWidget.bg, border: sidebarWidget.border }}>
              {sidebarWidget.icon}
              <p className="text-xs font-bold mb-1" style={{ color: "var(--text-primary)" }}>{sidebarWidget.title}</p>
              <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>{sidebarWidget.desc}</p>
              <button
                onClick={() => setActiveTab("plan")}
                className="w-full py-2 rounded-lg text-xs font-bold"
                style={{ background: sidebarWidget.color, color: "var(--bg-page)" }}
              >
                Ver planos
              </button>
            </div>
          )}

          {isOnPaidPlan && plan !== "admin" && (
            <div className="mt-4 px-2">
              <p className="text-xs text-center" style={{ color: "var(--text-faint)" }}>
                Gerencie sua assinatura no{" "}
                <a href="https://billing.stripe.com" target="_blank" rel="noopener noreferrer" style={{ color: "#00D084" }}>
                  portal Stripe
                </a>
              </p>
            </div>
          )}
        </aside>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {content[activeTab]}
        </div>
      </div>
    </div>
  )
}

export default function SettingsPage() {
  return (
    <AccessGuard permission="settings:profile">
      <Suspense fallback={<div className="px-6 py-8"><Loader2 className="w-5 h-5 animate-spin" style={{ color: "#00D084" }} /></div>}>
        <SettingsContent />
      </Suspense>
    </AccessGuard>
  )
}
