"use client"

import { useCallback, useRef } from "react"
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
        style={{ background: "#1A1D27", border: "1px solid rgba(245,158,11,0.3)" }}
      >
        <div className="flex items-center justify-center w-16 h-16 rounded-full mx-auto mb-4" style={{ background: "rgba(245,158,11,0.1)" }}>
          <Lock className="w-8 h-8" style={{ color: "#F59E0B" }} />
        </div>
        <h3 className="text-xl font-bold mb-1" style={{ color: "#F4F4F5" }}>
          Limite do plano Grátis atingido
        </h3>
        <p className="text-sm mb-2" style={{ color: "#8B8FA8" }}>
          O plano Grátis permite <strong style={{ color: "#F4F4F5" }}>1 análise por mês</strong>.
        </p>
        <p className="text-sm mb-6" style={{ color: "#8B8FA8" }}>
          Faça upgrade para o plano Pro e tenha análises ilimitadas, até 10.000 transações e relatórios PDF completos.
        </p>

        <div className="flex flex-col gap-3 max-w-xs mx-auto">
          <Link
            href="/app/settings#upgrade"
            className="flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm"
            style={{ background: "#F59E0B", color: "#0F1117" }}
          >
            <Crown className="w-4 h-4" />
            Fazer upgrade para Pro — R$97/mês
          </Link>
          <button
            onClick={reset}
            className="py-2.5 rounded-xl text-sm font-medium"
            style={{ color: "#8B8FA8" }}
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
        style={{ background: "#1A1D27", border: "1px solid rgba(0,208,132,0.3)" }}
      >
        <div className="flex items-center justify-center w-16 h-16 rounded-full mx-auto mb-4" style={{ background: "rgba(0,208,132,0.1)" }}>
          <CheckCircle className="w-8 h-8" style={{ color: "#00D084" }} />
        </div>
        <h3 className="text-xl font-bold mb-1" style={{ color: "#F4F4F5" }}>
          Análise concluída!
        </h3>
        <p className="text-sm mb-6" style={{ color: "#8B8FA8" }}>
          Seus dados foram processados com sucesso.
        </p>

        {result.score !== undefined && (
          <div className="flex items-center justify-center gap-8 mb-5">
            <div className="text-center">
              <p className="text-3xl font-black" style={{ color: "#00D084" }}>{result.score}</p>
              <p className="text-xs" style={{ color: "#8B8FA8" }}>Score Financeiro</p>
            </div>
            {result.savingsMin !== undefined && (
              <div className="text-center">
                <p className="text-3xl font-black" style={{ color: "#F59E0B" }}>
                  R${((result.savingsMin + (result.savingsMax ?? result.savingsMin)) / 2).toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
                </p>
                <p className="text-xs" style={{ color: "#8B8FA8" }}>Economia estimada/mês</p>
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
            {result.topLeaks.map((leak, i) => (
              <div key={i} className="flex items-center justify-between px-3 py-2.5"
                style={{ borderTop: i > 0 ? "1px solid rgba(255,77,79,0.1)" : undefined }}>
                <p className="text-xs font-medium truncate flex-1 mr-3" style={{ color: "#F4F4F5" }}>{leak.title}</p>
                {leak.amount && (
                  <p className="text-xs font-bold shrink-0" style={{ color: "#FF4D4F" }}>
                    −R${Number(leak.amount).toLocaleString("pt-BR", { maximumFractionDigits: 0 })}/mês
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-3 justify-center">
          <button
            onClick={() => router.push(`/app/analysis/${result.analysisId}`)}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm"
            style={{ background: "#00D084", color: "#0F1117" }}
          >
            Ver Dashboard <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={reset}
            className="px-6 py-3 rounded-xl font-medium text-sm"
            style={{ background: "#212435", color: "#8B8FA8", border: "1px solid #2A2D3A" }}
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
            background: "#1A1D27",
            border: file ? "1px solid #00D084" : "2px dashed #2A2D3A",
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
              <div className="flex items-center justify-center w-14 h-14 rounded-2xl mx-auto mb-4" style={{ background: "#212435" }}>
                <Upload className="w-6 h-6" style={{ color: "#00D084" }} />
              </div>
              <p className="text-base font-semibold mb-1" style={{ color: "#F4F4F5" }}>
                Arraste seu arquivo aqui
              </p>
              <p className="text-sm mb-4" style={{ color: "#8B8FA8" }}>
                ou clique para selecionar
              </p>
              <p className="text-xs" style={{ color: "#4B4F6A" }}>
                CSV, XLSX ou XLS · até 10MB
              </p>
            </>
          ) : (
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl shrink-0" style={{ background: "rgba(0,208,132,0.1)" }}>
                <FileText className="w-6 h-6" style={{ color: "#00D084" }} />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium truncate" style={{ color: "#F4F4F5" }}>{file.name}</p>
                <p className="text-xs" style={{ color: "#8B8FA8" }}>{formatBytes(file.size)}</p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); removeFile() }}
                className="p-1.5 rounded-lg hover:bg-[#2A2D3A] transition-colors"
                style={{ color: "#4B4F6A" }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      ) : null}

      {/* Uploading / Processing */}
      {(status === "uploading" || status === "processing") && (
        <div className="rounded-2xl p-8" style={{ background: "#1A1D27", border: "1px solid #2A2D3A" }}>
          <div className="flex items-center gap-4 mb-5">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl shrink-0" style={{ background: "rgba(0,208,132,0.1)" }}>
              <Loader2 className="w-6 h-6 animate-spin" style={{ color: "#00D084" }} />
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: "#F4F4F5" }}>
                {status === "uploading" ? "Enviando arquivo..." : "Analisando dados..."}
              </p>
              <p className="text-xs" style={{ color: "#8B8FA8" }}>
                {status === "uploading" ? "Validando formato e lendo transações" : "Engine financeira processando seus dados"}
              </p>
            </div>
          </div>

          {status === "uploading" && (
            <>
              <div className="h-1.5 rounded-full mb-2 overflow-hidden" style={{ background: "#212435" }}>
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(progress, 100)}%`, background: "#00D084" }}
                />
              </div>
              <p className="text-xs text-right" style={{ color: "#4B4F6A" }}>{Math.min(Math.round(progress), 100)}%</p>
            </>
          )}

          {status === "processing" && (
            <div className="space-y-2">
              {["Lendo transações", "Categorizando despesas", "Detectando padrões", "Gerando insights"].map((step, i) => (
                <div key={step} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: i < 2 ? "#00D084" : "#2A2D3A" }} />
                  <span className="text-xs" style={{ color: i < 2 ? "#8B8FA8" : "#4B4F6A" }}>{step}</span>
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
            <p className="text-xs mt-0.5" style={{ color: "#8B8FA8" }}>{error}</p>
          </div>
        </div>
      )}

      {/* Upload button */}
      {status === "selected" && file && (
        <button
          onClick={upload}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-all duration-150"
          style={{ background: "#00D084", color: "#0F1117" }}
        >
          <Upload className="w-4 h-4" />
          Analisar arquivo
        </button>
      )}

      {/* Help text */}
      {(status === "idle" || status === "selected") && (
        <div className="rounded-xl p-4" style={{ background: "#212435", border: "1px solid #2A2D3A" }}>
          <p className="text-xs font-medium mb-2" style={{ color: "#F4F4F5" }}>Como preparar seu arquivo:</p>
          <ul className="space-y-1">
            {[
              "Exporte o extrato bancário do seu banco no formato CSV ou XLSX",
              "O arquivo deve conter: data, descrição e valor das transações",
              "Período recomendado: últimos 3 a 6 meses para melhor análise",
            ].map((tip) => (
              <li key={tip} className="flex items-start gap-1.5">
                <span className="shrink-0 mt-0.5" style={{ color: "#00D084" }}>·</span>
                <span className="text-xs" style={{ color: "#8B8FA8" }}>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
