import Link from "next/link"
import { ArrowLeft, TrendingDown, Zap, Star } from "lucide-react"
import { ThemeLogo } from "@/components/ui/theme-logo"

const leaks = [
  { label: "Assinaturas duplicadas", amount: "R$890" },
  { label: "Custo de marketing +43%", amount: "R$1.240" },
  { label: "Software sem uso detectado", amount: "R$670" },
]

const stats = [
  { value: "R$2,8M+", label: "Desperdício encontrado" },
  { value: "1.240+", label: "Empresas analisadas" },
  { value: "+34pts", label: "Melhora no score" },
]

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex" style={{ background: "var(--bg-page)" }}>

      {/* ─── LEFT PANEL ─────────────────────────────────────────── */}
      <div
        className="hidden lg:flex lg:w-[52%] flex-col relative overflow-hidden"
        style={{
          background: "var(--bg-subtle)",
          borderRight: "1px solid var(--border)",
        }}
      >
        {/* Green radial bloom — top left */}
        <div
          className="absolute top-0 left-0 pointer-events-none"
          style={{
            width: "520px",
            height: "420px",
            background: "radial-gradient(ellipse at 15% 0%, rgba(0,208,132,0.13) 0%, transparent 60%)",
          }}
        />
        {/* Bottom-right accent */}
        <div
          className="absolute bottom-0 right-0 pointer-events-none"
          style={{
            width: "320px",
            height: "320px",
            background: "radial-gradient(ellipse at 100% 100%, rgba(0,208,132,0.07) 0%, transparent 70%)",
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full px-10 py-10">

          {/* Logo */}
          <Link href="/" className="inline-flex hover:opacity-75 transition-opacity w-fit">
            <ThemeLogo width={140} height={35} priority />
          </Link>

          {/* Main content */}
          <div className="flex-1 flex flex-col justify-center gap-8 py-8">

            {/* Eyebrow badge */}
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full w-fit"
              style={{
                background: "rgba(0,208,132,0.1)",
                border: "1px solid rgba(0,208,132,0.25)",
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full animate-pulse shrink-0"
                style={{ background: "#00D084", boxShadow: "0 0 6px #00D084" }}
              />
              <span className="text-xs font-semibold" style={{ color: "#00D084" }}>
                Inteligência financeira para PMEs
              </span>
            </div>

            {/* Headline */}
            <div>
              <h2
                className="text-[2.15rem] font-extrabold leading-tight mb-3"
                style={{ color: "var(--text-primary)", letterSpacing: "-0.03em" }}
              >
                Descubra onde seu{" "}
                <span
                  style={{
                    background: "linear-gradient(90deg, #00D084 0%, #3FFFB0 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  dinheiro
                </span>{" "}
                está sumindo.
              </h2>
              <p className="text-[15px] leading-relaxed" style={{ color: "var(--text-muted)", maxWidth: "380px" }}>
                Suba o extrato bancário e receba um diagnóstico financeiro completo em menos de 60 segundos.
              </p>
            </div>

            {/* ── Dashboard preview card ──────────────────────────── */}
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                boxShadow: "0 4px 32px rgba(0,0,0,0.08)",
              }}
            >
              {/* Card header */}
              <div
                className="flex items-center justify-between px-4 py-3 border-b"
                style={{ borderColor: "var(--border)" }}
              >
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "var(--text-faint)" }}>
                    Análise Financeira
                  </p>
                  <p className="text-[13px] font-bold" style={{ color: "var(--text-primary)" }}>
                    Relatório · Fev–Mar 2025
                  </p>
                </div>
                <span
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold"
                  style={{ background: "rgba(0,208,132,0.1)", color: "#00D084", border: "1px solid rgba(0,208,132,0.2)" }}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#00D084" }} />
                  Concluído
                </span>
              </div>

              {/* Score row */}
              <div className="px-4 py-3 border-b" style={{ borderColor: "var(--border)" }}>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-[11px] font-medium" style={{ color: "var(--text-faint)" }}>Score de Eficiência</p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-3xl font-black leading-none" style={{ color: "#00D084" }}>87</p>
                      <p className="text-[11px] font-semibold" style={{ color: "var(--text-faint)" }}>/100</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: "rgba(0,208,132,0.08)", border: "1px solid rgba(0,208,132,0.15)" }}>
                    <TrendingDown className="w-3 h-3 rotate-180" style={{ color: "#00D084" }} />
                    <span className="text-[11px] font-bold" style={{ color: "#00D084" }}>+12pts</span>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: "87%",
                      background: "linear-gradient(90deg, #00A86B, #00FF99)",
                      boxShadow: "0 0 8px rgba(0,208,132,0.5)",
                    }}
                  />
                </div>
              </div>

              {/* Metric cards */}
              <div className="grid grid-cols-2 gap-2 p-3 border-b" style={{ borderColor: "var(--border)" }}>
                <div
                  className="rounded-xl p-3"
                  style={{ background: "rgba(255,77,79,0.06)", border: "1px solid rgba(255,77,79,0.15)" }}
                >
                  <p className="text-[10px] font-medium mb-1" style={{ color: "var(--text-faint)" }}>Vazamentos detectados</p>
                  <p className="text-xl font-black leading-none" style={{ color: "#FF4D4F" }}>R$2,8K</p>
                  <p className="text-[10px] mt-0.5 font-medium" style={{ color: "#FF4D4F" }}>3 fontes ativas</p>
                </div>
                <div
                  className="rounded-xl p-3"
                  style={{ background: "rgba(0,208,132,0.06)", border: "1px solid rgba(0,208,132,0.15)" }}
                >
                  <p className="text-[10px] font-medium mb-1" style={{ color: "var(--text-faint)" }}>Economia potencial</p>
                  <p className="text-xl font-black leading-none" style={{ color: "#00D084" }}>R$2,8K</p>
                  <p className="text-[10px] mt-0.5 font-medium" style={{ color: "#00D084" }}>por mês</p>
                </div>
              </div>

              {/* Leak items */}
              <div className="px-4 py-2">
                <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: "var(--text-faint)" }}>
                  Principais problemas
                </p>
                {leaks.map((leak, i) => (
                  <div
                    key={leak.label}
                    className="flex items-center justify-between py-1.5"
                    style={{ borderTop: i > 0 ? `1px solid var(--border)` : undefined }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "#FF4D4F" }} />
                      <span className="text-[12px]" style={{ color: "var(--text-muted)" }}>{leak.label}</span>
                    </div>
                    <span className="text-[12px] font-bold" style={{ color: "#FF4D4F" }}>
                      −{leak.amount}/mês
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Stats pills ─────────────────────────────────────── */}
            <div className="flex items-center gap-3 flex-wrap">
              {stats.map((s) => (
                <div
                  key={s.label}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl"
                  style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
                >
                  <Zap className="w-3.5 h-3.5 shrink-0" style={{ color: "#F59E0B" }} />
                  <span className="text-sm font-black" style={{ color: "var(--text-primary)" }}>{s.value}</span>
                  <span className="text-[11px]" style={{ color: "var(--text-faint)" }}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Testimonial ─────────────────────────────────────────── */}
          <div
            className="rounded-2xl p-4 flex items-start gap-3"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
            }}
          >
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
              style={{ background: "linear-gradient(135deg, #00D084 0%, #00B872 100%)", color: "#0A0C14" }}
            >
              MR
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex gap-0.5 mb-1.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-current" style={{ color: "#F59E0B" }} />
                ))}
              </div>
              <p className="text-[13px] leading-relaxed mb-2" style={{ color: "var(--text-muted)" }}>
                &ldquo;Em 3 minutos encontrou R$&nbsp;2.800/mês em assinaturas que eu nem sabia que existiam. Valeu na primeira semana.&rdquo;
              </p>
              <div>
                <p className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>Marcos Ribeiro</p>
                <p className="text-[11px]" style={{ color: "var(--text-faint)" }}>Sócio — Agência Digital, SP</p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ─── RIGHT PANEL ────────────────────────────────────────── */}
      <div
        className="flex-1 flex flex-col relative overflow-hidden"
        style={{ background: "var(--bg-page)" }}
      >
        {/* Subtle grid */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
            opacity: 0.35,
          }}
        />

        {/* Center green bloom behind the form */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{ paddingTop: "60px" }}
        >
          <div
            style={{
              width: "500px",
              height: "500px",
              background: "radial-gradient(ellipse at 50% 50%, rgba(0,208,132,0.07) 0%, transparent 65%)",
              filter: "blur(24px)",
            }}
          />
        </div>

        {/* Top nav */}
        <div className="relative z-10 flex items-center justify-between px-6 py-5">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium transition-opacity hover:opacity-70"
            style={{ color: "var(--text-faint)" }}
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao início
          </Link>

          {/* Live activity badge */}
          <div
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full"
            style={{
              background: "rgba(0,208,132,0.06)",
              border: "1px solid rgba(0,208,132,0.18)",
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ background: "#00D084", boxShadow: "0 0 6px #00D084" }}
            />
            <span className="text-xs font-medium" style={{ color: "var(--text-faint)" }}>
              <span style={{ color: "#00D084", fontWeight: 700 }}>47</span> empresas analisadas hoje
            </span>
          </div>
        </div>

        {/* Form area */}
        <div className="relative z-10 flex-1 flex items-center justify-center px-6 py-8">
          <div className="w-full max-w-[420px]">

            {/* Mobile logo */}
            <div className="lg:hidden flex justify-center mb-8">
              <Link href="/" className="inline-flex hover:opacity-80 transition-opacity">
                <ThemeLogo width={140} height={35} priority />
              </Link>
            </div>

            {/* Glass card */}
            <div
              className="relative rounded-2xl p-8"
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                boxShadow: "0 8px 48px rgba(0,0,0,0.08), 0 1px 0 rgba(255,255,255,0.06) inset",
              }}
            >
              {/* Top spotlight line */}
              <div
                className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px rounded-full"
                style={{ background: "linear-gradient(90deg, transparent, rgba(0,208,132,0.45), transparent)" }}
              />

              {children}

              {/* Bottom line */}
              <div
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-px"
                style={{ background: "linear-gradient(90deg, transparent, rgba(0,208,132,0.12), transparent)" }}
              />
            </div>

            {/* Trust note */}
            <p className="text-center mt-4 text-[11px]" style={{ color: "var(--text-faint)" }}>
              Dados protegidos por criptografia AES-256 · Conformidade LGPD
            </p>
          </div>
        </div>
      </div>

    </div>
  )
}
