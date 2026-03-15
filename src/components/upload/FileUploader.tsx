"use client"

import { useCallback, useRef, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Upload, FileText, X, CheckCircle, Loader2, AlertCircle, ArrowRight, Crown, Lock } from "lucide-react"
import { useUpload } from "@/hooks/useUpload"

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function FileUploader() {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const { status, progress, file, result, error, selectFile, removeFile, upload, reset } = useUpload()

  // Auto-redirect to dashboard as soon as analysis is done
  useEffect(() => {
    if (status !== "done" || !result) return
    // Invalidate dashboard cache so the redirect shows fresh data immediately
    try {
      sessionStorage.removeItem("dash_v3")
      sessionStorage.removeItem("sidebar_dash_v1")
    } catch { /* ignore */ }
    const timer = setTimeout(() => {
      router.push("/app/dashboard")
    }, 1500)
    return () => clearTimeout(timer)
  }, [status, result, router])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      const dropped = e.dataTransfer.files[0]
      if (dropped) selectFile(dropped)
    },
    [selectFile]
  )

  const handleDragOver = (e: React.DragEvent) => e.preventDefault()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (selected) selectFile(selected)
  }

  if (status === "plan_limit") {
    return (
      <div
        className="rounded-2xl p-8 text-center"
        style={{ background: "var(--bg-card)", border: "1px solid rgba(245,158,11,0.3)" }}
      >
        <div className="flex items-center justify-center w-16 h-16 rounded-full mx-auto mb-4" style={{ background: "rgba(245,158,11,0.1)" }}>
          <Lock className="w-8 h-8" style={{ color: "#F59E0B" }} />
        </div>
        <h3 className="text-xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>
          Limite do plano Grátis atingido
        </h3>
        <p className="text-sm mb-2" style={{ color: "var(--text-muted)" }}>
          O plano Grátis permite <strong style={{ color: "var(--text-primary)" }}>1 análise por mês</strong>.
        </p>
        <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
          Faça upgrade para o plano Pro e tenha análises ilimitadas, até 10.000 transações e relatórios PDF completos.
        </p>

        <div className="flex flex-col gap-3 max-w-xs mx-auto">
          <Link
            href="/app/settings#upgrade"
            className="flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm"
            style={{ background: "#F59E0B", color: "var(--bg-page)" }}
          >
            <Crown className="w-4 h-4" />
            Fazer upgrade para Pro — R$97/mês
          </Link>
          <button
            onClick={reset}
            className="py-2.5 rounded-xl text-sm font-medium"
            style={{ color: "var(--text-muted)" }}
          >
            Voltar
          </button>
        </div>
      </div>
    )
  }

  if (status === "done" && result) {
    return (
      <div
        className="rounded-2xl p-8 text-center"
        style={{ background: "var(--bg-card)", border: "1px solid rgba(0,208,132,0.3)" }}
      >
        <div className="flex items-center justify-center w-16 h-16 rounded-full mx-auto mb-4" style={{ background: "rgba(0,208,132,0.1)" }}>
          <CheckCircle className="w-8 h-8" style={{ color: "#00D084" }} />
        </div>
        <h3 className="text-xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>
          Análise concluída!
        </h3>
        <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
          Seus dados foram processados com sucesso.
        </p>

        {result.score !== undefined && (
          <div className="flex items-center justify-center gap-8 mb-5">
            <div className="text-center">
              <p className="text-3xl font-black" style={{ color: "#00D084" }}>{result.score}</p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>Score Financeiro</p>
            </div>
            {result.savingsMin !== undefined && (
              <div className="text-center">
                <p className="text-3xl font-black" style={{ color: "#F59E0B" }}>
                  R${((result.savingsMin + (result.savingsMax ?? result.savingsMin)) / 2).toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
                </p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>Economia estimada/mês</p>
              </div>
            )}
          </div>
        )}

        {/* ── Item 16: Top leaks preview ─────────────────────────────── */}
        {result.topLeaks && result.topLeaks.length > 0 && (
          <div className="w-full mb-5 rounded-xl overflow-hidden text-left"
            style={{ border: "1px solid rgba(255,77,79,0.2)" }}>
            <p className="text-[10px] font-semibold px-3 py-2"
              style={{ background: "rgba(255,77,79,0.06)", color: "#FF4D4F", textTransform: "uppercase", letterSpacing: "0.8px" }}>
              Principais problemas encontrados
            </p>
            {result.topLeaks.slice(0, 3).map((leak, i) => (
              <div key={i} className="flex items-center justify-between px-3 py-2.5"
                style={{ borderTop: i > 0 ? "1px solid rgba(255,77,79,0.1)" : undefined }}>
                <p className="text-xs font-medium truncate flex-1 mr-3" style={{ color: "var(--text-primary)" }}>{leak.title}</p>
                {leak.amount && (
                  <p className="text-xs font-bold shrink-0" style={{ color: "#FF4D4F" }}>
                    −R${Number(leak.amount).toLocaleString("pt-BR", { maximumFractionDigits: 0 })}/mês
                  </p>
                )}
              </div>
            ))}
            {result.topLeaks.length > 3 && (
              <div className="px-3 py-2" style={{ borderTop: "1px solid rgba(255,77,79,0.1)" }}>
                <Link href="/app/leaks" className="text-xs font-medium" style={{ color: "#FF4D4F" }}>
                  Ver todos os {result.topLeaks.length} vazamentos →
                </Link>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-3 justify-center">
          <button
            onClick={() => router.push(`/app/analysis/${result.analysisId}`)}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm"
            style={{ background: "#00D084", color: "var(--bg-page)" }}
          >
            Ver Dashboard <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={reset}
            className="px-6 py-3 rounded-xl font-medium text-sm"
            style={{ background: "var(--bg-subtle)", color: "var(--text-muted)", border: "1px solid var(--border)" }}
          >
            Novo upload
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      {status === "idle" || status === "selected" ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => !file && inputRef.current?.click()}
          className="rounded-2xl p-10 text-center transition-all duration-150"
          style={{
            background: "var(--bg-card)",
            border: file ? "2px solid #00D084" : "2px dashed var(--border)",
            cursor: file ? "default" : "pointer",
          }}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            className="hidden"
            onChange={handleInputChange}
          />

          {!file ? (
            <>
              <div className="flex items-center justify-center w-14 h-14 rounded-2xl mx-auto mb-4" style={{ background: "var(--bg-subtle)" }}>
                <Upload className="w-6 h-6" style={{ color: "#00D084" }} />
              </div>
              <p className="text-base font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
                Arraste seu arquivo aqui
              </p>
              <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>
                ou clique para selecionar
              </p>
              <p className="text-xs" style={{ color: "var(--text-faint)" }}>
                CSV, XLSX ou XLS · até 10MB
              </p>
            </>
          ) : (
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl shrink-0" style={{ background: "rgba(0,208,132,0.1)" }}>
                <FileText className="w-6 h-6" style={{ color: "#00D084" }} />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>{file.name}</p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>{formatBytes(file.size)}</p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); removeFile() }}
                className="p-1.5 rounded-lg hover:bg-[var(--border)] transition-colors"
                style={{ color: "var(--text-faint)" }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      ) : null}

      {/* Uploading / Processing */}
      {(status === "uploading" || status === "processing") && (
        <div className="rounded-2xl p-8" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <div className="flex items-center gap-4 mb-5">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl shrink-0" style={{ background: "rgba(0,208,132,0.1)" }}>
              <Loader2 className="w-6 h-6 animate-spin" style={{ color: "#00D084" }} />
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                {status === "uploading" ? "Enviando arquivo..." : "Analisando dados..."}
              </p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                {status === "uploading" ? "Validando formato e lendo transações" : "Engine financeira processando seus dados"}
              </p>
            </div>
          </div>

          {status === "uploading" && (
            <>
              <div className="h-1.5 rounded-full mb-2 overflow-hidden" style={{ background: "var(--bg-subtle)" }}>
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(progress, 100)}%`, background: "#00D084" }}
                />
              </div>
              <p className="text-xs text-right" style={{ color: "var(--text-faint)" }}>{Math.min(Math.round(progress), 100)}%</p>
            </>
          )}

          {status === "processing" && (
            <div className="space-y-2">
              {["Lendo transações", "Categorizando despesas", "Detectando padrões", "Gerando insights"].map((step, i) => (
                <div key={step} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: i < 2 ? "#00D084" : "var(--border)" }} />
                  <span className="text-xs" style={{ color: i < 2 ? "var(--text-muted)" : "var(--text-faint)" }}>{step}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div
          className="flex items-start gap-3 p-4 rounded-xl"
          style={{ background: "rgba(255,77,79,0.06)", border: "1px solid rgba(255,77,79,0.2)" }}
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "#FF4D4F" }} />
          <div>
            <p className="text-sm font-medium" style={{ color: "#FF4D4F" }}>Erro no upload</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{error}</p>
          </div>
        </div>
      )}

      {/* Upload button */}
      {status === "selected" && file && (
        <button
          onClick={upload}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-all duration-150"
          style={{ background: "#00D084", color: "var(--bg-page)" }}
        >
          <Upload className="w-4 h-4" />
          Analisar arquivo
        </button>
      )}

      {/* Help text */}
      {(status === "idle" || status === "selected") && (
        <div className="rounded-xl p-4" style={{ background: "var(--bg-subtle)", border: "1px solid var(--border)" }}>
          <p className="text-xs font-medium mb-2" style={{ color: "var(--text-primary)" }}>Como preparar seu arquivo:</p>
          <ul className="space-y-1">
            {[
              "Exporte o extrato bancário do seu banco no formato CSV ou XLSX",
              "O arquivo deve conter: data, descrição e valor das transações",
              "Período recomendado: últimos 3 a 6 meses para melhor análise",
            ].map((tip) => (
              <li key={tip} className="flex items-start gap-1.5">
                <span className="shrink-0 mt-0.5" style={{ color: "#00D084" }}>·</span>
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
