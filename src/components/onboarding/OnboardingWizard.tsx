"use client"

import { useState } from "react"
import { ArrowRight, ArrowLeft, Loader2, Building2, Dumbbell, Stethoscope, ShoppingCart, UtensilsCrossed, Briefcase } from "lucide-react"

const BUSINESS_TYPES = [
  { value: "agency", label: "Agência / Serviços", icon: Building2, desc: "Marketing, design, consultoria" },
  { value: "academy", label: "Academia / Fitness", icon: Dumbbell, desc: "Gym, pilates, crossfit" },
  { value: "clinic", label: "Clínica / Saúde", icon: Stethoscope, desc: "Consultório, clínica" },
  { value: "ecommerce", label: "E-commerce", icon: ShoppingCart, desc: "Loja virtual, marketplace" },
  { value: "restaurant", label: "Restaurante / Food", icon: UtensilsCrossed, desc: "Restaurante, dark kitchen" },
  { value: "other", label: "Outro", icon: Briefcase, desc: "Outro tipo de negócio" },
]
const REVENUES = ["Até R$10k", "R$10k–R$50k", "R$50k–R$200k", "R$200k–R$1M", "Acima de R$1M"]
const EMPLOYEES = ["Só eu", "2–5", "6–20", "21–50", "50+"]
const TOOLS = ["Excel / Planilha", "ContaAzul", "Omie", "QuickBooks", "Nenhuma", "Outro"]
const PAINS = ["Não sei onde vai o dinheiro", "Custos crescendo sem controle", "Muitas assinaturas e ferramentas", "Dificuldade de prever o caixa", "Margem de lucro baixa", "Fornecedores caros"]
const GOALS = ["Reduzir custos", "Melhorar margem", "Organizar finanças", "Prever caixa"]

interface FormData {
  businessType: string
  monthlyRevenueRange: string
  employeeCountRange: string
  financialTools: string[]
  mainPainPoints: string[]
  primaryGoal: string
}

