"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { FileText, Download, CheckCircle, Upload, RefreshCw, Check, Link2 } from "lucide-react"
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
      .then((r) => r.json())
      .then((d) => setReports(Array.isArray(d) ? (d as Report[]) : []))
      .catch(() => {})
      .finally(() => setLoadingReports(false))
  }

  useEffect(() => {
    fetchReports()
  }, [])

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

  const handleDownload = async (reportId: string) => {
    window.open(`/api/reports/${reportId}`, "_blank")
  }

  function copyLink(id: string) {
    navigator.clipboard.writeText(`${window.location.origin}/report/${id}`).then(() => {
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    })
  }

  if (dashLoading || loadingReports) {
    return (
      <div className="px-6 py-8 space-y-4">
        <CardSkeleton rows={5} />
        <CardSkeleton rows={3} />
      </div>
    )
  }

  return (
    <div className="px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-black" style={{ color: "#F4F4F5" }}>Relatórios</h1>
        <p className="text-sm mt-0.5" style={{ color: "#8B8FA8" }}>Exporte um resumo completo da análise financeira</p>
      </div>

      {/* Generate new report */}
      {!dashData?.analysis ? (
        <div className="rounded-2xl p-12 text-center mb-6" style={{ background: "#1A1D27", border: "1px solid #2A2D3A" }}>
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl mx-auto mb-4" style={{ background: "#212435" }}>
            <FileText className="w-8 h-8" style={{ color: "#2A2D3A" }} />
          </div>
          <p className="text-base font-semibold mb-1" style={{ color: "#F4F4F5" }}>Nenhuma análise disponível</p>
          <p className="text-sm mb-6" style={{ color: "#8B8FA8" }}>
            {canUpload ? "Faça upload do extrato bancário para gerar relatórios financeiros." : "Aguardando análise — o responsável pelo upload ainda não enviou dados."}
          </p>
          {canUpload && (
            <Link
              href="/app/upload"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm"
              style={{ background: "#00D084", color: "#0F1117" }}
            >
              <Upload className="w-4 h-4" />
              Fazer primeiro upload
            </Link>
          )}
        </div>
      ) : (
        <div className="rounded-2xl p-6 mb-6" style={{ background: "#1A1D27", border: "1px solid #2A2D3A" }}>
          <div className="flex items-start gap-4 mb-6">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl shrink-0" style={{ background: "#212435" }}>
              <FileText className="w-6 h-6" style={{ color: "#00D084" }} />
            </div>
            <div>
              <p className="text-base font-bold" style={{ color: "#F4F4F5" }}>Relatório Completo de Análise</p>
              <p className="text-xs mt-0.5" style={{ color: "#8B8FA8" }}>
                Score: {dashData.analysis.score ?? "—"}/100 · Gerado com dados reais da sua organização
              </p>
            </div>
          </div>

          <ul className="space-y-1 mb-6">
            {[
              "Resumo executivo com score e KPIs",
              "Lista completa de vazamentos financeiros",
              "Oportunidades de economia priorizadas",
              "Análise por categoria de despesa",
              "Top fornecedores e concentração de gastos",
              "Plano de ação recomendado",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 shrink-0" style={{ color: "#00D084" }} />
                <span className="text-xs" style={{ color: "#8B8FA8" }}>{item}</span>
              </li>
            ))}
          </ul>

          {status === "idle" && canGenerate && (
            <button
              onClick={handleGenerate}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm"
              style={{ background: "#00D084", color: "#0F1117" }}
            >
              <FileText className="w-4 h-4" />
              Gerar relatório PDF
            </button>
          )}

          {status === "generating" && (
            <div className="flex items-center justify-center gap-3 py-3.5 rounded-xl" style={{ background: "#212435", border: "1px solid #2A2D3A" }}>
              <RefreshCw className="w-4 h-4 animate-spin" style={{ color: "#00D084" }} />
              <span className="text-sm" style={{ color: "#8B8FA8" }}>Gerando relatório...</span>
            </div>
          )}

          {status === "done" && (
            <div className="space-y-3">
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: "rgba(0,208,132,0.08)", border: "1px solid rgba(0,208,132,0.2)" }}>
                <CheckCircle className="w-4 h-4 shrink-0" style={{ color: "#00D084" }} />
                <span className="text-sm" style={{ color: "#00D084" }}>Relatório gerado com sucesso!</span>
              </div>
              <button
                onClick={() => setStatus("idle")}
                className="w-full py-2.5 rounded-xl text-sm font-medium"
                style={{ color: "#8B8FA8" }}
              >
                Gerar novo relatório
              </button>
            </div>
          )}

          {status === "error" && (
            <div className="space-y-3">
              <p className="text-xs text-center" style={{ color: "#FF4D4F" }}>Erro ao gerar relatório. Tente novamente.</p>
              <button
                onClick={() => setStatus("idle")}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm"
                style={{ background: "#212435", color: "#8B8FA8", border: "1px solid #2A2D3A" }}
              >
                <RefreshCw className="w-4 h-4" />
                Tentar novamente
              </button>
            </div>
          )}
        </div>
      )}

      {/* Reports history */}
      {reports.length > 0 && (
        <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid #2A2D3A" }}>
          <div className="px-5 py-4" style={{ background: "#1A1D27", borderBottom: "1px solid #2A2D3A" }}>
            <p className="text-sm font-semibold" style={{ color: "#F4F4F5" }}>Relatórios gerados</p>
          </div>
          <div style={{ background: "#1A1D27" }}>
            {reports.map((report, i) => (
              <div
                key={report.id}
                className="flex items-center gap-4 px-5 py-4"
                style={{ borderBottom: i < reports.length - 1 ? "1px solid #212435" : "none" }}
              >
                <div className="flex items-center justify-center w-9 h-9 rounded-lg shrink-0" style={{ background: "#212435" }}>
                  <FileText className="w-4 h-4" style={{ color: "#00D084" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: "#F4F4F5" }}>{report.title}</p>
                  <p className="text-xs mt-0.5" style={{ color: "#4B4F6A" }}>{formatDate(report.createdAt)}</p>
                </div>
                {report.status === "done" && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copyLink(report.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                      style={{
                        background: copiedId === report.id ? "rgba(0,208,132,0.15)" : "#212435",
                        color: copiedId === report.id ? "#00D084" : "#8B8FA8",
                        border: "1px solid #2A2D3A",
                      }}
                    >
                      {copiedId === report.id ? (
                        <><Check className="w-3 h-3" /> Copiado!</>
                      ) : (
                        <><Link2 className="w-3 h-3" /> Compartilhar</>
                      )}
                    </button>
                    <button
                      onClick={() => handleDownload(report.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                      style={{ background: "rgba(0,208,132,0.1)", color: "#00D084", border: "1px solid rgba(0,208,132,0.2)" }}
                    >
                      <Download className="w-3.5 h-3.5" />
                      Baixar PDF
                    </button>
                  </div>
                )}
                {report.status === "generating" && (
                  <span className="text-xs" style={{ color: "#F59E0B" }}>Gerando...</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pro upgrade hint */}
      <div className="rounded-2xl p-5 mt-6" style={{ background: "#1A1D27", border: "1px solid #2A2D3A" }}>
        <p className="text-sm font-semibold mb-1" style={{ color: "#F4F4F5" }}>Relatórios em PDF com marca</p>
        <p className="text-xs mb-3" style={{ color: "#8B8FA8" }}>
          No plano Pro, gere PDFs com logo da sua empresa, gráficos detalhados e análises comparativas do seu setor.
        </p>
        <Link
          href="/app/settings#upgrade"
          className="inline-flex px-4 py-2 rounded-lg text-xs font-semibold transition-all"
          style={{ background: "#212435", color: "#F59E0B", border: "1px solid rgba(245,158,11,0.2)" }}
        >
          Fazer upgrade para Pro
        </Link>
      </div>
    </div>
  )
}
