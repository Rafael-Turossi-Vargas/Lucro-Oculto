import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, TrendingDown, ShieldCheck, Zap, BarChart3, Star } from "lucide-react"

const features = [
  { icon: TrendingDown, label: "Detecção de vazamentos financeiros em tempo real" },
  { icon: BarChart3, label: "Score de eficiência com plano de ação priorizado" },
  { icon: Zap, label: "Diagnóstico completo em menos de 60 segundos" },
  { icon: ShieldCheck, label: "Dados criptografados — nunca compartilhados" },
]

const stats = [
  { value: "R$ 2,8M+", label: "Desperdício encontrado" },
  { value: "1.240+", label: "Empresas analisadas" },
  { value: "34pts", label: "Melhora no score" },
]

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">

      {/* ─── LEFT PANEL ─── */}
      <div
        className="hidden lg:flex lg:w-[52%] flex-col relative overflow-hidden"
        style={{ background: "#070910" }}
      >
        {/* Grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(42,45,58,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(42,45,58,0.35) 1px, transparent 1px)",
            backgroundSize: "52px 52px",
          }}
        />
        {/* Top glow */}
        <div
          className="absolute top-0 left-0 right-0 pointer-events-none"
          style={{
            height: "500px",
            background: "radial-gradient(ellipse at 30% 0%, rgba(0,208,132,0.12) 0%, transparent 65%)",
          }}
        />
        {/* Bottom glow */}
        <div
          className="absolute bottom-0 right-0 pointer-events-none"
          style={{
            width: "400px",
            height: "400px",
            background: "radial-gradient(ellipse at 100% 100%, rgba(59,130,246,0.07) 0%, transparent 65%)",
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full p-10">
          {/* Logo */}
          <Link href="/" className="inline-flex hover:opacity-80 transition-opacity">
            <Image src="/logo.svg" alt="Lucro Oculto" width={152} height={38} priority />
          </Link>

          {/* Main content */}
          <div className="flex-1 flex flex-col justify-center py-10">
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6 w-fit"
              style={{ background: "rgba(0,208,132,0.08)", border: "1px solid rgba(0,208,132,0.2)" }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#00D084", boxShadow: "0 0 6px #00D084" }} />
              <span className="text-xs font-semibold" style={{ color: "#00D084" }}>
                Diagnóstico financeiro inteligente para PMEs
              </span>
            </div>

            <h2
              className="text-4xl font-extrabold leading-tight mb-4"
              style={{ color: "#F4F4F5", letterSpacing: "-0.03em" }}
            >
              Pare de perder{" "}
              <span
                style={{
                  background: "linear-gradient(90deg, #00D084 0%, #3FFFB0 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                dinheiro invisível.
              </span>
            </h2>
            <p className="text-base mb-8 leading-relaxed" style={{ color: "#8B8FA8", maxWidth: "400px" }}>
              Suba seu extrato e descubra exatamente onde sua empresa está sangrando — em menos de 1 minuto.
            </p>

            {/* Stats strip */}
            <div
              className="grid grid-cols-3 gap-3 mb-8 p-4 rounded-2xl"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              {stats.map((s) => (
                <div key={s.label} className="text-center">
                  <p className="text-xl font-bold font-mono" style={{ color: "#F4F4F5" }}>{s.value}</p>
                  <p className="text-[11px] mt-0.5" style={{ color: "#4B4F6A" }}>{s.label}</p>
                </div>
              ))}
            </div>

            {/* Features list */}
            <div className="space-y-3">
              {features.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-3">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: "rgba(0,208,132,0.08)", border: "1px solid rgba(0,208,132,0.15)" }}
                  >
                    <Icon className="w-3.5 h-3.5" style={{ color: "#00D084" }} />
                  </div>
                  <span className="text-sm" style={{ color: "#8B8FA8" }}>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Testimonial */}
          <div
            className="rounded-2xl p-4"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <div className="flex gap-0.5 mb-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-current" style={{ color: "#F59E0B" }} />
              ))}
            </div>
            <p className="text-sm leading-relaxed mb-3" style={{ color: "#8B8FA8" }}>
              &ldquo;Em 3 minutos o sistema encontrou R$&nbsp;2.800/mês em assinaturas que eu nem sabia que existiam. Valeu o investimento na primeira semana.&rdquo;
            </p>
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ background: "linear-gradient(135deg, #00D084 0%, #00B872 100%)", color: "#0A0C14" }}
              >
                MR
              </div>
              <div>
                <p className="text-xs font-semibold" style={{ color: "#D4D4D8" }}>Marcos Ribeiro</p>
                <p className="text-[11px]" style={{ color: "#4B4F6A" }}>Sócio — Agência Digital, SP</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── VERTICAL SEPARATOR ─── */}
      <div
        className="hidden lg:block w-px shrink-0 relative"
        style={{ background: "linear-gradient(180deg, transparent 0%, #2A2D3A 20%, rgba(0,208,132,0.3) 50%, #2A2D3A 80%, transparent 100%)" }}
      />

      {/* ─── RIGHT PANEL ─── */}
      <div
        className="flex-1 flex flex-col relative overflow-hidden"
        style={{ background: "#0A0C14" }}
      >
        {/* Background grid (subtle, different density) */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.08]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(42,45,58,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(42,45,58,0.8) 1px, transparent 1px)",
            backgroundSize: "36px 36px",
          }}
        />

        {/* Center glow behind the form */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{ paddingTop: "60px" }}
        >
          <div
            style={{
              width: "480px",
              height: "480px",
              background: "radial-gradient(ellipse at 50% 50%, rgba(0,208,132,0.07) 0%, transparent 65%)",
              filter: "blur(20px)",
            }}
          />
        </div>

        {/* Top-right accent glow */}
        <div
          className="absolute top-0 right-0 pointer-events-none"
          style={{
            width: "250px",
            height: "250px",
            background: "radial-gradient(ellipse at 100% 0%, rgba(59,130,246,0.06) 0%, transparent 70%)",
          }}
        />

        {/* Back link */}
        <div className="relative z-10 flex items-center justify-between p-5 pb-0">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm transition-opacity hover:opacity-80"
            style={{ color: "#4B4F6A" }}
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao início
          </Link>

          {/* Live activity badge */}
          <div
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full"
            style={{
              background: "rgba(0,208,132,0.06)",
              border: "1px solid rgba(0,208,132,0.15)",
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ background: "#00D084", boxShadow: "0 0 6px #00D084" }}
            />
            <span className="text-xs font-medium" style={{ color: "#4B4F6A" }}>
              <span style={{ color: "#00D084", fontWeight: 700 }}>47</span> empresas analisadas hoje
            </span>
          </div>
        </div>

        {/* Form area */}
        <div className="relative z-10 flex-1 flex items-center justify-center px-6 py-10">
          <div className="w-full max-w-[420px]">

            {/* Mobile logo */}
            <div className="lg:hidden flex justify-center mb-8">
              <Link href="/" className="inline-flex hover:opacity-80 transition-opacity">
                <Image src="/logo.svg" alt="Lucro Oculto" width={152} height={38} priority />
              </Link>
            </div>

            {/* Glass card wrapper */}
            <div
              className="relative rounded-2xl p-8"
              style={{
                background: "linear-gradient(145deg, rgba(26,29,39,0.9) 0%, rgba(15,17,23,0.95) 100%)",
                border: "1px solid rgba(255,255,255,0.07)",
                boxShadow: "0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,208,132,0.05), inset 0 1px 0 rgba(255,255,255,0.05)",
                backdropFilter: "blur(12px)",
              }}
            >
              {/* Top gradient line (spotlight) */}
              <div
                className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px rounded-full"
                style={{ background: "linear-gradient(90deg, transparent, rgba(0,208,132,0.5), transparent)" }}
              />

              {children}

              {/* Bottom gradient line */}
              <div
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-px"
                style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent)" }}
              />
            </div>

            {/* Below-card trust note */}
            <p className="text-center mt-4 text-xs" style={{ color: "#2A2D3A" }}>
              Dados protegidos por criptografia AES-256 · Conformidade LGPD
            </p>
          </div>
        </div>
      </div>

    </div>
  )
}
