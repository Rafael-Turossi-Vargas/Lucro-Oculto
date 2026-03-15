"use client"

import { useState, useCallback, useRef } from "react"

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

  // Refs para cleanup correto — evita leaks de EventSource e timers
  const esRef = useRef<EventSource | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const cleanupSSE = useCallback(() => {
    if (esRef.current) {
      esRef.current.close()
      esRef.current = null
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  const validateFile = (selectedFile: File): string | null => {
    // Extensão case-insensitive (.CSV, .Csv etc)
    const extension = `.${selectedFile.name.split(".").pop()?.toLowerCase() ?? ""}`
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
    cleanupSSE()
    setFile(null)
    setStatus("idle")
    setError(null)
    setResult(null)
    setProgress(0)
  }, [cleanupSSE])

  const upload = useCallback(async () => {
    if (!file) return

    // Cancela SSE e timers anteriores
    cleanupSSE()
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    setStatus("uploading")
    setProgress(0)
    setError(null)

    const formData = new FormData()
    formData.append("file", file)

    // Progress simulado — teto de 85% para não enganar o usuário
    intervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 85) {
          clearInterval(intervalRef.current!)
          intervalRef.current = null
          return 85
        }
        return Math.min(prev + Math.random() * 12, 85)
      })
    }, 200)

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }

      if (!response.ok) {
        let errMsg = "Erro ao processar o arquivo"
        try {
          const errData = await response.json() as { error?: string }
          errMsg = errData.error ?? errMsg
        } catch { /* ignora */ }

        if (response.status === 429) {
          setStatus("plan_limit")
          setProgress(0)
          return
        }
        throw new Error(errMsg)
      }

      const data: UploadResult = await response.json()
      setStatus("processing")
      setResult(data)
      setProgress(90) // avança para 90% aguardando conclusão via SSE

      // SSE para acompanhar progresso da análise no backend
      const es = new EventSource(`/api/analysis/${data.analysisId}/stream`)
      esRef.current = es

      // Timeout de segurança: 3 minutos
      timeoutRef.current = setTimeout(() => {
        cleanupSSE()
        setStatus("done")
        setProgress(100)
      }, 180_000)

      es.onmessage = (event) => {
        // JSON.parse sempre em try-catch — SSE pode enviar frames malformados
        let msg: {
          type: string
          status?: string
          score?: number
          savingsMin?: string | number | null
          savingsMax?: string | number | null
          message?: string
          topLeaks?: { title: string; amount: string | null }[]
        }
        try {
          msg = JSON.parse(event.data as string) as typeof msg
        } catch {
          return // ignora frame malformado
        }

        if (msg.type === "status") {
          if (msg.status === "done") {
            cleanupSSE()
            setResult({
              ...data,
              score: msg.score,
              savingsMin: msg.savingsMin != null ? Number(msg.savingsMin) : undefined,
              savingsMax: msg.savingsMax != null ? Number(msg.savingsMax) : undefined,
              topLeaks: msg.topLeaks,
            })
            setProgress(100)
            setStatus("done")
          } else if (msg.status === "error") {
            cleanupSSE()
            setError("Erro ao analisar os dados. Verifique o formato do arquivo.")
            setProgress(0)
            setStatus("error")
          }
        }

        if (msg.type === "error") {
          cleanupSSE()
          setError(msg.message ?? "Erro na análise")
          setProgress(0)
          setStatus("error")
        }
      }

      es.onerror = () => {
        // SSE desconectou — fecha para não vazar listener
        es.close()
        if (esRef.current === es) esRef.current = null
        // Timeout de segurança completa o fluxo se necessário
      }
    } catch (err) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      cleanupSSE()
      setError(err instanceof Error ? err.message : "Erro inesperado")
      setStatus("error")
      setProgress(0)
    }
  }, [file, cleanupSSE])

  const reset = useCallback(() => {
    cleanupSSE()
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setStatus("idle")
    setProgress(0)
    setFile(null)
    setResult(null)
    setError(null)
  }, [cleanupSSE])

  return { status, progress, file, result, error, selectFile, removeFile, upload, reset }
}
