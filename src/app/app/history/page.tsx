"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { FileText, TrendingUp, TrendingDown, ArrowRight, Upload, Clock } from "lucide-react"
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
  const { data: session } = useSession()
  const canUpload = can(session?.user?.role ?? "", "upload:create")

  useEffect(() => {
    fetch("/api/app/analyses").then(r => r.json())
      .then(d => setAnalyses(d.analyses ?? []))
      .catch(() => setAnalyses([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="px-6 py-8">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black" style={{ color: "#F4F4F5" }}>Histórico de análises</h1>
          <p className="text-sm mt-0.5" style={{ color: "#8B8FA8" }}>
            {analyses.length > 0 ? `${analyses.length} análise${analyses.length > 1 ? "s" : ""} realizadas` : "Nenhuma análise ainda"}
          </p>
        </div>
        {canUpload && (
          <Link href="/app/upload"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold"
            style={{ background: "#00D084", color: "#0F1117" }}>
            <Upload className="w-4 h-4" /> Nova análise
          </Link>
        )}
      </div>

      {loading ? (
        <div className="space-y-4"><CardSkeleton /><CardSkeleton /><CardSkeleton /></div>
      ) : analyses.length === 0 ? (
        <div className="rounded-2xl p-10 text-center" style={{ background: "#1A1D27", border: "1px solid #2A2D3A" }}>
          <FileText className="w-10 h-10 mx-auto mb-3" style={{ color: "#2A2D3A" }} />
          <p className="text-sm font-medium mb-1" style={{ color: "#8B8FA8" }}>Nenhuma análise no histórico</p>
          <p className="text-xs mb-5" style={{ color: "#4B4F6A" }}>
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
        <div className="space-y-3">
          {analyses.map((a, idx) => {
            const isProcessing = a.status === "pending" || a.status === "running"
            const isDone = a.status === "done"
            const scoreColor = (a.score ?? 0) >= 75 ? "#00D084" : (a.score ?? 0) >= 50 ? "#F59E0B" : "#FF4D4F"

            return (
              <div key={a.id}
                className="rounded-2xl p-5 transition-all"
                style={{ background: "#1A1D27", border: "1px solid #2A2D3A" }}>
                <div className="flex items-start gap-4">
                  {/* Score badge */}
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl shrink-0 font-black text-lg"
                    style={{
                      background: isDone ? `${scoreColor}14` : "#212435",
                      color: isDone ? scoreColor : "#4B4F6A",
                    }}>
                    {isProcessing ? <Clock className="w-5 h-5 animate-pulse" /> : (a.score ?? "–")}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
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
                    </div>

                    <div className="flex items-center gap-4 flex-wrap">
                      {a.periodStart && a.periodEnd && (
                        <span className="text-xs" style={{ color: "#8B8FA8" }}>
                          {new Date(a.periodStart).toLocaleDateString("pt-BR", { month: "short", year: "numeric" })} —{" "}
                          {new Date(a.periodEnd).toLocaleDateString("pt-BR", { month: "short", year: "numeric" })}
                        </span>
                      )}
                      {a.upload?.rowsCount && (
                        <span className="text-xs" style={{ color: "#4B4F6A" }}>
                          {a.upload.rowsCount.toLocaleString("pt-BR")} transações
                        </span>
                      )}
                      <span className="text-xs" style={{ color: "#4B4F6A" }}>{fmtDate(a.createdAt)}</span>
                    </div>

                    {isDone && (
                      <div className="flex items-center gap-4 mt-2 flex-wrap">
                        <div className="flex items-center gap-1">
                          <TrendingDown className="w-3 h-3" style={{ color: "#FF4D4F" }} />
                          <span className="text-xs font-medium" style={{ color: "#FF4D4F" }}>{fmt(a.totalExpenses)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" style={{ color: "#00D084" }} />
                          <span className="text-xs font-medium" style={{ color: "#00D084" }}>{fmt(a.totalIncome)}</span>
                        </div>
                        {Number(a.savingsMax ?? 0) > 0 && (
                          <span className="text-xs font-medium" style={{ color: "#F59E0B" }}>
                            💰 até {fmt(a.savingsMax)}/mês de economia
                          </span>
                        )}
                        <span className="text-xs" style={{ color: "#4B4F6A" }}>
                          {a._count.insights} insights · {a._count.alerts} alertas
                        </span>
                      </div>
                    )}
                  </div>

                  {isDone && (
                    <Link href={`/app/analysis/${a.id}`}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all"
                      style={{ background: "#212435", color: "#8B8FA8", border: "1px solid #2A2D3A" }}>
                      Ver detalhes <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
