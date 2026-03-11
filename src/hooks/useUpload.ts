"use client"

import { useState, useCallback } from "react"

type UploadStatus =
  | "idle"
  | "selected"
  | "uploading"
  | "processing"
  | "done"
  | "error"
  | "plan_limit"

interface UploadResult {
  uploadId: string
  analysisId: string
  score?: number
  savingsMin?: number
  savingsMax?: number
  topLeaks?: { title: string; amount: string | null }[]
}

interface UseUploadReturn {
  status: UploadStatus
  progress: number
  file: File | null
  result: UploadResult | null
  error: string | null
  selectFile: (file: File) => void
  removeFile: () => void
  upload: () => Promise<void>
  reset: () => void
}

const MAX_SIZE_MB = 10
const ALLOWED_EXTENSIONS = [".csv", ".xlsx", ".xls"]

export function useUpload(): UseUploadReturn {
  const [status, setStatus] = useState<UploadStatus>("idle")
  const [progress, setProgress] = useState(0)
  const [file, setFile] = useState<File | null>(null)
  const [result, setResult] = useState<UploadResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const validateFile = (selectedFile: File): string | null => {
    const extension = `.${selectedFile.name.split(".").pop()?.toLowerCase()}`
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      return "Formato inválido. Use arquivos .csv, .xlsx ou .xls"
    }
    if (selectedFile.size > MAX_SIZE_MB * 1024 * 1024) {
      return `Arquivo muito grande. Máximo ${MAX_SIZE_MB}MB`
    }
    return null
  }

  const selectFile = useCallback((selectedFile: File) => {
    const validationError = validateFile(selectedFile)
    if (validationError) {
      setError(validationError)
      return
    }
    setFile(selectedFile)
    setStatus("selected")
    setError(null)
    setResult(null)
    setProgress(0)
  }, [])

  const removeFile = useCallback(() => {
    setFile(null)
    setStatus("idle")
    setError(null)
    setResult(null)
    setProgress(0)
  }, [])

  const upload = useCallback(async () => {
    if (!file) return

    setStatus("uploading")
    setProgress(0)
    setError(null)

    const formData = new FormData()
    formData.append("file", file)

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 85) {
          clearInterval(progressInterval)
          return 85
        }
        return prev + Math.random() * 15
      })
    }, 200)

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      clearInterval(progressInterval)
      setProgress(100)

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        if (response.status === 429) {
          setStatus("plan_limit")
          setProgress(0)
          return
        }
        throw new Error((data as { error?: string }).error ?? "Erro ao processar o arquivo")
      }

      const data: UploadResult = await response.json()
      setStatus("processing")
      setResult(data)

      // SSE — substitui polling de setInterval
      const es = new EventSource(`/api/analysis/${data.analysisId}/stream`)

      // Timeout de segurança: 2 minutos
      const timeout = setTimeout(() => {
        es.close()
        setStatus("done")
      }, 120_000)

      es.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data as string) as {
            type: string
            status?: string
            score?: number
            savingsMin?: string | number | null
            savingsMax?: string | number | null
            message?: string
            topLeaks?: { title: string; amount: string | null }[]
          }

          if (msg.type === "status") {
            if (msg.status === "done") {
              clearTimeout(timeout)
              es.close()
              setResult({
                ...data,
                score: msg.score,
                savingsMin: msg.savingsMin !== null && msg.savingsMin !== undefined ? Number(msg.savingsMin) : undefined,
                savingsMax: msg.savingsMax !== null && msg.savingsMax !== undefined ? Number(msg.savingsMax) : undefined,
                topLeaks: msg.topLeaks as { title: string; amount: string | null }[] | undefined,
              })
              setStatus("done")
            } else if (msg.status === "error") {
              clearTimeout(timeout)
              es.close()
              setError("Erro ao analisar os dados. Verifique o formato do arquivo.")
              setStatus("error")
            }
          }

          if (msg.type === "error") {
            clearTimeout(timeout)
            es.close()
            setError(msg.message ?? "Erro na análise")
            setStatus("error")
          }
        } catch {
          // ignora parse error
        }
      }

      es.onerror = () => {
        // SSE desconectou — não é erro fatal, análise continua no backend
        // O timeout de 2 min vai resolver se necessário
        es.close()
      }
    } catch (err) {
      clearInterval(progressInterval)
      setError(err instanceof Error ? err.message : "Erro inesperado")
      setStatus("error")
      setProgress(0)
    }
  }, [file])

  const reset = useCallback(() => {
    setStatus("idle")
    setProgress(0)
    setFile(null)
    setResult(null)
    setError(null)
  }, [])

  return { status, progress, file, result, error, selectFile, removeFile, upload, reset }
}
