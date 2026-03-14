"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState, type ReactNode } from "react"
import { can } from "@/lib/roles"
import { KeyRound, Loader2, ShieldAlert } from "lucide-react"

const STORAGE_KEY = "lof_finance_verified"
const TTL_MS = 30 * 60 * 1000 // 30 minutes

interface StoredVerification {
  orgId: string
  expiresAt: number
}

function isSessionVerified(orgId: string): boolean {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return false
    const v = JSON.parse(raw) as StoredVerification
    return v.orgId === orgId && Date.now() < v.expiresAt
  } catch {
    return false
  }
}

function markSessionVerified(orgId: string) {
  sessionStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ orgId, expiresAt: Date.now() + TTL_MS })
  )
}

type GuardState = "loading" | "pass" | "pin_required" | "denied"

export function FinanceGuard({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const role = session?.user?.role ?? ""
  const orgId = session?.user?.organizationId ?? ""

  const [guardState, setGuardState] = useState<GuardState>("loading")
  const [pin, setPin] = useState("")
  const [error, setError] = useState("")
  const [verifying, setVerifying] = useState(false)

  useEffect(() => {
    if (status === "loading") return
    if (!can(role, "finance:view")) {
      setGuardState("denied")
      router.replace("/app/dashboard")
      return
    }
    if (role === "owner" || role === "admin") {
      setGuardState("pass")
      return
    }
    // contador: check sessionStorage for existing verified session
    if (isSessionVerified(orgId)) {
      setGuardState("pass")
    } else {
      setGuardState("pin_required")
    }
  }, [status, role, orgId, router])

  const handleVerify = async () => {
    if (pin.length < 4) {
      setError("PIN deve ter pelo menos 4 dígitos")
      return
    }
    setVerifying(true)
    setError("")
    try {
      const res = await fetch("/api/app/finance/verify-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      })
      const data = await res.json() as { error?: string }
      if (!res.ok) {
        setError(data.error ?? "PIN incorreto")
        setPin("")
        return
      }
      markSessionVerified(orgId)
      setGuardState("pass")
    } catch {
      setError("Erro ao verificar PIN. Tente novamente.")
    } finally {
      setVerifying(false)
    }
  }

  if (guardState === "loading" || guardState === "denied") return null

  if (guardState === "pass") return <>{children}</>

  // PIN prompt
  return (
    <div className="flex items-center justify-center min-h-[55vh]">
      <div
        className="rounded-2xl p-8 text-center max-w-sm w-full mx-4"
        style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
      >
        <div
          className="flex items-center justify-center w-14 h-14 rounded-2xl mx-auto mb-5"
          style={{ background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.25)" }}
        >
          <KeyRound className="w-7 h-7" style={{ color: "#F59E0B" }} />
        </div>

        <h2 className="text-base font-bold mb-1" style={{ color: "var(--text-primary)" }}>
          Área Financeira Restrita
        </h2>
        <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
          Esta seção requer o PIN de acesso financeiro configurado pelo proprietário.
        </p>

        <div className="relative mb-1">
          <input
            type="password"
            inputMode="numeric"
            maxLength={8}
            value={pin}
            onChange={(e) => {
              setError("")
              setPin(e.target.value.replace(/\D/g, ""))
            }}
            onKeyDown={(e) => e.key === "Enter" && handleVerify()}
            placeholder="••••••"
            className="w-full text-center text-2xl tracking-[0.5em] px-4 py-3.5 rounded-xl outline-none transition-all"
            style={{
              background: "var(--bg-subtle)",
              border: `1px solid ${error ? "#FF4D4F" : "var(--border)"}`,
              color: "var(--text-primary)",
            }}
            autoFocus
          />
        </div>

        {error && (
          <div
            className="flex items-start gap-2 p-3 rounded-xl mb-4 text-left"
            style={{ background: "rgba(255,77,79,0.08)", border: "1px solid rgba(255,77,79,0.2)" }}
          >
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "#FF4D4F" }} />
            <p className="text-xs" style={{ color: "#FF4D4F" }}>{error}</p>
          </div>
        )}

        <button
          onClick={handleVerify}
          disabled={verifying || pin.length < 4}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm mt-4 disabled:opacity-50 transition-all"
          style={{ background: "#F59E0B", color: "var(--bg-page)" }}
        >
          {verifying ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Verificando...</>
          ) : (
            <><KeyRound className="w-4 h-4" /> Acessar com PIN</>
          )}
        </button>

        <p className="text-xs mt-4" style={{ color: "var(--text-faint)" }}>
          Acesso válido por 30 minutos nesta sessão.
        </p>
      </div>
    </div>
  )
}
