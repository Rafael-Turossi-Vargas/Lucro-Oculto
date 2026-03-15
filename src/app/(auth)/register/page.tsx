"use client"

import { Suspense, useState, useRef } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import {
  Eye, EyeOff, Loader2, AlertCircle, CheckCircle2,
  Building2, Zap, Star, CreditCard, ArrowRight, Rocket,
} from "lucide-react"

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ]
  const strength = checks.filter(Boolean).length
  const colors = ["#FF4D4F", "#FF4D4F", "#F59E0B", "#00D084", "#00D084"]
  const labels = ["", "Fraca", "Regular", "Boa", "Forte"]

  if (!password) return null

  return (
    <div className="mt-2 space-y-1">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-0.5 flex-1 rounded-full transition-all duration-300"
            style={{ background: i < strength ? colors[strength] : "var(--border)" }}
          />
        ))}
      </div>
      <p className="text-[11px] font-medium" style={{ color: colors[strength] ?? "var(--text-faint)" }}>
        {labels[strength]}
      </p>
    </div>
  )
}

function formatCnpj(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 14)
  return digits
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2")
}

type CnpjStatus = "idle" | "checking" | "valid" | "invalid"
type Plan = "free" | "pro" | "premium"

const plans: { id: Plan; label: string; price: string; icon: typeof Zap; color: string; bg: string; border: string; badge?: string; feature: string }[] = [
  {
    id: "free",
    label: "Grátis",
    price: "R$0 · Sempre",
    icon: Zap,
    color: "#00D084",
    bg: "rgba(0,208,132,0.07)",
    border: "rgba(0,208,132,0.45)",
    feature: "1 análise / mês",
  },
  {
    id: "pro",
    label: "Pro",
    price: "R$97/mês",
    icon: Star,
    color: "#F59E0B",
    bg: "rgba(245,158,11,0.07)",
    border: "rgba(245,158,11,0.5)",
    badge: "7d grátis",
    feature: "Análises ilimitadas",
  },
  {
    id: "premium",
    label: "Premium",
    price: "R$297/mês",
    icon: Building2,
    color: "#A855F7",
    bg: "rgba(168,85,247,0.07)",
    border: "rgba(168,85,247,0.45)",
    badge: "7d grátis",
    feature: "Até 3 empresas",
  },
]

const inputBase: React.CSSProperties = {
  background: "var(--bg-subtle)",
  border: "1px solid var(--border-hover)",
  color: "var(--text-primary)",
}

function focusInput(e: React.FocusEvent<HTMLInputElement>, color = "rgba(0,208,132,0.45)") {
  e.target.style.borderColor = color
  e.target.style.boxShadow = "0 0 0 3px rgba(0,208,132,0.07)"
  e.target.style.background = "var(--bg-subtle)"
}
function blurInput(e: React.FocusEvent<HTMLInputElement>) {
  e.target.style.borderColor = "var(--border-hover)"
  e.target.style.boxShadow = "none"
  e.target.style.background = "var(--bg-subtle)"
}

