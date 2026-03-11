"use client"

import { useState, useEffect } from "react"
import type { AnalysisResult } from "@/types/analysis"

interface UseAnalysisReturn {
  analysis: AnalysisResult | null
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useAnalysis(analysisId?: string): UseAnalysisReturn {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetch_ = async () => {
    if (!analysisId) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/analysis/${analysisId}`)
      if (!res.ok) throw new Error("Falha ao carregar análise")
      const data = await res.json()
      setAnalysis(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetch_()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [analysisId])

  return { analysis, loading, error, refetch: fetch_ }
}
