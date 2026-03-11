import { ImageResponse } from "next/og"

export const runtime = "edge"
export const alt = "Lucro Oculto — Auditor Financeiro para PMEs"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default async function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0F1117",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background grid */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(42,45,58,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(42,45,58,0.5) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
            opacity: 0.4,
          }}
        />

        {/* Radial green glow */}
        <div
          style={{
            position: "absolute",
            bottom: -120,
            left: "50%",
            transform: "translateX(-50%)",
            width: 900,
            height: 500,
            background: "radial-gradient(ellipse, rgba(0,208,132,0.18) 0%, transparent 70%)",
            borderRadius: "50%",
          }}
        />

        {/* Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            zIndex: 10,
            padding: "60px 80px",
            textAlign: "center",
          }}
        >
          {/* Logo row */}
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 40 }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 16,
                background: "rgba(0,208,132,0.12)",
                border: "1px solid rgba(0,208,132,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {/* Simple chart icon */}
              <div style={{ display: "flex", alignItems: "flex-end", gap: 4, padding: "8px 10px" }}>
                <div style={{ width: 8, height: 18, background: "rgba(0,208,132,0.4)", borderRadius: 2 }} />
                <div style={{ width: 8, height: 26, background: "rgba(0,208,132,0.7)", borderRadius: 2 }} />
                <div style={{ width: 8, height: 34, background: "#00D084", borderRadius: 2 }} />
              </div>
            </div>
            <span style={{ fontSize: 28, fontWeight: 700, color: "#F4F4F5", letterSpacing: "-0.5px" }}>
              Lucro <span style={{ color: "#00D084" }}>Oculto</span>
            </span>
          </div>

          {/* Main headline */}
          <div
            style={{
              fontSize: 62,
              fontWeight: 900,
              color: "#F4F4F5",
              lineHeight: 1.05,
              letterSpacing: "-2px",
              marginBottom: 24,
            }}
          >
            Descubra onde sua empresa<br />
            <span style={{ color: "#00D084" }}>está perdendo dinheiro.</span>
          </div>

          {/* Subtitle */}
          <div
            style={{
              fontSize: 24,
              color: "#8B8FA8",
              lineHeight: 1.5,
              marginBottom: 48,
              maxWidth: 700,
            }}
          >
            Diagnóstico financeiro inteligente para PMEs. Resultado em 60 segundos.
          </div>

          {/* Stats row */}
          <div style={{ display: "flex", alignItems: "center", gap: 48 }}>
            {[
              { v: "R$ 2,8M+", l: "em desperdício identificado" },
              { v: "1.240+", l: "empresas analisadas" },
              { v: "7 dias", l: "Pro grátis ao criar conta" },
            ].map((s, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <span style={{ fontSize: 28, fontWeight: 800, color: "#F4F4F5" }}>{s.v}</span>
                <span style={{ fontSize: 14, color: "#4B4F6A", marginTop: 4 }}>{s.l}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 4,
            background: "linear-gradient(90deg, transparent, #00D084, transparent)",
          }}
        />
      </div>
    ),
    { ...size }
  )
}
