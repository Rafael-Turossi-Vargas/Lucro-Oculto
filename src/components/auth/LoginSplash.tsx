"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { useTheme } from "@/lib/theme"

type Props = { onDone: () => void }

const STATUS_STEPS = [
  { pct: 18,  text: "Verificando credenciais..." },
  { pct: 42,  text: "Carregando análises..."     },
  { pct: 68,  text: "Buscando insights..."       },
  { pct: 88,  text: "Preparando dashboard..."    },
  { pct: 100, text: "Tudo pronto!"               },
]

function SplashContent({ onDone }: Props) {
  const { theme } = useTheme()
  const isDark = theme === "dark"

  const [visible,  setVisible]  = useState(false)
  const [exiting,  setExiting]  = useState(false)
  const [stepIdx,  setStepIdx]  = useState(0)
  const [pct,      setPct]      = useState(0)
  const [done,     setDone]     = useState(false)

  // Fade-in on mount
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 30)
    return () => clearTimeout(t)
  }, [])

  // Cycle through status steps
  useEffect(() => {
    const timings = [300, 750, 1200, 1650, 2050]
    const timers = STATUS_STEPS.map((step, i) =>
      setTimeout(() => {
        setStepIdx(i)
        setPct(step.pct)
        if (step.pct === 100) setDone(true)
      }, timings[i])
    )
    return () => timers.forEach(clearTimeout)
  }, [])

  // Exit + navigate
  useEffect(() => {
    const t1 = setTimeout(() => setExiting(true), 2500)
    const t2 = setTimeout(onDone, 2950)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [onDone])

  const bg         = isDark ? "#070C12"                : "#FFFFFF"
  const cardBg     = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)"
  const cardBorder = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"
  const titleColor = isDark ? "#F1F5F9"                : "#0F172A"
  const subColor   = isDark ? "rgba(255,255,255,0.38)" : "rgba(15,23,42,0.48)"
  const trackBg    = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)"
  const pctColor   = isDark ? "rgba(255,255,255,0.5)"  : "rgba(0,0,0,0.4)"
  const ringA      = isDark ? "rgba(0,208,132,0.38)"   : "rgba(0,208,132,0.3)"
  const ringB      = isDark ? "rgba(0,208,132,0.18)"   : "rgba(0,208,132,0.15)"
  const bloomStop  = isDark ? "rgba(0,208,132,0.12)"   : "rgba(0,208,132,0.09)"

  return (
    <>
      {/* Permanent cover — same bg as splash, stays until component unmounts.
          Prevents the glass card from showing through when splash fades out. */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 99998,
          background: bg,
          pointerEvents: "none",
        }}
      />

    <div
      role="status"
      aria-label="Carregando Lucro Oculto"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: bg,
        opacity: exiting ? 0 : visible ? 1 : 0,
        transition: exiting
          ? "opacity 0.45s cubic-bezier(0.4,0,1,1)"
          : "opacity 0.25s ease",
        overflow: "hidden",
      }}
    >
      <style>{`
        @keyframes lo-barRise {
          from { transform: scaleY(0); opacity: 0; }
          to   { transform: scaleY(1); opacity: 1; }
        }
        .lo-bar {
          transform-box: fill-box;
          transform-origin: center bottom;
          transform: scaleY(0); opacity: 0;
          animation: lo-barRise 0.55s cubic-bezier(0.16,1,0.3,1) both;
        }
        .lo-bar-1 { animation-delay: 0.22s; }
        .lo-bar-2 { animation-delay: 0.38s; }
        .lo-bar-3 { animation-delay: 0.52s; }

        @keyframes lo-logoIn {
          from { opacity: 0; transform: scale(0.7) translateY(14px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        .lo-logo { animation: lo-logoIn 0.65s cubic-bezier(0.16,1,0.3,1) 0.06s both; }

        @keyframes lo-shimmer {
          0%   { transform: translateX(-110%) skewX(-12deg); }
          100% { transform: translateX(320%)  skewX(-12deg); }
        }
        .lo-shimmer {
          position: absolute; inset: 0;
          background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%);
          animation: lo-shimmer 1.6s ease 0.85s infinite;
          border-radius: inherit; pointer-events: none;
        }

        @keyframes lo-ring {
          0%   { transform: scale(1); opacity: 0.55; }
          100% { transform: scale(2.4); opacity: 0; }
        }
        .lo-ring-a { animation: lo-ring 2.2s ease-out 0.55s infinite; }
        .lo-ring-b { animation: lo-ring 2.2s ease-out 1.2s  infinite; }

        @keyframes lo-up {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .lo-title  { animation: lo-up 0.45s ease 0.5s  both; }
        .lo-card   { animation: lo-up 0.45s ease 0.75s both; }

        @keyframes lo-bloom {
          from { opacity: 0; transform: scale(0.55); }
          to   { opacity: 1; transform: scale(1); }
        }
        .lo-bloom { animation: lo-bloom 1.2s ease both; }

        @keyframes lo-check {
          0%   { opacity: 0; transform: scale(0.4) rotate(-15deg); }
          60%  { transform: scale(1.15) rotate(3deg); }
          100% { opacity: 1; transform: scale(1) rotate(0deg); }
        }
        .lo-check { animation: lo-check 0.5s cubic-bezier(0.16,1,0.3,1) both; }

        @keyframes lo-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        .lo-spin { animation: lo-spin 0.9s linear infinite; }

        @keyframes lo-statusIn {
          from { opacity: 0; transform: translateX(-6px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .lo-status { animation: lo-statusIn 0.25s ease both; }

        @keyframes lo-pctUp {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .lo-pct { animation: lo-pctUp 0.2s ease both; }
      `}</style>

      {/* Radial bloom */}
      <div
        className="lo-bloom"
        style={{
          position: "absolute",
          width: "min(680px, 150vw)",
          height: "min(680px, 150vw)",
          borderRadius: "50%",
          background: `radial-gradient(ellipse at center, ${bloomStop} 0%, transparent 65%)`,
          pointerEvents: "none",
        }}
      />
      {/* Corner glows */}
      <div style={{ position: "absolute", top: 0, left: 0, width: "220px", height: "220px", background: "radial-gradient(ellipse at 0% 0%, rgba(0,208,132,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: 0, right: 0, width: "220px", height: "220px", background: "radial-gradient(ellipse at 100% 100%, rgba(59,130,246,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />

      {/* ── Center stack ── */}
      <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center" }}>

        {/* Logo + rings */}
        <div style={{ position: "relative", marginBottom: "26px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div className="lo-ring-a" style={{ position: "absolute", inset: "-20px", borderRadius: "28px", border: `1.5px solid ${ringA}`, pointerEvents: "none" }} />
          <div className="lo-ring-b" style={{ position: "absolute", inset: "-20px", borderRadius: "28px", border: `1px solid ${ringB}`, pointerEvents: "none" }} />

          <div
            className="lo-logo"
            style={{
              position: "relative",
              width: "clamp(72px, 17vw, 88px)",
              height: "clamp(72px, 17vw, 88px)",
              borderRadius: "clamp(16px, 3.8vw, 20px)",
              overflow: "hidden",
              boxShadow: "0 0 0 1px rgba(0,208,132,0.28), 0 10px 40px rgba(0,208,132,0.22), 0 24px 56px rgba(0,0,0,0.5)",
            }}
          >
            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%", display: "block" }}>
              <defs>
                <clipPath id="lc-sp"><circle cx="20" cy="21" r="11" /></clipPath>
                <linearGradient id="bg-sp" x1="20" y1="32" x2="20" y2="10" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#006640" /><stop offset="100%" stopColor="#00FF99" />
                </linearGradient>
                <filter id="glow-sp" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="1.5" result="blur" />
                  <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
              </defs>
              <rect width="48" height="48" rx="12" fill="#0D0F14" />
              <rect width="48" height="48" rx="12" fill="none" stroke="#00D084" strokeOpacity="0.22" strokeWidth="1" />
              <circle cx="20" cy="21" r="11" fill="#07090E" />
              <g clipPath="url(#lc-sp)">
                <rect className="lo-bar lo-bar-1" x="13"    y="22" width="3.5" height="22" rx="1" fill="url(#bg-sp)" opacity="0.4" />
                <rect className="lo-bar lo-bar-2" x="18.25" y="17" width="3.5" height="27" rx="1" fill="url(#bg-sp)" opacity="0.68" />
                <rect className="lo-bar lo-bar-3" x="23.5"  y="12" width="3.5" height="32" rx="1" fill="url(#bg-sp)" />
              </g>
              <circle cx="20" cy="21" r="11" fill="none" stroke="#00D084" strokeWidth="1.8" filter="url(#glow-sp)" />
              <line x1="28.5" y1="29.5" x2="36.5" y2="37.5" stroke="#00D084" strokeWidth="2.4" strokeLinecap="round" />
            </svg>
            <div className="lo-shimmer" />
          </div>
        </div>

        {/* Brand */}
        <p
          className="lo-title"
          style={{
            fontSize: "clamp(19px, 5vw, 26px)",
            fontWeight: 800,
            letterSpacing: "-0.035em",
            color: titleColor,
            lineHeight: 1,
            marginBottom: "22px",
            textAlign: "center",
          }}
        >
          Lucro <span style={{ color: "#00D084" }}>Oculto</span>
        </p>

        {/* ── Status card ── */}
        <div
          className="lo-card"
          style={{
            width: "clamp(260px, 80vw, 320px)",
            borderRadius: "16px",
            background: cardBg,
            border: `1px solid ${cardBorder}`,
            padding: "16px 18px 14px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          {/* Icon + status text */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {/* Spinner or checkmark */}
            <div style={{ width: "18px", height: "18px", flexShrink: 0, position: "relative" }}>
              {done ? (
                <svg
                  className="lo-check"
                  viewBox="0 0 18 18"
                  fill="none"
                  style={{ width: "18px", height: "18px" }}
                >
                  <circle cx="9" cy="9" r="9" fill="rgba(0,208,132,0.15)" />
                  <path d="M5 9.5l2.5 2.5 5-5" stroke="#00D084" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <svg className="lo-spin" viewBox="0 0 18 18" fill="none" style={{ width: "18px", height: "18px" }}>
                  <circle cx="9" cy="9" r="7" stroke={isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"} strokeWidth="2" />
                  <path d="M9 2a7 7 0 0 1 7 7" stroke="#00D084" strokeWidth="2" strokeLinecap="round" />
                </svg>
              )}
            </div>

            {/* Status text — re-renders on step change via key */}
            <p
              key={stepIdx}
              className="lo-status"
              style={{
                fontSize: "13px",
                fontWeight: 600,
                color: done ? "#00D084" : subColor,
                lineHeight: 1.3,
                flex: 1,
              }}
            >
              {STATUS_STEPS[stepIdx].text}
            </p>

            {/* Percentage */}
            <span
              key={`pct-${pct}`}
              className="lo-pct"
              style={{ fontSize: "12px", fontWeight: 700, color: pctColor, flexShrink: 0 }}
            >
              {pct}%
            </span>
          </div>

          {/* Progress bar */}
          <div style={{ height: "4px", borderRadius: "99px", background: trackBg, overflow: "hidden" }}>
            <div
              style={{
                height: "100%",
                borderRadius: "99px",
                width: `${pct}%`,
                background: done
                  ? "linear-gradient(90deg, #00A86B, #00FF99)"
                  : "linear-gradient(90deg, #00A86B, #00D084)",
                boxShadow: "0 0 8px rgba(0,208,132,0.6)",
                transition: "width 0.45s cubic-bezier(0.25,0.46,0.45,0.94)",
              }}
            />
          </div>

          {/* Step dots */}
          <div style={{ display: "flex", justifyContent: "center", gap: "5px" }}>
            {STATUS_STEPS.map((_, i) => (
              <div
                key={i}
                style={{
                  width: i === stepIdx ? "16px" : "5px",
                  height: "5px",
                  borderRadius: "99px",
                  background: i <= stepIdx ? "#00D084" : (isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)"),
                  transition: "width 0.3s ease, background 0.3s ease",
                  boxShadow: i === stepIdx ? "0 0 6px rgba(0,208,132,0.5)" : "none",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
    </>
  )
}

export function LoginSplash({ onDone }: Props) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return null
  return createPortal(<SplashContent onDone={onDone} />, document.body)
}