export function OnboardingWizard() {
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<FormData>({
    businessType: "",
    monthlyRevenueRange: "",
    employeeCountRange: "",
    financialTools: [],
    mainPainPoints: [],
    primaryGoal: "",
  })

  const TOTAL = 5
  const progress = ((step + 1) / TOTAL) * 100

  const toggleArray = (key: "financialTools" | "mainPainPoints", value: string) => {
    setForm((prev) => ({
      ...prev,
      [key]: prev[key].includes(value) ? prev[key].filter((v) => v !== value) : [...prev[key], value],
    }))
  }

  const canNext = () => {
    if (step === 0) return !!form.businessType
    if (step === 1) return !!form.monthlyRevenueRange
    if (step === 2) return !!form.employeeCountRange
    if (step === 3) return form.financialTools.length > 0
    if (step === 4) return form.mainPainPoints.length > 0 && !!form.primaryGoal
    return true
  }

  const handleFinish = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, niche: form.businessType }),
      })
      if (!res.ok) {
        setLoading(false)
        return
      }
      // Hard navigation para forçar re-fetch da sessão (onboardingCompleted agora é true)
      window.location.href = "/app/upload"
    } catch {
      setLoading(false)
    }
  }

  const btnBase = "px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 flex items-center gap-2"

  return (
    <div className="max-w-xl mx-auto">
      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Passo {step + 1} de {TOTAL}</p>
          <p className="text-xs" style={{ color: "var(--text-faint)" }}>{Math.round(progress)}% completo</p>
        </div>
        <div className="h-1.5 rounded-full" style={{ background: "var(--border)" }}>
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress}%`, background: "#00D084" }} />
        </div>
      </div>

      {/* Card */}
      <div className="rounded-2xl p-8" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>

        {/* Step 0: Business type */}
        {step === 0 && (
          <div>
            <h2 className="text-xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>Qual é o seu tipo de negócio?</h2>
            <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>Isso nos ajuda a personalizar sua análise.</p>
            <div className="grid grid-cols-2 gap-3">
              {BUSINESS_TYPES.map((bt) => {
                const Icon = bt.icon
                const active = form.businessType === bt.value
                return (
                  <button key={bt.value} onClick={() => setForm((p) => ({ ...p, businessType: bt.value }))}
                    className="flex items-start gap-3 p-4 rounded-xl text-left transition-all duration-150"
                    style={{
                      background: active ? "rgba(0,208,132,0.08)" : "var(--bg-subtle)",
                      border: active ? "1px solid #00D084" : "1px solid var(--border)",
                    }}>
                    <Icon className="w-5 h-5 shrink-0 mt-0.5" style={{ color: active ? "#00D084" : "var(--text-muted)" }} />
                    <div>
                      <p className="text-sm font-medium" style={{ color: active ? "var(--text-primary)" : "var(--text-primary)" }}>{bt.label}</p>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>{bt.desc}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Step 1: Revenue */}
        {step === 1 && (
          <div>
            <h2 className="text-xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>Qual o faturamento mensal médio?</h2>
            <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>Usado para calibrar os benchmarks da análise.</p>
            <div className="space-y-2">
              {REVENUES.map((r) => {
                const active = form.monthlyRevenueRange === r
                return (
                  <button key={r} onClick={() => setForm((p) => ({ ...p, monthlyRevenueRange: r }))}
                    className="w-full flex items-center gap-3 p-4 rounded-xl text-left transition-all duration-150"
                    style={{ background: active ? "rgba(0,208,132,0.08)" : "var(--bg-subtle)", border: active ? "1px solid #00D084" : "1px solid var(--border)" }}>
                    <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0"
                      style={{ borderColor: active ? "#00D084" : "var(--border-hover)" }}>
                      {active && <div className="w-2 h-2 rounded-full" style={{ background: "#00D084" }} />}
                    </div>
                    <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{r}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Step 2: Employees */}
        {step === 2 && (
          <div>
            <h2 className="text-xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>Quantos funcionários você tem?</h2>
            <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>Incluindo sócios e prestadores de serviço fixos.</p>
            <div className="grid grid-cols-2 gap-3">
              {EMPLOYEES.map((e) => {
                const active = form.employeeCountRange === e
                return (
                  <button key={e} onClick={() => setForm((p) => ({ ...p, employeeCountRange: e }))}
                    className="p-4 rounded-xl text-center font-medium text-sm transition-all duration-150"
                    style={{ background: active ? "rgba(0,208,132,0.08)" : "var(--bg-subtle)", border: active ? "1px solid #00D084" : "1px solid var(--border)", color: "var(--text-primary)" }}>
                    {e}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Step 3: Tools */}
        {step === 3 && (
          <div>
            <h2 className="text-xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>Como você controla o financeiro hoje?</h2>
            <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>Selecione todas as ferramentas que usa.</p>
            <div className="space-y-2">
              {TOOLS.map((t) => {
                const active = form.financialTools.includes(t)
                return (
                  <button key={t} onClick={() => toggleArray("financialTools", t)}
                    className="w-full flex items-center gap-3 p-4 rounded-xl text-left transition-all duration-150"
                    style={{ background: active ? "rgba(0,208,132,0.08)" : "var(--bg-subtle)", border: active ? "1px solid #00D084" : "1px solid var(--border)" }}>
                    <div className="w-4 h-4 rounded flex items-center justify-center shrink-0"
                      style={{ background: active ? "#00D084" : "transparent", border: active ? "none" : "1.5px solid var(--border-hover)" }}>
                      {active && <span className="text-[10px] font-bold" style={{ color: "var(--bg-page)" }}>✓</span>}
                    </div>
                    <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{t}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Step 4: Pains + Goal */}
        {step === 4 && (
          <div>
            <h2 className="text-xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>Qual sua principal dor financeira?</h2>
            <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>Selecione as que mais representam sua situação atual.</p>
            <div className="space-y-2 mb-6">
              {PAINS.map((pain) => {
                const active = form.mainPainPoints.includes(pain)
                return (
                  <button key={pain} onClick={() => toggleArray("mainPainPoints", pain)}
                    className="w-full flex items-center gap-3 p-3.5 rounded-xl text-left transition-all duration-150"
                    style={{ background: active ? "rgba(255,77,79,0.06)" : "var(--bg-subtle)", border: active ? "1px solid rgba(255,77,79,0.3)" : "1px solid var(--border)" }}>
                    <div className="w-4 h-4 rounded shrink-0 flex items-center justify-center"
                      style={{ background: active ? "#FF4D4F" : "transparent", border: active ? "none" : "1.5px solid var(--border-hover)" }}>
                      {active && <span className="text-[10px] font-bold" style={{ color: "#fff" }}>✓</span>}
                    </div>
                    <span className="text-sm" style={{ color: "var(--text-primary)" }}>{pain}</span>
                  </button>
                )
              })}
            </div>

            <p className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>Objetivo principal:</p>
            <div className="grid grid-cols-2 gap-2">
              {GOALS.map((g) => {
                const active = form.primaryGoal === g
                return (
                  <button key={g} onClick={() => setForm((p) => ({ ...p, primaryGoal: g }))}
                    className="p-3 rounded-xl text-sm font-medium text-center transition-all duration-150"
                    style={{ background: active ? "rgba(0,208,132,0.08)" : "var(--bg-subtle)", border: active ? "1px solid #00D084" : "1px solid var(--border)", color: "var(--text-primary)" }}>
                    {g}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <button onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}
            className={btnBase} style={{ color: "var(--text-muted)", opacity: step === 0 ? 0.3 : 1 }}>
            <ArrowLeft className="w-4 h-4" /> Voltar
          </button>

          {step < TOTAL - 1 ? (
            <button onClick={() => setStep((s) => s + 1)} disabled={!canNext()}
              className={btnBase} style={{ background: canNext() ? "#00D084" : "var(--bg-subtle)", color: canNext() ? "var(--bg-page)" : "var(--text-faint)" }}>
              Próximo <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={handleFinish} disabled={!canNext() || loading}
              className={btnBase} style={{ background: "#00D084", color: "var(--bg-page)", opacity: (!canNext() || loading) ? 0.7 : 1 }}>
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Finalizando...</> : <>Começar análise <ArrowRight className="w-4 h-4" /></>}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
