"use client"

import { useState, useEffect } from "react"

export type DashboardInsight = {
  id: string
  type: string
  category: string | null
  title: string
  description: string
  impact: string | null
  urgency: string | null
  amount: string | null
  status: string
  metadata: unknown
}

export type DashboardAlert = {
  id: string
  type: string
  severity: string
  title: string
  message: string
  amount: string | null
  isRead: boolean
  isDismissed: boolean
}

export type DashboardRecommendation = {
  id: string
  title: string
  description: string
  rationale: string | null
  impact: string | null
  urgency: string | null
  difficulty: string | null
  savingsEstimate: string | null
  category: string | null
  status: string
  priority: number
}

export type DashboardAnalysis = {
  id: string
  score: number | null
  totalExpenses: string | null
  totalIncome: string | null
  netResult: string | null
  savingsMin: string | null
  savingsMax: string | null
  periodStart: string | null
  periodEnd: string | null
  status: string
  insights: DashboardInsight[]
  alerts: DashboardAlert[]
  recommendations: DashboardRecommendation[]
}

export type DashboardData = {
  analysis: DashboardAnalysis | null
  pending: { id: string; status: string } | null
  analysesCount: number
  scoreHistory: { score: number; createdAt: string }[]
}

export function useAnalysisData() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/app/dashboard")
      .then((r) => r.json())
      .then((d) => setData(d as DashboardData))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return { data, loading }
}
