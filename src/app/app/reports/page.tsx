"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { FileText, Download, CheckCircle, Upload, RefreshCw, Check, Link2, Crown, Sparkles } from "lucide-react"
import { useAnalysisData } from "@/hooks/useAnalysisData"
import { CardSkeleton } from "@/components/ui/skeletons"
import { can } from "@/lib/roles"

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })
}

type ReportStatus = "idle" | "generating" | "done" | "error"
type Report = {
  id: string
  title: string
  status: string
  createdAt: string
  fileUrl: string | null
}

const REPORT_ITEMS = [
  "Resumo executivo com score e KPIs",
  "Lista completa de vazamentos financeiros",
  "Oportunidades de economia priorizadas",
  "Análise por categoria de despesa",
  "Top fornecedores e concentração de gastos",
  "Plano de ação recomendado",
]

export default function ReportsPage() {
  const { data: dashData, loading: dashLoading } = useAnalysisData()
  const { data: session } = useSession()
  const canUpload = can(session?.user?.role ?? "", "upload:create")
  const canGenerate = can(session?.user?.role ?? "", "reports:generate")
  const [status, setStatus] = useState<ReportStatus>("idle")
  const [reports, setReports] = useState<Report[]>([])
  const [loadingReports, setLoadingReports] = useState(true)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const fetchReports = () => {
    fetch("/api/reports")
      .then(r => r.json())
      .then(d => setReports(Array.isArray(d) ? (d as Report[]) : []))
      .catch(() => {})
      .finally(() => setLoadingReports(false))
  }

  useEffect(() => { fetchReports() }, [])

  const handleGenerate = async () => {
    if (!dashData?.analysis?.id) return
    setStatus("generating")
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ analysisId: dashData.analysis.id }),
      })
      if (!res.ok) throw new Error("Falha ao gerar")
      setStatus("done")
      fetchReports()
    } catch {
      setStatus("error")
    }
  }

  function copyLink(id: string) {
    navigator.clipboard.writeText(`${window.location.origin}/report/${id}`).then(() => {
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    })
  }

  if (dashLoading || loadingReports) {
    return (
      <div className="px-4 sm:px-6 py-6 sm:py-8 space-y-4">
        <CardSkeleton rows={1} />
        <CardSkeleton rows={5} />
      </div>
    )
  }

  return (
    <div className="px-4 sm:px-6 py-6 sm:py-8 space-y-6">

      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl shrink-0 mt-0.5"
          style={{ background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.18)" }}>
          <FileText className="w-5 h-5" style={{ color: "#3B82F6" }} />
        </div>
        <div>
          <h1 className="text-2xl font-black" style={{ color: "var(--text-primary)" }}>Relatórios</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
            Exporte um resumo completo da análise financeira
          </p>
        </div>
      </div>

      {/* Generate card */}
      {!dashData?.analysis ? (
        <div className="rounded-2xl p-12 text-center" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: "var(--bg-subtle)" }}>
            <FileText className="w-8 h-8" style={{ color: "var(--text-faint)" }} />
          </div>
          <p className="text-base font-semibold mb-1" style={{ color: "var(--text-primary)" }}>Nenhuma análise disponível</p>
          <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
            {canUpload
              ? "Faça upload do extrato bancário para gerar relatórios financeiros."
              : "Aguardando análise — o responsável pelo upload ainda não enviou dados."}
          </p>
          {canUpload && (
            <Link href="/app/upload" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm"
              style={{ background: "#00D084", color: "var(--bg-page)" }}>
              <Upload className="w-4 h-4" /> Fazer primeiro upload
            </Link>
          )}
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(0,208,132,0.2)" }}>
          {/* Card header */}
          <div className="p-6" style={{ background: "rgba(0,208,132,0.04)", borderBottom: "1px solid rgba(0,208,132,0.12)" }}>
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl shrink-0"
                style={{ background: "rgba(0,208,132,0.12)", border: "1px solid rgba(0,208,132,0.2)" }}>
                <FileText className="w-6 h-6" style={{ color: "#00D084" }} />
              </div>
              <div>
                <p className="text-base font-bold" style={{ color: "var(--text-primary)" }}>Relatório Completo de Análise</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                  Score: <span style={{ color: "#00D084", fontWeight: 700 }}>{dashData.analysis.score ?? "—"}/100</span>
                  {" "}· Gerado com dados reais da sua organização
                </p>
              </div>
            </div>
          </div>

          {/* Content items */}
          <div className="px-6 py-5" style={{ background: "var(--bg-card)" }}>
            <p className="text-[10px] font-bold uppercase tracking-wider mb-3" style={{ color: "var(--text-faint)" }}>
              O que está incluído
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 mb-6">
              {REPORT_ITEMS.map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 shrink-0" style={{ color: "#00D084" }} />
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>{item}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            {status === "idle" && canGenerate && (
              <button onClick={handleGenerate}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-all hover:opacity-90"
                style={{ background: "#00D084", color: "var(--bg-page)" }}>
                <FileText className="w-4 h-4" /> Gerar relatório PDF
              </button>
            )}
            {!canGenerate && (
              <div className="flex items-center gap-3 p-4 rounded-xl"
                style={{ background: "var(--bg-subtle)", border: "1px solid var(--border)" }}>
                <FileText className="w-4 h-4 shrink-0" style={{ color: "var(--text-faint)" }} />
                <p className="text-xs" style={{ color: "var(--text-faint)" }}>Você não tem permissão para gerar relatórios.</p>
              </div>
            )}
            {status === "generating" && (
              <div className="flex items-center justify-center gap-3 py-3.5 rounded-xl"
                style={{ background: "var(--bg-subtle)", border: "1px solid var(--border)" }}>
                <RefreshCw className="w-4 h-4 animate-spin" style={{ color: "#00D084" }} />
                <span className="text-sm" style={{ color: "var(--text-muted)" }}>Gerando relatório...</span>
              </div>
            )}
            {status === "done" && (
              <div className="space-y-3">
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
                  style={{ background: "rgba(0,208,132,0.08)", border: "1px solid rgba(0,208,132,0.2)" }}>
                  <CheckCircle className="w-4 h-4 shrink-0" style={{ color: "#00D084" }} />
                  <span className="text-sm font-medium" style={{ color: "#00D084" }}>Relatório gerado com sucesso!</span>
                </div>
                <button onClick={() => setStatus("idle")}
                  className="w-full py-2.5 rounded-xl text-xs font-medium"
                  style={{ color: "var(--text-muted)" }}>
                  Gerar novo relatório
                </button>
              </div>
            )}
            {status === "error" && (
              <div className="space-y-3">
                <p className="text-xs text-center" style={{ color: "#FF4D4F" }}>Erro ao gerar relatório. Tente novamente.</p>
                <button onClick={() => setStatus("idle")}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm"
                  style={{ background: "var(--bg-subtle)", color: "var(--text-muted)", border: "1px solid var(--border)" }}>
                  <RefreshCw className="w-4 h-4" /> Tentar novamente
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reports history */}
      {reports.length > 0 && (
        <div className="rounded-2xl overflow-hidden" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              Relatórios gerados
              <span className="ml-2 text-xs font-normal" style={{ color: "var(--text-faint)" }}>{reports.length}</span>
            </p>
          </div>
          <div className="divide-y" style={{ borderColor: "var(--bg-subtle)" }}>
            {reports.map((report) => (
              <div key={report.id} className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-4">
                <div className="flex items-center justify-center w-9 h-9 rounded-lg shrink-0"
                  style={{ background: "rgba(0,208,132,0.08)", border: "1px solid rgba(0,208,132,0.15)" }}>
                  <FileText className="w-4 h-4" style={{ color: "#00D084" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>{report.title}</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-faint)" }}>{formatDate(report.createdAt)}</p>
                </div>
                {report.status === "done" && (
                  <div className="flex items-center gap-2">
                    <button onClick={() => copyLink(report.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                      style={{
                        background: copiedId === report.id ? "rgba(0,208,132,0.12)" : "var(--bg-subtle)",
                        color: copiedId === report.id ? "#00D084" : "var(--text-muted)",
                        border: `1px solid ${copiedId === report.id ? "rgba(0,208,132,0.2)" : "var(--border)"}`,
                      }}>
                      {copiedId === report.id
                        ? <><Check className="w-3 h-3" /> Copiado!</>
                        : <><Link2 className="w-3 h-3" /> Compartilhar</>}
                    </button>
                    <button onClick={() => window.open(`/api/reports/${report.id}`, "_blank")}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                      style={{ background: "rgba(0,208,132,0.1)", color: "#00D084", border: "1px solid rgba(0,208,132,0.2)" }}>
                      <Download className="w-3.5 h-3.5" /> Baixar PDF
                    </button>
                  </div>
                )}
                {report.status === "generating" && (
                  <span className="flex items-center gap-1.5 text-xs" style={{ color: "#F59E0B" }}>
                    <RefreshCw className="w-3 h-3 animate-spin" /> Gerando...
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pro upgrade card */}
      <div className="rounded-2xl p-5"
        style={{ background: "rgba(245,158,11,0.04)", border: "1px solid rgba(245,158,11,0.2)" }}>
        <div className="flex items-start gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl shrink-0"
            style={{ background: "rgba(245,158,11,0.1)" }}>
            <Crown className="w-4 h-4" style={{ color: "#F59E0B" }} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold mb-1" style={{ color: "var(--text-primary)" }}>Relatórios PDF com marca</p>
            <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>
              No plano Pro, gere PDFs com logo da sua empresa, gráficos detalhados e análises comparativas do seu setor.
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              {["Logo da empresa", "Gráficos detalhados", "Comparativo setorial", "Compartilhamento externo"].map(f => (
                <span key={f} className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-lg"
                  style={{ background: "rgba(245,158,11,0.08)", color: "#F59E0B", border: "1px solid rgba(245,158,11,0.15)" }}>
                  <Sparkles className="w-2.5 h-2.5" /> {f}
                </span>
              ))}
            </div>
            <Link href="/app/settings#upgrade"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all"
              style={{ background: "#F59E0B", color: "var(--bg-page)" }}>
              <Crown className="w-3.5 h-3.5" /> Fazer upgrade para Pro
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
