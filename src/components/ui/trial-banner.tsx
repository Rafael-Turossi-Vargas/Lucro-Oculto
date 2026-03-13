"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { X } from "lucide-react"
import { useSession } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"

export function TrialBanner() {
  const { data: session } = useSession()
  const [dismissed, setDismissed] = useState(true) // start hidden to avoid flash

  const user = session?.user as { plan?: string; trialEndsAt?: string | null } | undefined
  const plan = user?.plan
  const trialEndsAt = user?.trialEndsAt ?? null

  const daysLeft = trialEndsAt
    ? Math.max(0, Math.ceil((new Date(trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0

  const shouldShow = plan === "pro" && trialEndsAt !== null && daysLeft > 0

  useEffect(() => {
    if (!shouldShow) return
    const isDismissed = localStorage.getItem("trial-banner-dismissed") === "true"
    if (!isDismissed) {
      setDismissed(false)
    }
  }, [shouldShow])

  function handleDismiss() {
    localStorage.setItem("trial-banner-dismissed", "true")
    setDismissed(true)
  }

  if (!shouldShow) return null

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="relative w-full flex flex-wrap items-center justify-center gap-3 px-4 pr-10 py-2.5 text-sm"
          style={{
            background: "linear-gradient(90deg, rgba(245,158,11,0.10) 0%, rgba(0,208,132,0.10) 100%)",
            borderBottom: "1px solid rgba(245,158,11,0.20)",
          }}
        >
          <span style={{ color: "#F4F4F5" }}>
            ⚡ Seu trial Pro expira em{" "}
            <span className="font-bold" style={{ color: "#F59E0B" }}>
              {daysLeft} dia{daysLeft !== 1 ? "s" : ""}
            </span>{" "}
            — garanta análises ilimitadas
          </span>
          <Link
            href="/app/settings#upgrade"
            className="font-bold text-xs px-3 py-1 rounded-lg transition-all hover:opacity-80"
            style={{ color: "#00D084", background: "rgba(0,208,132,0.10)", border: "1px solid rgba(0,208,132,0.20)" }}
          >
            Fazer upgrade →
          </Link>
          <button
            onClick={handleDismiss}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-white/5 transition-colors"
            style={{ color: "#4B4F6A" }}
            aria-label="Fechar"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
