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
  Plug, Webhook, Plus, Eye, EyeOff,
} from "lucide-react"
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
      <div className="rounded-2xl p-6" style={{ background: "#1A1D27", border: "1px solid #2A2D3A" }}>
        <div className="flex items-center gap-4 mb-6 pb-6" style={{ borderBottom: "1px solid #2A2D3A" }}>
          <div
            className="flex items-center justify-center w-16 h-16 rounded-2xl text-xl font-black shrink-0"
            style={{ background: "rgba(0,208,132,0.12)", border: "2px solid rgba(0,208,132,0.25)", color: "#00D084" }}
          >
            {initials || <User className="w-7 h-7" />}
          </div>
          <div>
            <p className="text-base font-bold" style={{ color: "#F4F4F5" }}>{name || "Seu nome"}</p>
            <p className="text-sm" style={{ color: "#8B8FA8" }}>{session?.user?.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: "#4B4F6A" }}>
              Nome completo
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
              style={{ background: "#212435", border: "1px solid #2A2D3A", color: "#F4F4F5" }}
              onFocus={(e) => (e.target.style.borderColor = "#00D084")}
              onBlur={(e) => (e.target.style.borderColor = "#2A2D3A")}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: "#4B4F6A" }}>
              Email
            </label>
            <div className="relative">
              <input
                type="email"
                value={session?.user?.email ?? ""}
                readOnly
                className="w-full px-4 py-3 pr-10 rounded-xl text-sm"
                style={{ background: "#212435", border: "1px solid #2A2D3A", color: "#4B4F6A", cursor: "not-allowed" }}
              />
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: "#4B4F6A" }} />
            </div>
          </div>
        </div>
      </div>

      {/* Company */}
      <div className="rounded-2xl p-6" style={{ background: "#1A1D27", border: "1px solid #2A2D3A" }}>
        <div className="flex items-center gap-3 mb-5">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg" style={{ background: "#212435" }}>
            <Building2 className="w-4 h-4" style={{ color: "#8B8FA8" }} />
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: "#F4F4F5" }}>Empresa</p>
            <p className="text-xs" style={{ color: "#4B4F6A" }}>{isOwner ? "Dados da organização" : "Dados da organização (somente leitura)"}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: "#4B4F6A" }}>
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
                style={{ background: "#212435", border: "1px solid #2A2D3A", color: isOwner ? "#F4F4F5" : "#4B4F6A", cursor: isOwner ? "text" : "not-allowed" }}
                onFocus={isOwner ? (e) => (e.target.style.borderColor = "#00D084") : undefined}
                onBlur={isOwner ? (e) => (e.target.style.borderColor = "#2A2D3A") : undefined}
              />
              {!isOwner && <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: "#4B4F6A" }} />}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: "#4B4F6A" }}>
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
                style={{ background: "#212435", border: "1px solid #2A2D3A", color: isOwner ? "#F4F4F5" : "#4B4F6A", cursor: isOwner ? "text" : "not-allowed" }}
                onFocus={isOwner ? (e) => (e.target.style.borderColor = "#00D084") : undefined}
                onBlur={isOwner ? (e) => (e.target.style.borderColor = "#2A2D3A") : undefined}
              />
              {!isOwner && <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: "#4B4F6A" }} />}
            </div>
          </div>
        </div>
      </div>

      {/* Save */}
      <div className="flex items-center justify-between pt-2">
        <p className="text-xs" style={{ color: error ? "#FF4D4F" : saved ? "#00D084" : "#4B4F6A" }}>
          {error || (saved ? "Alterações salvas com sucesso." : "")}
        </p>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-60"
          style={{ background: "#00D084", color: "#0F1117" }}
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
              <p className="text-base font-black" style={{ color: "#F4F4F5" }}>{label}</p>
              {badge && (
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider" style={{ background: accentColor, color: "#0F1117" }}>
                  {badge}
                </span>
              )}
            </div>
            <p className="text-xs" style={{ color: "#8B8FA8" }}>{description}</p>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-2xl font-black" style={{ color: accentColor }}>R${price}</p>
          <p className="text-xs" style={{ color: "#8B8FA8" }}>por mês</p>
        </div>
      </div>
      <div className="px-6 py-5" style={{ background: "#1A1D27" }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-6">
          {features.map((f) => (
            <div key={f} className="flex items-center gap-2.5">
              <Sparkles className="w-3.5 h-3.5 shrink-0" style={{ color: accentColor }} />
              <span className="text-xs" style={{ color: "#8B8FA8" }}>{f}</span>
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
          style={{ background: accentColor, color: "#0F1117" }}
        >
          {loading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Redirecionando...</>
          ) : (
            <>{targetPlan === "premium" ? <Building2 className="w-4 h-4" /> : <Crown className="w-4 h-4" />} Fazer upgrade para {label} — R${price}/mês</>
          )}
        </button>
        <p className="text-center text-xs mt-2" style={{ color: "#4B4F6A" }}>
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
            <p className="text-xs" style={{ color: "#8B8FA8" }}>Seu novo plano está ativo. Aproveite todas as funcionalidades.</p>
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
            <p className="text-xs mt-0.5" style={{ color: "#8B8FA8" }}>
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
            <p className="text-sm font-bold" style={{ color: "#F4F4F5" }}>{currentPlanLabel}</p>
            <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold" style={{ background: `${planColor}20`, color: planColor }}>
              Plano atual
            </span>
          </div>
          <p className="text-xs" style={{ color: "#8B8FA8" }}>{currentPlanDesc}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-lg font-black" style={{ color: "#F4F4F5" }}>{currentPlanPrice}</p>
          <p className="text-xs" style={{ color: "#4B4F6A" }}>{currentPlanPriceLabel}</p>
        </div>
      </div>

      {/* Comparativo de planos para free users */}
      {isFree && (
        <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid #2A2D3A" }}>
          <div className="px-5 py-4" style={{ background: "#212435", borderBottom: "1px solid #2A2D3A" }}>
            <p className="text-sm font-semibold" style={{ color: "#F4F4F5" }}>O que você está perdendo no plano Grátis</p>
          </div>
          <div className="overflow-x-auto">
            <div className="grid grid-cols-3 divide-x min-w-[360px]" style={{ background: "#1A1D27", borderColor: "#2A2D3A" }}>
              {[
                { label: "Uploads/mês", free: "1", pro: "Ilimitado", premium: "Ilimitado" },
                { label: "Transações", free: "200", pro: "10.000", premium: "50.000" },
                { label: "Empresas", free: "1", pro: "1", premium: "Até 3" },
                { label: "PDF", free: "—", pro: "✓", premium: "✓" },
                { label: "Webhooks", free: "—", pro: "—", premium: "✓" },
                { label: "Usuários", free: "1", pro: "1", premium: "Até 5" },
              ].map((row, i) => (
                <div key={i} className="contents">
                  <div className="px-4 py-2.5 col-span-1" style={{ borderBottom: "1px solid #2A2D3A" }}>
                    <p className="text-xs font-medium" style={{ color: "#8B8FA8" }}>{row.label}</p>
                  </div>
                  <div className="px-4 py-2.5 text-center" style={{ borderBottom: "1px solid #2A2D3A" }}>
                    <p className="text-xs" style={{ color: row.free === "—" ? "#4B4F6A" : "#F4F4F5" }}>{row.free}</p>
                  </div>
                  <div className="px-4 py-2.5 text-center" style={{ borderBottom: "1px solid #2A2D3A", background: "rgba(245,158,11,0.03)" }}>
                    <p className="text-xs font-medium" style={{ color: row.pro === "—" ? "#4B4F6A" : "#F59E0B" }}>{row.pro}</p>
                  </div>
                  <div className="px-4 py-2.5 text-center" style={{ borderBottom: "1px solid #2A2D3A", background: "rgba(168,85,247,0.03)" }}>
                    <p className="text-xs font-medium" style={{ color: row.premium === "—" ? "#4B4F6A" : "#A855F7" }}>{row.premium}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-4 px-0 min-w-[360px]" style={{ background: "#1A1D27" }}>
              <div className="px-4 py-3" />
              <div className="px-4 py-3 text-center">
                <p className="text-xs font-bold" style={{ color: "#4B4F6A" }}>Grátis</p>
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
      <div className="rounded-2xl p-6" style={{ background: "#1A1D27", border: "1px solid #2A2D3A" }}>
        <p className="text-sm font-semibold mb-1" style={{ color: "#F4F4F5" }}>Histórico de cobrança</p>
        <p className="text-xs mb-4" style={{ color: "#4B4F6A" }}>
          {isPremium || (isPro && !isTrial)
            ? "Gerencie cobranças, altere cartão e cancele pelo portal seguro do Stripe."
            : "Nenhuma cobrança registrada no plano Grátis ou Trial."}
        </p>
        <div className="flex items-center gap-2 p-3 rounded-xl mb-4" style={{ background: "#212435" }}>
          <CreditCard className="w-4 h-4 shrink-0" style={{ color: "#4B4F6A" }} />
          <span className="text-xs" style={{ color: "#4B4F6A" }}>
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
            style={{ background: "#212435", border: "1px solid #2A2D3A", color: "#F4F4F5" }}
            onMouseOver={(e) => (e.currentTarget.style.borderColor = "#3D4158")}
            onMouseOut={(e) => (e.currentTarget.style.borderColor = "#2A2D3A")}
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
      <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid #2A2D3A" }}>
        <div className="px-6 py-4" style={{ background: "#1A1D27", borderBottom: "1px solid #2A2D3A" }}>
          <p className="text-sm font-semibold" style={{ color: "#F4F4F5" }}>Preferências de email</p>
          <p className="text-xs mt-0.5" style={{ color: "#4B4F6A" }}>Escolha quais notificações deseja receber</p>
        </div>
        <div style={{ background: "#1A1D27", opacity: loading ? 0.5 : 1 }}>
          {items.map((item, i) => (
            <div
              key={item.key}
              className="flex items-center justify-between px-6 py-4"
              style={{ borderBottom: i < items.length - 1 ? "1px solid #212435" : "none" }}
            >
              <div className="flex-1 min-w-0 pr-4">
                <p className="text-sm font-medium" style={{ color: "#F4F4F5" }}>{item.label}</p>
                <p className="text-xs mt-0.5" style={{ color: "#4B4F6A" }}>{item.desc}</p>
              </div>
              <button
                onClick={() => toggle(item.key)}
                disabled={loading}
                className="relative rounded-full transition-all duration-200 shrink-0"
                style={{ background: toggles[item.key] ? "#00D084" : "#2A2D3A", width: 40, height: 22 }}
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
          style={{ background: "#00D084", color: "#0F1117" }}
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
    <div className="rounded-2xl p-6" style={{ background: "#1A1D27", border: "1px solid rgba(245,158,11,0.2)" }}>
      <div className="flex items-center gap-3 mb-5">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg" style={{ background: "rgba(245,158,11,0.1)" }}>
          <KeyRound className="w-4 h-4" style={{ color: "#F59E0B" }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold" style={{ color: "#F4F4F5" }}>PIN de Acesso Financeiro</p>
          <p className="text-xs" style={{ color: "#4B4F6A" }}>
            Contadores precisam digitar este PIN para visualizar dados de plano e integrações bancárias
          </p>
        </div>
        {hasPin !== null && (
          <span
            className="text-[10px] px-2 py-0.5 rounded-full font-semibold shrink-0"
            style={hasPin
              ? { background: "rgba(0,208,132,0.1)", color: "#00D084" }
              : { background: "rgba(139,143,168,0.1)", color: "#8B8FA8" }}
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
            <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: "#4B4F6A" }}>{label}</label>
            <div className="relative">
              <input
                type={showPin ? "text" : "password"}
                inputMode="numeric"
                maxLength={8}
                value={value}
                onChange={(e) => { setError(""); onChange(e.target.value.replace(/\D/g, "")) }}
                placeholder="••••••"
                className="w-full px-4 py-3 pr-10 rounded-xl text-sm outline-none transition-all"
                style={{ background: "#212435", border: "1px solid #2A2D3A", color: "#F4F4F5" }}
                onFocus={(e) => (e.target.style.borderColor = "#F59E0B")}
                onBlur={(e) => (e.target.style.borderColor = "#2A2D3A")}
              />
              <button
                type="button"
                onClick={() => setShowPin(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100"
                style={{ color: "#8B8FA8" }}
              >
                {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mt-5 pt-5 flex-wrap gap-3" style={{ borderTop: "1px solid #212435" }}>
        <p className="text-xs" style={{ color: error ? "#FF4D4F" : saved ? "#00D084" : "#4B4F6A" }}>
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
            style={{ background: "#F59E0B", color: "#0F1117" }}
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
        <div className="rounded-2xl p-6" style={{ background: "#1A1D27", border: "1px solid #2A2D3A" }}>
          <div className="flex items-center gap-3 mb-5">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg" style={{ background: "#212435" }}>
              <KeyRound className="w-4 h-4" style={{ color: "#8B8FA8" }} />
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: "#F4F4F5" }}>Alterar senha</p>
              <p className="text-xs" style={{ color: "#4B4F6A" }}>Recomendamos uma senha forte com letras, números e símbolos</p>
            </div>
          </div>
          <div className="space-y-3">
            {[
              { label: "Senha atual", value: currentPassword, onChange: setCurrentPassword },
              { label: "Nova senha", value: newPassword, onChange: setNewPassword },
              { label: "Confirmar nova senha", value: confirmPassword, onChange: setConfirmPassword },
            ].map(({ label, value, onChange }) => (
              <div key={label}>
                <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: "#4B4F6A" }}>
                  {label}
                </label>
                <input
                  type="password"
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                  style={{ background: "#212435", border: "1px solid #2A2D3A", color: "#F4F4F5" }}
                  onFocus={(e) => (e.target.style.borderColor = "#00D084")}
                  onBlur={(e) => (e.target.style.borderColor = "#2A2D3A")}
                />
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between mt-5 pt-5" style={{ borderTop: "1px solid #212435" }}>
            <p className="text-xs" style={{ color: error ? "#FF4D4F" : saved ? "#00D084" : "#4B4F6A" }}>
              {error || (saved ? "Senha alterada com sucesso." : "Use no mínimo 8 caracteres.")}
            </p>
            <button
              onClick={handleSave}
              disabled={saving || !currentPassword || !newPassword || !confirmPassword}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-60"
              style={{ background: "#00D084", color: "#0F1117" }}
            >
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</> : "Atualizar senha"}
            </button>
          </div>
        </div>
      )}

      {/* Finance PIN — owner only */}
      {can(role, "finance:manage") && <FinancePinSection />}

      {/* Sessions */}
      <div className="rounded-2xl p-6" style={{ background: "#1A1D27", border: "1px solid #2A2D3A" }}>
        <p className="text-sm font-semibold mb-1" style={{ color: "#F4F4F5" }}>Sessões ativas</p>
        <p className="text-xs mb-4" style={{ color: "#4B4F6A" }}>Dispositivos com sessão aberta na sua conta</p>
        <div className="flex items-center gap-3 p-3.5 rounded-xl" style={{ background: "#212435" }}>
          <div className="w-2 h-2 rounded-full shrink-0" style={{ background: "#00D084" }} />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium" style={{ color: "#F4F4F5" }}>Este dispositivo</p>
            <p className="text-xs" style={{ color: "#4B4F6A" }}>Navegador web · Agora</p>
          </div>
          <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: "rgba(0,208,132,0.1)", color: "#00D084" }}>
            Atual
          </span>
        </div>
      </div>

      {/* LGPD — Dados pessoais (somente proprietário pode exportar dados da organização) */}
      {isOwner && (
        <div className="rounded-2xl p-6" style={{ background: "#1A1D27", border: "1px solid #2A2D3A" }}>
          <p className="text-sm font-semibold mb-1" style={{ color: "#F4F4F5" }}>Seus dados (LGPD)</p>
          <p className="text-xs mb-4" style={{ color: "#4B4F6A" }}>
            Conforme a Lei Geral de Proteção de Dados, você pode exportar ou excluir todos os seus dados a qualquer momento.
          </p>
          <a
            href="/api/account/export"
            download
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all"
            style={{ background: "#212435", color: "#8B8FA8", border: "1px solid #2A2D3A", display: "inline-flex" }}
          >
            <Save className="w-3.5 h-3.5" />
            Exportar todos os meus dados (.json)
          </a>
        </div>
      )}

      {/* Danger zone — owner only */}
      {isOwner && (
        <div className="rounded-2xl p-6" style={{ background: "#1A1D27", border: "1px solid rgba(255,77,79,0.2)" }}>
          <div className="flex items-start gap-3 mb-4">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "#FF4D4F" }} />
            <div>
              <p className="text-sm font-semibold" style={{ color: "#FF4D4F" }}>Zona de perigo</p>
              <p className="text-xs mt-0.5" style={{ color: "#8B8FA8" }}>
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
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#4B4F6A" }}>
                Etapa 1 de 2 — Confirme sua senha
              </p>
              <input
                type="password"
                value={deletePassword}
                onChange={(e) => { setDeletePassword(e.target.value); setDeleteError("") }}
                placeholder="Sua senha atual"
                autoFocus
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                style={{ background: "#212435", border: `1px solid ${deleteError ? "#FF4D4F" : "rgba(255,77,79,0.2)"}`, color: "#F4F4F5" }}
              />
              {deleteError && <p className="text-xs" style={{ color: "#FF4D4F" }}>{deleteError}</p>}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setDeleteStep("idle"); setDeletePassword(""); setDeleteError("") }}
                  className="px-4 py-2 rounded-xl text-xs font-medium"
                  style={{ background: "#212435", color: "#8B8FA8" }}
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
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#4B4F6A" }}>
                Etapa 2 de 2 — Digite EXCLUIR para confirmar
              </p>
              <input
                type="text"
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                placeholder="EXCLUIR"
                autoFocus
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                style={{ background: "#212435", border: "1px solid rgba(255,77,79,0.2)", color: "#F4F4F5" }}
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setDeleteStep("idle"); setDeletePassword(""); setDeleteConfirm(""); setDeleteError("") }}
                  className="px-4 py-2 rounded-xl text-xs font-medium"
                  style={{ background: "#212435", color: "#8B8FA8" }}
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
  { name: "C6 Bank", color: "#242424" },
]

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
      <div className="rounded-2xl p-6" style={{ background: "#1A1D27", border: "1px solid #2A2D3A" }}>
        <div className="flex items-start gap-3 mb-5">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl shrink-0" style={{ background: "#212435" }}>
            <Plug className="w-4 h-4" style={{ color: "#3B82F6" }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <p className="text-sm font-semibold" style={{ color: "#F4F4F5" }}>Open Finance & Conexões Bancárias</p>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{ background: "rgba(59,130,246,0.15)", color: "#3B82F6" }}>Em breve</span>
            </div>
            <p className="text-xs" style={{ color: "#4B4F6A" }}>
              Conecte sua conta bancária para análises automáticas sem precisar fazer upload manual de extratos.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SUPPORTED_BANKS.map(bank => (
            <div
              key={bank.name}
              className="flex items-center justify-between px-4 py-3 rounded-xl"
              style={{ background: "#212435", border: "1px solid #2A2D3A" }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black"
                  style={{ background: bank.color + "22", color: bank.color, border: `1px solid ${bank.color}33` }}
                >
                  {bank.name.slice(0, 2).toUpperCase()}
                </div>
                <span className="text-sm font-medium" style={{ color: "#F4F4F5" }}>{bank.name}</span>
              </div>
              <button
                disabled
                className="text-xs px-2.5 py-1 rounded-lg font-medium opacity-40 cursor-not-allowed"
                style={{ background: "#2A2D3A", color: "#8B8FA8" }}
                title="Em breve"
              >
                Conectar
              </button>
            </div>
          ))}
        </div>

        <p className="text-xs mt-4 flex items-center gap-1.5" style={{ color: "#4B4F6A" }}>
          <Shield className="w-3 h-3 shrink-0" />
          Integração via Pluggy.ai — seus dados bancários nunca são armazenados em nossos servidores
        </p>
      </div>

      {/* Webhooks */}
      <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid #2A2D3A" }}>
        <div className="flex items-center justify-between px-6 py-4" style={{ background: "#1A1D27", borderBottom: "1px solid #2A2D3A" }}>
          <div className="flex items-center gap-3">
            <Webhook className="w-4 h-4" style={{ color: "#8B8FA8" }} />
            <div>
              <p className="text-sm font-semibold" style={{ color: "#F4F4F5" }}>Webhooks</p>
              <p className="text-xs mt-0.5" style={{ color: "#4B4F6A" }}>
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

        <div className="px-6 py-5" style={{ background: "#1A1D27" }}>
          {!isPremium ? (
            <div className="text-center py-4">
              <p className="text-sm font-medium mb-1" style={{ color: "#8B8FA8" }}>Apenas para usuários Premium</p>
              <p className="text-xs mb-4" style={{ color: "#4B4F6A" }}>
                Configure webhooks para receber notificações em tempo real no seu sistema ou Slack.
              </p>
              <button
                onClick={() => {}}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold"
                style={{ background: "#F59E0B", color: "#0F1117" }}
              >
                <Crown className="w-3.5 h-3.5" />
                Fazer upgrade para Premium
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* URL input */}
              <div>
                <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: "#4B4F6A" }}>
                  URL do Webhook
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={webhookUrl}
                    onChange={e => setWebhookUrl(e.target.value)}
                    placeholder="https://seu-sistema.com/webhook"
                    className="flex-1 px-4 py-3 rounded-xl text-sm outline-none transition-all"
                    style={{ background: "#212435", border: "1px solid #2A2D3A", color: "#F4F4F5" }}
                    onFocus={e => (e.target.style.borderColor = "#00D084")}
                    onBlur={e => (e.target.style.borderColor = "#2A2D3A")}
                  />
                  <button
                    onClick={handleSaveWebhook}
                    disabled={!webhookUrl}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                    style={{ background: "#00D084", color: "#0F1117" }}
                  >
                    {webhookSaved ? <CheckCircle className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                    {webhookSaved ? "Salvo!" : "Adicionar"}
                  </button>
                </div>
              </div>

              {/* Events */}
              <div>
                <p className="text-xs font-semibold mb-3 uppercase tracking-wider" style={{ color: "#4B4F6A" }}>
                  Eventos para assinar
                </p>
                <div className="space-y-2">
                  {WEBHOOK_EVENTS.map(event => (
                    <label key={event.key} className="flex items-center gap-3 cursor-pointer group">
                      <div
                        className="w-4 h-4 rounded flex items-center justify-center shrink-0 transition-all"
                        style={{
                          background: webhookEvents.has(event.key) ? "#00D084" : "#212435",
                          border: webhookEvents.has(event.key) ? "1px solid #00D084" : "1px solid #2A2D3A",
                        }}
                        onClick={() => toggleEvent(event.key)}
                      >
                        {webhookEvents.has(event.key) && (
                          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                            <path d="M1 4L3.5 6.5L9 1" stroke="#0F1117" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                      <span className="text-sm" style={{ color: "#F4F4F5" }}>{event.label}</span>
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
      <div className="mb-8">
        <h1 className="text-2xl font-black" style={{ color: "#F4F4F5" }}>Configurações</h1>
        <p className="text-sm mt-0.5" style={{ color: "#8B8FA8" }}>Gerencie sua conta, plano e preferências</p>
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
                  color: activeTab === id ? "#00D084" : "#8B8FA8",
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
              <p className="text-xs font-bold mb-1" style={{ color: "#F4F4F5" }}>{sidebarWidget.title}</p>
              <p className="text-xs mb-3" style={{ color: "#8B8FA8" }}>{sidebarWidget.desc}</p>
              <button
                onClick={() => setActiveTab("plan")}
                className="w-full py-2 rounded-lg text-xs font-bold"
                style={{ background: sidebarWidget.color, color: "#0F1117" }}
              >
                Ver planos
              </button>
            </div>
          )}

          {isOnPaidPlan && plan !== "admin" && (
            <div className="mt-4 px-2">
              <p className="text-xs text-center" style={{ color: "#4B4F6A" }}>
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
