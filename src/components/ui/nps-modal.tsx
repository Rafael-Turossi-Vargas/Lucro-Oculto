"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"

export function NpsModal() {
  const [show, setShow] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [selected, setSelected] = useState<number | null>(null)

  useEffect(() => {
    const alreadySubmitted = localStorage.getItem("nps-submitted")
    const dismissedUntil = localStorage.getItem("nps-dismissed-until")

    if (alreadySubmitted) return
    if (dismissedUntil && new Date(dismissedUntil) > new Date()) return

    // Show after 7 days or immediately if first-use-at is old enough
    const firstUse = localStorage.getItem("nps-first-use")
    if (!firstUse) {
      localStorage.setItem("nps-first-use", new Date().toISOString())
      return
    }

    const daysSince = (Date.now() - new Date(firstUse).getTime()) / (1000 * 60 * 60 * 24)
    if (daysSince >= 7) {
      const timer = setTimeout(() => setShow(true), 3000)
      return () => clearTimeout(timer)
    }
  }, [])

  function handleScore(score: number) {
    setSelected(score)
    fetch("/api/nps", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ score }) }).catch(() => {})
    setSubmitted(true)
    localStorage.setItem("nps-submitted", "true")
    setTimeout(() => setShow(false), 2000)
  }

  function handleDismiss() {
    const until = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    localStorage.setItem("nps-dismissed-until", until)
    setShow(false)
  }

  if (!show) return null

  return (
    <div className="fixed bottom-6 right-6 z-50 w-80 rounded-2xl shadow-2xl p-5" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
      <button onClick={handleDismiss} className="absolute top-3 right-3 p-1 rounded-lg hover:bg-[var(--bg-subtle)]" style={{ color: "var(--text-faint)" }}>
        <X className="w-3.5 h-3.5" />
      </button>

      {submitted ? (
        <div className="text-center py-2">
          <p className="text-2xl mb-2">🎉</p>
          <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Obrigado pelo feedback!</p>
          <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Isso nos ajuda a melhorar o produto.</p>
        </div>
      ) : (
        <>
          <p className="text-sm font-semibold mb-1 pr-4" style={{ color: "var(--text-primary)" }}>
            De 0 a 10, quanto você recomendaria o Lucro Oculto?
          </p>
          <p className="text-xs mb-4" style={{ color: "var(--text-faint)" }}>0 = Jamais recomendaria · 10 = Com certeza</p>
          <div className="grid grid-cols-11 gap-1 mb-3">
            {Array.from({ length: 11 }, (_, i) => (
              <button
                key={i}
                onClick={() => handleScore(i)}
                className="py-1.5 rounded-lg text-xs font-bold transition-all hover:scale-110"
                style={{
                  background: selected === i ? "#00D084" : "var(--bg-subtle)",
                  color: selected === i ? "var(--bg-page)" : "var(--text-muted)",
                  border: "1px solid var(--border)",
                }}
              >
                {i}
              </button>
            ))}
          </div>
          <button onClick={handleDismiss} className="text-xs w-full text-center hover:underline" style={{ color: "var(--text-faint)" }}>
            Agora não
          </button>
        </>
      )}
    </div>
  )
}
