"use client"

import { Suspense, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle2, Building2, Zap, Star, CreditCard } from "lucide-react"

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ]
  const strength = checks.filter(Boolean).length
  const colors = ["#FF4D4F", "#F59E0B", "#F59E0B", "#00D084", "#00D084"]
  const labels = ["", "Fraca", "Regular", "Boa", "Forte"]

  if (!password) return null

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full transition-all duration-300"
            style={{ background: i < strength ? colors[strength] : "#2A2D3A" }}
          />
        ))}
      </div>
      <p className="text-xs" style={{ color: colors[strength] ?? "#4B4F6A" }}>
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

function RegisterForm() {
  const router = useRouter()
  const params = useSearchParams()
  const rawPlan = params.get("plan")
  const initialPlan: Plan = rawPlan === "premium" ? "premium" : rawPlan === "pro" ? "pro" : "free"
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

  const update = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = formatCnpj(e.target.value)
    setForm((prev) => ({ ...prev, cnpj: masked }))
    setCnpjStatus("idle")
    setCnpjCompanyName("")
  }

  const validateCnpj = async () => {
    const digits = form.cnpj.replace(/\D/g, "")
    if (digits.length !== 14) {
      setCnpjStatus("invalid")
      setCnpjCompanyName("")
      return
    }

    setCnpjStatus("checking")
    try {
      const res = await fetch(`/api/cnpj/${digits}`)
      const data = await res.json() as { razao_social?: string; nome_fantasia?: string; ativa?: boolean; error?: string }
      if (!res.ok || data.ativa === false) {
        setCnpjStatus("invalid")
        setCnpjCompanyName("")
        return
      }

      const name = data.nome_fantasia || data.razao_social || ""
      setCnpjCompanyName(name)
      setCnpjStatus("valid")

      // Auto-preenche o nome da empresa se estiver vazio
      if (!form.organizationName && name) {
        setForm((prev) => ({ ...prev, organizationName: name }))
      }
    } catch {
      setCnpjStatus("invalid")
      setCnpjCompanyName("")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
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

      if (!res.ok) {
        setError(data.error ?? "Erro ao criar conta.")
        setLoading(false)
        return
      }

      // Se escolheu Pro e Stripe retornou URL → redireciona para checkout
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl
        return
      }

      router.push("/login?registered=true")
    } catch {
      setError("Erro ao criar conta. Tente novamente.")
      setLoading(false)
    }
  }

  const inputStyle = {
    background: "#212435",
    border: "1px solid #2A2D3A",
    color: "#F4F4F5",
  }

  return (
    <div className="rounded-2xl p-8" style={{ background: "#1A1D27", border: "1px solid #2A2D3A" }}>
      <h1 className="text-2xl font-bold mb-1" style={{ color: "#F4F4F5" }}>
        Comece agora
      </h1>
      <p className="text-sm mb-6" style={{ color: "#8B8FA8" }}>
        Escolha seu plano e descubra onde seu lucro está vazando
      </p>

      {/* Plan toggle */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        <button
          type="button"
          onClick={() => setSelectedPlan("free")}
          className="flex flex-col items-start gap-1 px-3 py-3 rounded-xl text-left transition-all"
          style={{
            background: selectedPlan === "free" ? "rgba(0,208,132,0.06)" : "#212435",
            border: selectedPlan === "free" ? "2px solid #00D084" : "2px solid transparent",
          }}
        >
          <div className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5" style={{ color: selectedPlan === "free" ? "#00D084" : "#8B8FA8" }} />
            <span className="text-sm font-bold" style={{ color: selectedPlan === "free" ? "#00D084" : "#F4F4F5" }}>Grátis</span>
          </div>
          <span className="text-xs" style={{ color: "#4B4F6A" }}>R$0 · Sempre</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedPlan("pro")}
          className="relative flex flex-col items-start gap-1 px-3 py-3 rounded-xl text-left transition-all"
          style={{
            background: selectedPlan === "pro" ? "rgba(245,158,11,0.08)" : "#212435",
            border: selectedPlan === "pro" ? "2px solid #F59E0B" : "2px solid transparent",
          }}
        >
          <div className="absolute -top-2.5 right-2">
            <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold" style={{ background: "#F59E0B", color: "#0F1117" }}>
              7d grátis
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5" style={{ color: selectedPlan === "pro" ? "#F59E0B" : "#8B8FA8" }} />
            <span className="text-sm font-bold" style={{ color: selectedPlan === "pro" ? "#F59E0B" : "#F4F4F5" }}>Pro</span>
          </div>
          <span className="text-xs" style={{ color: "#4B4F6A" }}>R$97/mês</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedPlan("premium")}
          className="relative flex flex-col items-start gap-1 px-3 py-3 rounded-xl text-left transition-all"
          style={{
            background: selectedPlan === "premium" ? "rgba(168,85,247,0.08)" : "#212435",
            border: selectedPlan === "premium" ? "2px solid #A855F7" : "2px solid transparent",
          }}
        >
          <div className="absolute -top-2.5 right-2">
            <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold" style={{ background: "#A855F7", color: "#fff" }}>
              7d grátis
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5" style={{ color: selectedPlan === "premium" ? "#A855F7" : "#8B8FA8" }} />
            <span className="text-sm font-bold" style={{ color: selectedPlan === "premium" ? "#A855F7" : "#F4F4F5" }}>Premium</span>
          </div>
          <span className="text-xs" style={{ color: "#4B4F6A" }}>R$297/mês</span>
        </button>
      </div>

      {/* Paid plan info banner */}
      {(selectedPlan === "pro" || selectedPlan === "premium") && (
        <div
          className="flex items-start gap-2.5 px-4 py-3 rounded-xl mb-4 text-xs"
          style={{
            background: selectedPlan === "premium" ? "rgba(168,85,247,0.06)" : "rgba(245,158,11,0.06)",
            border: selectedPlan === "premium" ? "1px solid rgba(168,85,247,0.2)" : "1px solid rgba(245,158,11,0.2)",
            color: "#8B8FA8",
          }}
        >
          <CreditCard className="w-4 h-4 shrink-0 mt-0.5" style={{ color: selectedPlan === "premium" ? "#A855F7" : "#F59E0B" }} />
          <span>
            Você precisará cadastrar um cartão de crédito.{" "}
            <strong style={{ color: "#F4F4F5" }}>Nenhum valor será cobrado agora.</strong>{" "}
            A cobrança de {selectedPlan === "premium" ? "R$297" : "R$97"}/mês começa apenas após os 7 dias. Cancele antes e não paga nada.
          </span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl mb-4 text-sm"
          style={{ background: "rgba(255,77,79,0.08)", border: "1px solid rgba(255,77,79,0.2)", color: "#FF4D4F" }}>
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nome completo */}
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: "#8B8FA8" }}>Nome completo</label>
          <input
            type="text"
            value={form.name}
            onChange={update("name")}
            required
            placeholder="João Silva"
            className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
            style={inputStyle}
            onFocus={(e) => (e.target.style.borderColor = "#00D084")}
            onBlur={(e) => (e.target.style.borderColor = "#2A2D3A")}
          />
        </div>

        {/* CNPJ */}
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: "#8B8FA8" }}>CNPJ da empresa</label>
          <div className="relative">
            <input
              type="text"
              value={form.cnpj}
              onChange={handleCnpjChange}
              onBlur={validateCnpj}
              required
              placeholder="00.000.000/0000-00"
              maxLength={18}
              className="w-full px-4 py-3 pr-10 rounded-xl text-sm outline-none transition-all font-mono"
              style={{
                ...inputStyle,
                borderColor: cnpjStatus === "valid" ? "#00D084" : cnpjStatus === "invalid" ? "#FF4D4F" : "#2A2D3A",
              }}
              onFocus={(e) => {
                if (cnpjStatus === "idle") e.target.style.borderColor = "#00D084"
              }}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {cnpjStatus === "checking" && <Loader2 className="w-4 h-4 animate-spin" style={{ color: "#8B8FA8" }} />}
              {cnpjStatus === "valid" && <CheckCircle2 className="w-4 h-4" style={{ color: "#00D084" }} />}
              {cnpjStatus === "invalid" && <AlertCircle className="w-4 h-4" style={{ color: "#FF4D4F" }} />}
            </div>
          </div>
          {cnpjStatus === "valid" && cnpjCompanyName && (
            <div className="flex items-center gap-1.5 mt-1.5 px-1">
              <Building2 className="w-3 h-3 shrink-0" style={{ color: "#00D084" }} />
              <p className="text-xs font-medium truncate" style={{ color: "#00D084" }}>{cnpjCompanyName}</p>
            </div>
          )}
          {cnpjStatus === "invalid" && (
            <p className="text-xs mt-1.5 px-1" style={{ color: "#FF4D4F" }}>
              CNPJ não encontrado ou inativo. Verifique e tente novamente.
            </p>
          )}
        </div>

        {/* Nome da empresa */}
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: "#8B8FA8" }}>Nome da empresa</label>
          <input
            type="text"
            value={form.organizationName}
            onChange={update("organizationName")}
            required
            placeholder="Agência XYZ"
            className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
            style={inputStyle}
            onFocus={(e) => (e.target.style.borderColor = "#00D084")}
            onBlur={(e) => (e.target.style.borderColor = "#2A2D3A")}
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: "#8B8FA8" }}>Email</label>
          <input
            type="email"
            value={form.email}
            onChange={update("email")}
            required
            placeholder="seu@email.com"
            className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
            style={inputStyle}
            onFocus={(e) => (e.target.style.borderColor = "#00D084")}
            onBlur={(e) => (e.target.style.borderColor = "#2A2D3A")}
          />
        </div>

        {/* Senha */}
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: "#8B8FA8" }}>Senha</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={update("password")}
              required
              placeholder="Mínimo 8 caracteres"
              className="w-full px-4 py-3 pr-12 rounded-xl text-sm outline-none transition-all"
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = "#00D084")}
              onBlur={(e) => (e.target.style.borderColor = "#2A2D3A")}
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1" style={{ color: "#4B4F6A" }}>
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <PasswordStrength password={form.password} />
        </div>

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-0.5 rounded"
            style={{ accentColor: "#00D084" }}
          />
          <span className="text-xs leading-relaxed" style={{ color: "#8B8FA8" }}>
            Li e aceito os{" "}
            <Link href="/terms" style={{ color: "#00D084" }}>Termos de Uso</Link>{" "}
            e a{" "}
            <Link href="/privacy" style={{ color: "#00D084" }}>Política de Privacidade</Link>
          </span>
        </label>

        <button
          type="submit"
          disabled={loading || cnpjStatus !== "valid"}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          style={{
            background: selectedPlan === "premium" ? "#A855F7" : selectedPlan === "pro" ? "#F59E0B" : "#00D084",
            color: selectedPlan === "premium" ? "#fff" : "#0F1117",
          }}
        >
          {loading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> {selectedPlan === "free" ? "Criando conta..." : "Redirecionando para pagamento..."}</>
          ) : selectedPlan === "premium" ? (
            <><Building2 className="w-4 h-4" /> Começar trial Premium — adicionar cartão</>
          ) : selectedPlan === "pro" ? (
            <><Star className="w-4 h-4" /> Começar trial Pro — adicionar cartão</>
          ) : (
            "Criar conta grátis"
          )}
        </button>

        {(selectedPlan === "pro" || selectedPlan === "premium") && (
          <p className="text-center text-xs" style={{ color: "#4B4F6A" }}>
            Sem cobrança por 7 dias · Cancele antes e não paga nada
          </p>
        )}
      </form>

      <p className="text-center mt-6 text-sm" style={{ color: "#8B8FA8" }}>
        Já tem conta?{" "}
        <Link href="/login" className="font-semibold" style={{ color: "#00D084" }}>Entrar</Link>
      </p>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="rounded-2xl p-8" style={{ background: "#1A1D27", border: "1px solid #2A2D3A" }} />}>
      <RegisterForm />
    </Suspense>
  )
}
