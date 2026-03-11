"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight, AlertTriangle, Zap } from "lucide-react"

function useCountUp(target: number, duration = 1400, startDelay = 400) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    const timeout = setTimeout(() => {
      const steps = Math.ceil(duration / 16)
      const increment = target / steps
      let current = 0
      const timer = setInterval(() => {
        current = Math.min(current + increment, target)
        setValue(Math.round(current))
        if (current >= target) clearInterval(timer)
      }, 16)
      return () => clearInterval(timer)
    }, startDelay)
    return () => clearTimeout(timeout)
  }, [target, duration, startDelay])
  return value
}

const stats = [
  { value: "R$ 2,8M", label: "em desperdício identificado" },
  { value: "1.240+", label: "empresas analisadas" },
  { value: "34pts", label: "melhora média no score" },
]

function DashboardMock() {
  const score = useCountUp(67, 1600, 600)
  const saving = useCountUp(4200, 1800, 800)

  return (
    <div
      className="relative w-full max-w-lg mx-auto"
      style={{ perspective: "1000px" }}
    >
      <div
        className="absolute inset-0 rounded-2xl blur-3xl opacity-20"
        style={{ background: "linear-gradient(135deg, #00D084 0%, #3B82F6 100%)" }}
      />

      <div
        className="relative rounded-2xl overflow-hidden"
        style={{
          background: "#1A1D27",
          border: "1px solid #2A2D3A",
          boxShadow: "0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)",
          transform: "rotateX(2deg) rotateY(-2deg)",
        }}
      >
        <div
          className="flex items-center gap-2 px-4 py-3"
          style={{ background: "#212435", borderBottom: "1px solid #2A2D3A" }}
        >
          <div className="flex gap-1.5">
            {["#FF4D4F", "#F59E0B", "#00D084"].map((color, index) => (
              <div
                key={index}
                className="w-3 h-3 rounded-full"
                style={{ background: color, opacity: 0.7 }}
              />
            ))}
          </div>
          <div
            className="flex-1 rounded-md h-5 text-xs px-3 flex items-center"
            style={{ background: "#2A2D3A", color: "#4B4F6A" }}
          >
            lucrooculto.com/app/dashboard
          </div>
        </div>

        <div className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div
              className="rounded-xl p-3"
              style={{
                background: "#212435",
                border: "1px solid rgba(0,208,132,0.2)",
              }}
            >
              <p className="text-xs mb-1" style={{ color: "#8B8FA8" }}>
                Score de Eficiência
              </p>
              <div className="flex items-baseline gap-1">
                <span
                  className="text-2xl font-bold font-mono tabular-nums"
                  style={{ color: "#00D084" }}
                >
                  {score}
                </span>
                <span className="text-xs" style={{ color: "#4B4F6A" }}>
                  /100
                </span>
              </div>
              <p className="text-xs mt-0.5" style={{ color: "#F59E0B" }}>
                ⚠ Atenção
              </p>
            </div>

            <div
              className="rounded-xl p-3"
              style={{
                background:
                  "linear-gradient(135deg, rgba(0,208,132,0.08) 0%, rgba(0,168,107,0.04) 100%)",
                border: "1px solid rgba(0,208,132,0.15)",
              }}
            >
              <p className="text-xs mb-1" style={{ color: "#8B8FA8" }}>
                Economia potencial
              </p>
              <p
                className="text-sm font-bold leading-tight"
                style={{ color: "#00D084" }}
              >
                R$ {saving.toLocaleString("pt-BR")}
              </p>
              <p className="text-xs" style={{ color: "#4B4F6A" }}>
                – R$ 7.800 / mês
              </p>
            </div>
          </div>

          <div
            className="rounded-xl p-3"
            style={{ background: "#212435", border: "1px solid #2A2D3A" }}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium" style={{ color: "#F4F4F5" }}>
                Vazamentos Detectados
              </p>
              <span
                className="text-xs px-1.5 py-0.5 rounded-full font-medium"
                style={{
                  background: "rgba(255,77,79,0.15)",
                  color: "#FF4D4F",
                }}
              >
                5
              </span>
            </div>

            {[
              { icon: "🔄", text: "Assinaturas sobrepostas", val: "R$ 380/mês" },
              { icon: "📈", text: "Custo de marketing +43%", val: "R$ 1.200/mês" },
              { icon: "💳", text: "Ferramentas subutilizadas", val: "R$ 290/mês" },
            ].map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-1.5"
                style={{
                  borderTop: index > 0 ? "1px solid #2A2D3A" : undefined,
                }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm">{item.icon}</span>
                  <span className="text-xs" style={{ color: "#8B8FA8" }}>
                    {item.text}
                  </span>
                </div>
                <span className="text-xs font-medium" style={{ color: "#FF4D4F" }}>
                  {item.val}
                </span>
              </div>
            ))}
          </div>

          <div
            className="rounded-lg px-3 py-2 flex items-center gap-2"
            style={{
              background: "rgba(245,158,11,0.08)",
              border: "1px solid rgba(245,158,11,0.2)",
            }}
          >
            <AlertTriangle
              className="w-3.5 h-3.5 shrink-0"
              style={{ color: "#F59E0B" }}
            />
            <p className="text-xs" style={{ color: "#F4F4F5" }}>
              Seu caixa pode entrar em pressão em{" "}
              <strong style={{ color: "#F59E0B" }}>22 dias</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export function Hero() {
  return (
    <section
      className="relative min-h-screen flex items-center pt-16 overflow-hidden"
      style={{ background: "#0F1117" }}
    >
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "linear-gradient(rgba(42,45,58,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(42,45,58,0.5) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] opacity-20 blur-3xl"
        style={{ background: "radial-gradient(ellipse, #00D084 0%, transparent 70%)" }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="text-center lg:text-left">
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6 animate-fade-in"
              style={{
                background: "rgba(0,208,132,0.08)",
                border: "1px solid rgba(0,208,132,0.2)",
              }}
            >
              <Zap className="w-3.5 h-3.5" style={{ color: "#00D084" }} />
              <span className="text-xs font-medium" style={{ color: "#00D084" }}>
                Diagnóstico financeiro inteligente
              </span>
            </div>

            <h1
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight mb-6 animate-slide-up stagger-1"
              style={{ color: "#F4F4F5", letterSpacing: "-0.03em" }}
            >
              Descubra onde sua empresa está{" "}
              <span style={{ color: "#00D084" }}>perdendo dinheiro.</span>
            </h1>

            <p
              className="text-lg sm:text-xl mb-8 leading-relaxed max-w-xl mx-auto lg:mx-0 animate-slide-up stagger-2"
              style={{ color: "#8B8FA8" }}
            >
              Analise despesas, assinaturas, fornecedores e padrões financeiros
              para encontrar vazamentos e aumentar o lucro — sem contratar um consultor.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start animate-slide-up stagger-3">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-base transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: "#00D084",
                  color: "#0F1117",
                  boxShadow: "0 0 24px rgba(0,208,132,0.3)",
                }}
              >
                Fazer diagnóstico grátis
                <ArrowRight className="w-4 h-4" />
              </Link>

              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-medium text-base transition-all duration-200 hover:border-opacity-80"
                style={{
                  color: "#F4F4F5",
                  border: "1px solid #2A2D3A",
                  background: "transparent",
                }}
              >
                Ver como funciona
              </a>
            </div>

            <p
              className="mt-4 text-xs animate-fade-in stagger-4"
              style={{ color: "#4B4F6A" }}
            >
              Plano Free sem cartão · Trial Pro 7 dias com cartão, sem cobrança · Cancele quando quiser
            </p>

            <div
              className="mt-10 grid grid-cols-3 gap-4 pt-8 border-t animate-slide-up stagger-5"
              style={{ borderColor: "#2A2D3A" }}
            >
              {stats.map((stat, index) => (
                <div key={index} className="text-center lg:text-left">
                  <p
                    className="text-xl sm:text-2xl font-bold font-mono"
                    style={{ color: "#F4F4F5" }}
                  >
                    {stat.value}
                  </p>
                  <p className="text-xs" style={{ color: "#8B8FA8" }}>
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="animate-scale-in stagger-3">
            <DashboardMock />
          </div>
        </div>
      </div>
    </section>
  )
}