function RegisterForm() {
  const router = useRouter()
  const params = useSearchParams()
  // Valida plan param — qualquer valor inválido cai em "free"
  const rawPlan = params.get("plan")
  const VALID_PLANS: Plan[] = ["free", "pro", "premium"]
  const initialPlan: Plan = VALID_PLANS.includes(rawPlan as Plan) ? (rawPlan as Plan) : "free"
  const [selectedPlan, setSelectedPlan] = useState<Plan>(initialPlan)
  const [form, setForm] = useState({
    name: "",
    organizationName: "",
    cnpj: "",
    email: params.get("email") ?? "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [cnpjStatus, setCnpjStatus] = useState<CnpjStatus>("idle")
  const [cnpjCompanyName, setCnpjCompanyName] = useState("")
  const cnpjDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const update = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const validateCnpjDigits = async (digits: string) => {
    if (digits.length !== 14) { setCnpjStatus("invalid"); return }
    setCnpjStatus("checking")
    try {
      const res = await fetch(`/api/cnpj/${digits}`)
      const data = await res.json() as { razao_social?: string; nome_fantasia?: string; ativa?: boolean }
      if (!res.ok || data.ativa === false) { setCnpjStatus("invalid"); return }
      const name = data.nome_fantasia || data.razao_social || ""
      setCnpjCompanyName(name)
      setCnpjStatus("valid")
      if (!form.organizationName && name) setForm((prev) => ({ ...prev, organizationName: name }))
    } catch {
      setCnpjStatus("invalid")
    }
  }

  const handleCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCnpj(e.target.value)
    setForm((prev) => ({ ...prev, cnpj: formatted }))
    setCnpjStatus("idle")
    setCnpjCompanyName("")
    const digits = formatted.replace(/\D/g, "")
    if (cnpjDebounceRef.current) clearTimeout(cnpjDebounceRef.current)
    if (digits.length === 14) {
      cnpjDebounceRef.current = setTimeout(() => validateCnpjDigits(digits), 500)
    }
  }

  // Mantido para onBlur (caso usuário não altere o campo após preencher 14 dígitos)
  const validateCnpj = () => {
    const digits = form.cnpj.replace(/\D/g, "")
    if (cnpjStatus === "valid" || cnpjStatus === "checking") return
    void validateCnpjDigits(digits)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!agreed) { setError("Aceite os termos de uso para continuar."); return }
    if (form.password.length < 8) { setError("Senha deve ter pelo menos 8 caracteres."); return }
    if (cnpjStatus !== "valid") { setError("Verifique o CNPJ antes de continuar."); return }

    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, cnpj: form.cnpj.replace(/\D/g, ""), plan: selectedPlan }),
      })
      const data = await res.json() as { error?: string; checkoutUrl?: string }
      if (!res.ok) { setError(data.error ?? "Erro ao criar conta."); setLoading(false); return }
      if (data.checkoutUrl) { window.location.href = data.checkoutUrl; return }
      router.push("/login?registered=true")
    } catch {
      setError("Erro ao criar conta. Tente novamente.")
      setLoading(false)
    }
  }

  const activePlan = plans.find((p) => p.id === selectedPlan)!

  return (
    <div>
      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
          style={{
            background: "linear-gradient(135deg, rgba(0,208,132,0.15) 0%, rgba(0,208,132,0.06) 100%)",
            border: "1px solid rgba(0,208,132,0.25)",
            boxShadow: "0 0 20px rgba(0,208,132,0.1)",
          }}
        >
          <Rocket style={{ color: "#00D084", width: "18px", height: "18px" }} />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold leading-tight" style={{ color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
            Comece agora
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            Descubra onde seu lucro está vazando
          </p>
        </div>
      </div>

      {/* Plan selector */}
      <div className="grid grid-cols-3 gap-2 mb-5">
        {plans.map((plan) => {
          const Icon = plan.icon
          const active = selectedPlan === plan.id
          return (
            <button
              key={plan.id}
              type="button"
              onClick={() => setSelectedPlan(plan.id)}
              className="relative flex flex-col gap-1.5 p-3 rounded-xl text-left transition-all duration-150"
              style={{
                background: active ? plan.bg : "var(--bg-card)",
                border: `1px solid ${active ? plan.border : "var(--border)"}`,
                boxShadow: active ? `0 0 16px ${plan.color}20` : "none",
              }}
            >
              {plan.badge && (
                <span
                  className="absolute -top-2 right-2 text-[9px] px-1.5 py-0.5 rounded-full font-bold"
                  style={{ background: plan.color, color: plan.id === "premium" ? "#fff" : "#0A0C14" }}
                >
                  {plan.badge}
                </span>
              )}
              <div className="flex items-center gap-1.5">
                <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: active ? plan.color : "var(--text-muted)" }} />
                <span className="text-sm font-bold" style={{ color: active ? plan.color : "var(--text-primary)" }}>
                  {plan.label}
                </span>
              </div>
              <span className="text-[10px] font-mono leading-tight" style={{ color: active ? plan.color : "var(--text-muted)" }}>
                {plan.price}
              </span>
              <span className="text-[10px]" style={{ color: active ? plan.color : "var(--text-muted)", opacity: 0.85 }}>{plan.feature}</span>
            </button>
          )
        })}
      </div>

      {/* Paid plan banner */}
      {(selectedPlan === "pro" || selectedPlan === "premium") && (
        <div
          className="flex items-start gap-2.5 px-3.5 py-3 rounded-xl mb-4"
          style={{
            background: activePlan.bg,
            border: `1px solid ${selectedPlan === "premium" ? "rgba(168,85,247,0.2)" : "rgba(245,158,11,0.2)"}`,
          }}
        >
          <CreditCard className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: activePlan.color }} />
          <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
            Cartão necessário para o trial.{" "}
            <strong style={{ color: "var(--text-primary)" }}>Sem cobrança agora.</strong>{" "}
            Cobrado {selectedPlan === "premium" ? "R$297" : "R$97"}/mês após 7 dias — cancele antes e não paga nada.
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div
          className="flex items-center gap-2.5 px-4 py-3 rounded-xl mb-4"
          style={{ background: "rgba(255,77,79,0.07)", border: "1px solid rgba(255,77,79,0.2)", color: "#FF4D4F" }}
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-3.5">

        {/* Name + org — 2 col */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest mb-1.5" style={{ color: "var(--text-muted)" }}>
              Nome
            </label>
            <input
              type="text"
              value={form.name}
              onChange={update("name")}
              required
              placeholder="João Silva"
              className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none transition-all duration-150"
              style={inputBase}
              onFocus={focusInput}
              onBlur={blurInput}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest mb-1.5" style={{ color: "var(--text-muted)" }}>
              Empresa
            </label>
            <input
              type="text"
              value={form.organizationName}
              onChange={update("organizationName")}
              required
              placeholder="Agência XYZ"
              className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none transition-all duration-150"
              style={inputBase}
              onFocus={focusInput}
              onBlur={blurInput}
            />
          </div>
        </div>

        {/* CNPJ */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest mb-1.5" style={{ color: "var(--text-muted)" }}>
            CNPJ
          </label>
          <div className="relative">
            <input
              type="text"
              value={form.cnpj}
              onChange={handleCnpjChange}
              onBlur={validateCnpj}
              required
              placeholder="00.000.000/0000-00"
              maxLength={18}
              className="w-full px-3.5 py-2.5 pr-10 rounded-xl text-sm outline-none transition-all duration-150 font-mono"
              style={{
                ...inputBase,
                borderColor: cnpjStatus === "valid" ? "rgba(0,208,132,0.5)" : cnpjStatus === "invalid" ? "rgba(255,77,79,0.5)" : "var(--border)",
                boxShadow: cnpjStatus === "valid" ? "0 0 0 3px rgba(0,208,132,0.07)" : cnpjStatus === "invalid" ? "0 0 0 3px rgba(255,77,79,0.07)" : "none",
              }}
              onFocus={(e) => { if (cnpjStatus === "idle") focusInput(e) }}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {cnpjStatus === "checking" && <Loader2 className="w-4 h-4 animate-spin" style={{ color: "var(--text-muted)" }} />}
              {cnpjStatus === "valid" && <CheckCircle2 className="w-4 h-4" style={{ color: "#00D084" }} />}
              {cnpjStatus === "invalid" && <AlertCircle className="w-4 h-4" style={{ color: "#FF4D4F" }} />}
            </div>
          </div>
          {cnpjStatus === "valid" && cnpjCompanyName && (
            <div className="flex items-center gap-1.5 mt-1.5 px-1">
              <CheckCircle2 className="w-3 h-3 shrink-0" style={{ color: "#00D084" }} />
              <p className="text-xs font-medium truncate" style={{ color: "#00D084" }}>{cnpjCompanyName}</p>
            </div>
          )}
          {cnpjStatus === "invalid" && (
            <p className="text-xs mt-1.5 px-1" style={{ color: "#FF4D4F" }}>
              CNPJ não encontrado ou inativo.
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest mb-1.5" style={{ color: "var(--text-muted)" }}>
            Email
          </label>
          <input
            type="email"
            value={form.email}
            onChange={update("email")}
            required
            placeholder="seu@email.com"
            className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none transition-all duration-150"
            style={inputBase}
            onFocus={focusInput}
            onBlur={blurInput}
          />
        </div>

        {/* Senha */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest mb-1.5" style={{ color: "var(--text-muted)" }}>
            Senha
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={update("password")}
              required
              placeholder="Mínimo 8 caracteres"
              className="w-full px-3.5 py-2.5 pr-10 rounded-xl text-sm outline-none transition-all duration-150"
              style={inputBase}
              onFocus={focusInput}
              onBlur={blurInput}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 transition-opacity hover:opacity-70"
              style={{ color: "var(--text-faint)" }}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <PasswordStrength password={form.password} />
        </div>

        {/* Terms */}
        <label className="flex items-start gap-3 cursor-pointer group">
          <div className="relative mt-0.5 shrink-0">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="sr-only"
            />
            <div
              className="w-4 h-4 rounded flex items-center justify-center transition-all duration-150"
              style={{
                background: agreed ? "#00D084" : "var(--bg-subtle)",
                border: `1px solid ${agreed ? "#00D084" : "var(--border-hover)"}`,
                boxShadow: agreed ? "0 0 8px rgba(0,208,132,0.3)" : "none",
              }}
            >
              {agreed && <CheckCircle2 className="w-2.5 h-2.5" style={{ color: "#0A0C14" }} />}
            </div>
          </div>
          <span className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
            Li e aceito os{" "}
            <Link href="/terms" className="font-semibold hover:opacity-80" style={{ color: "#00D084" }}>Termos de Uso</Link>
            {" "}e a{" "}
            <Link href="/privacy" className="font-semibold hover:opacity-80" style={{ color: "#00D084" }}>Política de Privacidade</Link>
          </span>
        </label>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || cnpjStatus !== "valid"}
          className="relative w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-all duration-200 disabled:brightness-90 disabled:cursor-not-allowed overflow-hidden group"
          style={{
            background: selectedPlan === "premium"
              ? "linear-gradient(135deg, #A855F7 0%, #9333EA 100%)"
              : selectedPlan === "pro"
              ? "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)"
              : "linear-gradient(135deg, #00D084 0%, #00B872 100%)",
            color: selectedPlan === "premium" ? "#fff" : "#0A0C14",
            boxShadow: loading || cnpjStatus !== "valid"
              ? "none"
              : selectedPlan === "premium"
              ? "0 4px 24px rgba(168,85,247,0.4)"
              : selectedPlan === "pro"
              ? "0 4px 24px rgba(245,158,11,0.35)"
              : "0 4px 24px rgba(0,208,132,0.4)",
          }}
        >
          {/* Shimmer */}
          <span
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
            style={{ background: "linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.15) 50%, transparent 70%)" }}
          />
          {loading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> {selectedPlan === "free" ? "Criando conta..." : "Redirecionando..."}</>
          ) : selectedPlan === "premium" ? (
            <><Building2 className="w-4 h-4" /> Começar trial Premium <ArrowRight className="w-4 h-4" /></>
          ) : selectedPlan === "pro" ? (
            <><Star className="w-4 h-4" /> Começar trial Pro <ArrowRight className="w-4 h-4" /></>
          ) : (
            <>Criar conta grátis <ArrowRight className="w-4 h-4" /></>
          )}
        </button>

        {(selectedPlan === "pro" || selectedPlan === "premium") && (
          <p className="text-center text-xs" style={{ color: "var(--text-faint)" }}>
            ✓ Sem cobrança por 7 dias · Cancele antes e não paga nada
          </p>
        )}
      </form>

      {/* Divider */}
      <div className="flex items-center gap-3 my-5">
        <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, transparent, var(--border))" }} />
        <span className="text-xs font-medium" style={{ color: "var(--text-faint)" }}>OU</span>
        <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, var(--border), transparent)" }} />
      </div>

      {/* Login link */}
      <Link
        href="/login"
        className="flex items-center justify-between w-full px-4 py-3.5 rounded-xl transition-all duration-150 group"
        style={{ background: "var(--bg-subtle)", border: "1px solid var(--border)" }}
      >
        <div>
          <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Já tem uma conta?</p>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-faint)" }}>Entre e acesse seu diagnóstico</p>
        </div>
        <div
          className="flex items-center gap-1.5 text-sm font-bold transition-transform duration-150 group-hover:translate-x-0.5"
          style={{ color: "#00D084" }}
        >
          Entrar <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </Link>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="space-y-4 animate-pulse">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-12 rounded-xl" style={{ background: "var(--bg-card)" }} />
        ))}
      </div>
    }>
      <RegisterForm />
    </Suspense>
  )
}
