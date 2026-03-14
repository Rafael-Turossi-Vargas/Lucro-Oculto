"use client"

import { useSession } from "next-auth/react"
import { useState } from "react"
import Link from "next/link"
import { Zap, X } from "lucide-react"

export function TrialBanner() {
  const { data: session } = useSession()
  const [dismissed, setDismissed] = useState(false)

  const plan = (session?.user as { plan?: string })?.plan ?? "free"
  const trialEndsAt = (session?.user as { trialEndsAt?: string | null })?.trialEndsAt ?? null

  const isTrial = plan === "pro" && trialEndsAt !== null
  const daysLeft = trialEndsAt
    ? Math.max(0, Math.ceil((new Date(trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0

  if (!isTrial || dismissed || daysLeft <= 0) return null

  const isUrgent = daysLeft <= 2

  return (
    <div
      className="flex items-center justify-between gap-3 px-4 py-3 mb-6 rounded-xl"
      style={{
        background: isUrgent ? "rgba(245,158,11,0.08)" : "rgba(0,208,132,0.06)",
        border: `1px solid ${isUrgent ? "rgba(245,158,11,0.25)" : "rgba(0,208,132,0.2)"}`,
      }}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{
            background: isUrgent ? "rgba(245,158,11,0.12)" : "rgba(0,208,132,0.12)",
          }}
        >
          <Zap className="w-4 h-4" style={{ color: isUrgent ? "#F59E0B" : "#00D084" }} />
        </div>

        <div className="min-w-0">
          <p className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>
            {isUrgent
              ? `⚠️ Seu trial Pro acaba em ${daysLeft} dia${daysLeft === 1 ? "" : "s"}!`
              : `🎉 Você está no Trial Pro — ${daysLeft} dias restantes`}
          </p>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            {isUrgent
              ? "Assine agora para não perder acesso às análises ilimitadas."
              : "Aproveite todas as funcionalidades Pro durante o período gratuito."}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Link
          href="/app/settings?tab=plan"
          className="text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
          style={{
            background: isUrgent ? "#F59E0B" : "#00D084",
            color: "var(--bg-page)",
          }}
        >
          Assinar Pro
        </Link>
        <button
          onClick={() => setDismissed(true)}
          className="p-1 rounded-lg transition-colors hover:bg-white/5"
          style={{ color: "var(--text-faint)" }}
          aria-label="Fechar"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
