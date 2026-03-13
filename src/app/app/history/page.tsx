"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { FileText, TrendingUp, TrendingDown, ArrowRight, Upload, Clock, Trash2, BarChart3 } from "lucide-react"
import { CardSkeleton } from "@/components/ui/skeletons"
import { can } from "@/lib/roles"

function fmt(v: string | number | null) {
  return Number(v ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })
}
function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })
}

type AnalysisSummary = {
  id: string
  status: string
  score: number | null
  totalExpenses: string | null
  totalIncome: string | null
  netResult: string | null
  savingsMin: string | null
  savingsMax: string | null
  periodStart: string | null
  periodEnd: string | null
  createdAt: string
  completedAt: string | null
  upload: { fileName: string; rowsCount: number | null } | null
  _count: { insights: number; alerts: number }
}

export default function HistoryPage() {
  const [analyses, setAnalyses] = useState<AnalysisSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const { data: session } = useSession()
  const canUpload = can(session?.user?.role ?? "", "upload:create")
  const canDelete = can(session?.user?.role ?? "", "upload:delete")

  async function handleDelete(id: string) {
    setDeleting(id)
    try {
      const res = await fetch(`/api/app/analyses/${id}`, { method: "DELETE" })
      if (res.ok) setAnalyses(prev => prev.filter(a => a.id !== id))
    } finally {
      setDeleting(null)
      setConfirmId(null)
    }
  }

  useEffect(() => {
    fetch("/api/app/analyses").then(r => r.json())
      .then(d => setAnalyses(d.analyses ?? []))
      .catch(() => setAnalyses([]))
      .finally(() => setLoading(false))
  }, [])

  const doneAnalyses = analyses.filter(a => a.status === "done")
  const bestScore = doneAnalyses.length > 0 ? Math.max(...doneAnalyses.map(a => a.score ?? 0)) : null

  return (
    <div className="px-4 sm:px-6 py-6 sm:py-8 space-y-6">

      {/* Delete modal */}
      {confirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="rounded-2xl p-6 w-full max-w-sm mx-4" style={{ background: "#1A1D27", border: "1px solid #2A2D3A" }}>
            <h3 className="text-base font-bold mb-2" style={{ color: "#F4F4F5" }}>Excluir análise?</h3>
            <p className="text-sm mb-5" style={{ color: "#8B8FA8" }}>
              Esta ação é irreversível. O arquivo, transações, insights e alertas serão apagados permanentemente.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmId(null)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                style={{ background: "#212435", color: "#8B8FA8" }}>
                Cancelar
              </button>
              <button onClick={() => handleDelete(confirmId)} disabled={!!deleting}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold"
                style={{ background: "#FF4D4F", color: "#fff", opacity: deleting ? 0.6 : 1 }}>
                {deleting === confirmId ? "Excluindo..." : "Excluir"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black" style={{ color: "#F4F4F5" }}>Histórico de análises</h1>
          <p className="text-sm mt-0.5" style={{ color: "#8B8FA8" }}>
            {analyses.length > 0
              ? `${analyses.length} análise${analyses.length > 1 ? "s" : ""} realizadas`
              : "Nenhuma análise ainda"}
          </p>
        </div>
        {canUpload && (
          <Link href="/app/upload"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold shrink-0"
            style={{ background: "#00D084", color: "#0F1117" }}>
            <Upload className="w-4 h-4" /> Nova análise
          </Link>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          <CardSkeleton /><CardSkeleton /><CardSkeleton />
        </div>
      ) : analyses.length === 0 ? (
        <div className="rounded-2xl p-12 text-center" style={{ background: "#1A1D27", border: "1px solid #2A2D3A" }}>
          <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: "#212435" }}>
            <BarChart3 className="w-8 h-8" style={{ color: "#4B4F6A" }} />
          </div>
          <p className="text-sm font-semibold mb-1" style={{ color: "#F4F4F5" }}>Nenhuma análise no histórico</p>
          <p className="text-xs mb-6" style={{ color: "#8B8FA8" }}>
            {canUpload ? "Faça seu primeiro upload para começar" : "Aguardando análise — o responsável pelo upload ainda não enviou dados."}
          </p>
          {canUpload && (
            <Link href="/app/upload" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold"
              style={{ background: "#00D084", color: "#0F1117" }}>
              <Upload className="w-4 h-4" /> Fazer upload
            </Link>
          )}
        </div>
      ) : (
        <>
          {/* Stats summary */}
          {doneAnalyses.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-2xl p-4" style={{ background: "#1A1D27", border: "1px solid #2A2D3A", borderLeft: "3px solid #00D084" }}>
                <p className="text-xs font-semibold mb-2" style={{ color: "#8B8FA8" }}>Total de análises</p>
                <p className="text-2xl font-black" style={{ color: "#F4F4F5" }}>{analyses.length}</p>
              </div>
              <div className="rounded-2xl p-4" style={{ background: "#1A1D27", border: "1px solid #2A2D3A", borderLeft: "3px solid #F59E0B" }}>
                <p className="text-xs font-semibold mb-2" style={{ color: "#8B8FA8" }}>Melhor score</p>
                <p className="text-2xl font-black" style={{ color: "#F59E0B" }}>{bestScore ?? "—"}</p>
              </div>
              <div className="rounded-2xl p-4" style={{ background: "#1A1D27", border: "1px solid #2A2D3A", borderLeft: "3px solid #3B82F6" }}>
                <p className="text-xs font-semibold mb-2" style={{ color: "#8B8FA8" }}>Score atual</p>
                <p className="text-2xl font-black" style={{
                  color: (doneAnalyses[0]?.score ?? 0) >= 75 ? "#00D084" : (doneAnalyses[0]?.score ?? 0) >= 50 ? "#F59E0B" : "#FF4D4F"
                }}>
                  {doneAnalyses[0]?.score ?? "—"}
                </p>
              </div>
            </div>
          )}

          {/* Analysis list */}
          <div className="space-y-3">
            {analyses.map((a, idx) => {
              const isProcessing = a.status === "pending" || a.status === "running"
              const isDone = a.status === "done"
              const scoreColor = (a.score ?? 0) >= 75 ? "#00D084" : (a.score ?? 0) >= 50 ? "#F59E0B" : "#FF4D4F"
              const prevAnalysis = analyses[idx + 1]
              const scoreDelta = isDone && prevAnalysis?.score != null && a.score != null
                ? a.score - prevAnalysis.score : null
              const netVal = Number(a.netResult ?? 0)

              return (
                <div key={a.id} className="rounded-2xl p-5 transition-all"
                  style={{
                    background: "#1A1D27",
                    border: "1px solid #2A2D3A",
                    borderLeft: `3px solid ${isDone ? scoreColor : isProcessing ? "#F59E0B" : "#4B4F6A"}`,
                  }}>
                  <div className="flex items-start gap-4">
                    {/* Score badge */}
                    <div className="flex flex-col items-center justify-center w-12 h-12 rounded-xl shrink-0 font-black text-lg"
                      style={{
                        background: isDone ? `${scoreColor}14` : "#212435",
                        color: isDone ? scoreColor : "#4B4F6A",
                      }}>
                      {isProcessing ? <Clock className="w-5 h-5 animate-pulse" style={{ color: "#F59E0B" }} /> : (a.score ?? "—")}
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Title + badges */}
                      <div className="flex items-center gap-2 flex-wrap mb-1.5">
                        <p className="text-sm font-semibold" style={{ color: "#F4F4F5" }}>
                          {a.upload?.fileName ?? `Análise #${analyses.length - idx}`}
                        </p>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                          style={{
                            background: isDone ? "rgba(0,208,132,0.1)" : isProcessing ? "rgba(245,158,11,0.1)" : "rgba(255,77,79,0.1)",
                            color: isDone ? "#00D084" : isProcessing ? "#F59E0B" : "#FF4D4F",
                          }}>
                          {isDone ? "Concluída" : isProcessing ? "Processando..." : "Erro"}
                        </span>
                        {scoreDelta !== null && scoreDelta !== 0 && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                            style={{
                              background: scoreDelta > 0 ? "rgba(0,208,132,0.1)" : "rgba(255,77,79,0.1)",
                              color: scoreDelta > 0 ? "#00D084" : "#FF4D4F",
                            }}>
                            {scoreDelta > 0 ? "↑" : "↓"} {Math.abs(scoreDelta)} pts vs anterior
                          </span>
                        )}
                      </div>

                      {/* Meta info */}
                      <div className="flex items-center gap-3 flex-wrap">
                        {a.periodStart && a.periodEnd && (
                          <span className="text-xs" style={{ color: "#8B8FA8" }}>
                            {new Date(a.periodStart).toLocaleDateString("pt-BR", { month: "short", year: "numeric" })} —{" "}
                            {new Date(a.periodEnd).toLocaleDateString("pt-BR", { month: "short", year: "numeric" })}
                          </span>
                        )}
                        {a.upload?.rowsCount != null && (
                          <span className="text-xs" style={{ color: "#4B4F6A" }}>
                            {a.upload.rowsCount.toLocaleString("pt-BR")} transações
                          </span>
                        )}
                        <span className="text-xs" style={{ color: "#4B4F6A" }}>{fmtDate(a.createdAt)}</span>
                      </div>

                      {/* Financial KPIs */}
                      {isDone && (
                        <div className="flex items-center gap-4 mt-2.5 pt-2.5 flex-wrap"
                          style={{ borderTop: "1px solid #212435" }}>
                          <div className="flex items-center gap-1.5">
                            <TrendingDown className="w-3 h-3" style={{ color: "#FF4D4F" }} />
                            <span className="text-xs font-semibold" style={{ color: "#FF4D4F" }}>{fmt(a.totalExpenses)}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <TrendingUp className="w-3 h-3" style={{ color: "#00D084" }} />
                            <span className="text-xs font-semibold" style={{ color: "#00D084" }}>{fmt(a.totalIncome)}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-semibold" style={{ color: "#4B4F6A" }}>Líquido</span>
                            <span className="text-xs font-bold" style={{ color: netVal >= 0 ? "#00D084" : "#FF4D4F" }}>
                              {fmt(a.netResult)}
                            </span>
                          </div>
                          {Number(a.savingsMax ?? 0) > 0 && (
                            <span className="text-xs font-semibold" style={{ color: "#F59E0B" }}>
                              💰 até {fmt(a.savingsMax)}/mês
                            </span>
                          )}
                          <span className="text-xs" style={{ color: "#4B4F6A" }}>
                            {a._count.insights} insights · {a._count.alerts} alertas
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      {isDone && (
                        <Link href={`/app/analysis/${a.id}`}
                          className="flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-xl text-xs font-semibold transition-all"
                          style={{ background: "#212435", color: "#8B8FA8", border: "1px solid #2A2D3A" }}>
                          <span className="hidden sm:inline">Ver detalhes</span> <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      )}
                      {canDelete && (
                        <button onClick={() => setConfirmId(a.id)}
                          className="flex items-center justify-center w-9 h-9 rounded-xl transition-all hover:opacity-80"
                          style={{ background: "#212435", border: "1px solid #2A2D3A" }}
                          title="Excluir análise">
                          <Trash2 className="w-4 h-4" style={{ color: "#FF4D4F" }} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
