"use client"

import { useMemo } from "react"
import type { Subscores } from "@/types/analysis"

interface ScoreStatus {
  label: string
  color: string
  bgColor: string
  borderColor: string
  description: string
}

export function useScore(score: number) {
  const status = useMemo((): ScoreStatus => {
    if (score >= 86) {
      return {
        label: "Excelente",
        color: "#00D084",
        bgColor: "rgba(0, 208, 132, 0.1)",
        borderColor: "rgba(0, 208, 132, 0.2)",
        description:
          "Sua eficiência financeira está excelente. Continue monitorando para manter os resultados.",
      }
    }
    if (score >= 71) {
      return {
        label: "Bom",
        color: "#00D084",
        bgColor: "rgba(0, 208, 132, 0.08)",
        borderColor: "rgba(0, 208, 132, 0.15)",
        description:
          "Boa eficiência financeira. Ainda há oportunidades para otimizar e aumentar o lucro.",
      }
    }
    if (score >= 41) {
      return {
        label: "Atenção",
        color: "#F59E0B",
        bgColor: "rgba(245, 158, 11, 0.1)",
        borderColor: "rgba(245, 158, 11, 0.2)",
        description:
          "Sua empresa tem vazamentos financeiros significativos. Priorize as ações recomendadas.",
      }
    }
    return {
      label: "Crítico",
      color: "#FF4D4F",
      bgColor: "rgba(255, 77, 79, 0.1)",
      borderColor: "rgba(255, 77, 79, 0.2)",
      description:
        "Situação crítica. Há desperdícios relevantes que precisam de atenção imediata.",
    }
  }, [score])

  const getSubscoreStatus = (value: number): "good" | "warning" | "danger" => {
    if (value >= 71) return "good"
    if (value >= 41) return "warning"
    return "danger"
  }

  const getSubscoreColor = (value: number): string => {
    if (value >= 71) return "#00D084"
    if (value >= 41) return "#F59E0B"
    return "#FF4D4F"
  }

  const formatSubscores = (subscores: Subscores) => {
    return [
      {
        key: "subscriptions",
        label: "Assinaturas",
        value: subscores.subscriptions,
        status: getSubscoreStatus(subscores.subscriptions),
        color: getSubscoreColor(subscores.subscriptions),
      },
      {
        key: "vendors",
        label: "Fornecedores",
        value: subscores.vendors,
        status: getSubscoreStatus(subscores.vendors),
        color: getSubscoreColor(subscores.vendors),
      },
      {
        key: "recurring",
        label: "Recorrentes",
        value: subscores.recurring,
        status: getSubscoreStatus(subscores.recurring),
        color: getSubscoreColor(subscores.recurring),
      },
      {
        key: "concentration",
        label: "Concentração",
        value: subscores.concentration,
        status: getSubscoreStatus(subscores.concentration),
        color: getSubscoreColor(subscores.concentration),
      },
      {
        key: "cashflow",
        label: "Caixa",
        value: subscores.cashflow,
        status: getSubscoreStatus(subscores.cashflow),
        color: getSubscoreColor(subscores.cashflow),
      },
    ]
  }

  return { status, getSubscoreStatus, getSubscoreColor, formatSubscores }
}
