import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"

export const metadata: Metadata = { title: "Changelog" }

const releases = [
  {
    version: "1.3.0",
    date: "2026-03-01",
    badge: "novo",
    changes: [
      { type: "feature", text: "Motor de análise de IA com detecção de padrões em 5 categorias" },
      { type: "feature", text: "Score financeiro com histórico de evolução" },
      { type: "feature", text: "Exportação de relatórios em PDF" },
      { type: "improve", text: "Performance do processamento de extratos 3x mais rápida" },
    ],
  },
  {
    version: "1.2.0",
    date: "2026-02-15",
    badge: null,
    changes: [
      { type: "feature", text: "Plano de ação prioritizado com status de progresso" },
      { type: "feature", text: "Detecção de pagamentos duplicados" },
      { type: "fix", text: "Correção no cálculo de economia potencial para extratos com mais de 500 linhas" },
    ],
  },
  {
    version: "1.1.0",
    date: "2026-02-01",
    badge: null,
    changes: [
      { type: "feature", text: "Dashboard com gráfico de despesas x receita" },
      { type: "feature", text: "Alertas automáticos de pressão de caixa" },
      { type: "improve", text: "Onboarding com personalização por tipo de negócio" },
    ],
  },
  {
    version: "1.0.0",
    date: "2026-01-15",
    badge: null,
    changes: [
      { type: "feature", text: "Lançamento do Lucro Oculto" },
      { type: "feature", text: "Upload e análise de extratos CSV/XLSX" },
      { type: "feature", text: "Detecção de vazamentos financeiros" },
    ],
  },
]

const typeColors: Record<string, { bg: string; text: string; label: string }> = {
  feature: { bg: "rgba(0,208,132,0.1)", text: "#00D084", label: "Novo" },
  improve: { bg: "rgba(59,130,246,0.1)", text: "#3B82F6", label: "Melhoria" },
  fix: { bg: "rgba(245,158,11,0.1)", text: "#F59E0B", label: "Correção" },
}

export default function ChangelogPage() {
  return (
    <div className="min-h-screen" style={{ background: "#0F1117" }}>
      <div className="px-6 py-16 max-w-2xl mx-auto">
        <div className="flex items-center gap-2 mb-10">
          <Link href="/" className="flex items-center hover:opacity-85 transition-opacity">
            <Image src="/logo.svg" alt="Lucro Oculto" width={140} height={36} />
          </Link>
          <span style={{ color: "#2A2D3A" }}>/</span>
          <span className="text-sm" style={{ color: "#8B8FA8" }}>Changelog</span>
        </div>

        <h1 className="text-3xl font-black mb-2" style={{ color: "#F4F4F5" }}>Changelog</h1>
        <p className="text-sm mb-10" style={{ color: "#8B8FA8" }}>Todas as novidades, melhorias e correções do Lucro Oculto.</p>

        <div className="space-y-8">
          {releases.map(release => (
            <div key={release.version} className="relative pl-6 border-l-2" style={{ borderColor: "#2A2D3A" }}>
              <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full" style={{ background: "#00D084" }} />
              <div className="flex items-center gap-3 mb-3">
                <span className="text-lg font-black" style={{ color: "#F4F4F5" }}>v{release.version}</span>
                {release.badge && (
                  <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: "rgba(0,208,132,0.15)", color: "#00D084" }}>
                    {release.badge}
                  </span>
                )}
                <span className="text-xs" style={{ color: "#4B4F6A" }}>
                  {new Date(release.date).toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" })}
                </span>
              </div>
              <div className="space-y-2">
                {release.changes.map((c, i) => {
                  const tc = typeColors[c.type]
                  return (
                    <div key={i} className="flex items-start gap-2.5">
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold mt-0.5 shrink-0" style={{ background: tc.bg, color: tc.text }}>
                        {tc.label}
                      </span>
                      <span className="text-sm" style={{ color: "#8B8FA8" }}>{c.text}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
