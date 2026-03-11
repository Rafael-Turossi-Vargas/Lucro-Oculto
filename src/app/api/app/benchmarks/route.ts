import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { getBenchmarkBySector, compareToBenchmark } from "@/lib/benchmarks/sectors"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const analysisId = searchParams.get("analysisId")

    const org = await db.organization.findUnique({
      where: { id: session.user.organizationId },
      select: { niche: true },
    })

    const benchmark = getBenchmarkBySector(org?.niche)

    if (!analysisId) {
      return NextResponse.json({ benchmark })
    }

    const analysis = await db.analysis.findFirst({
      where: { id: analysisId, organizationId: session.user.organizationId },
      select: {
        totalExpenses: true,
        totalIncome: true,
        netResult: true,
        score: true,
      },
    })

    if (!analysis || !analysis.totalIncome || Number(analysis.totalIncome) === 0) {
      return NextResponse.json({ benchmark })
    }

    const income = Number(analysis.totalIncome)
    const expenses = Number(analysis.totalExpenses ?? 0)
    const net = Number(analysis.netResult ?? 0)

    const expenseRatio = (expenses / income) * 100
    const netMarginActual = (net / income) * 100

    const comparisons = [
      {
        label: "Margem Líquida",
        actual: netMarginActual,
        benchmark: benchmark.netMargin,
        suffix: "%",
        comparison: compareToBenchmark(netMarginActual, benchmark.netMargin),
        betterWhenHigher: true,
      },
      {
        label: "Score de Eficiência",
        actual: analysis.score ?? 0,
        benchmark: benchmark.averageScore,
        suffix: "/100",
        comparison: compareToBenchmark(analysis.score ?? 0, benchmark.averageScore),
        betterWhenHigher: true,
      },
      {
        label: "Proporção de Despesas",
        actual: expenseRatio,
        benchmark: 100 - benchmark.netMargin - benchmark.grossMargin / 2,
        suffix: "% da receita",
        comparison: compareToBenchmark(expenseRatio, 100 - benchmark.netMargin - benchmark.grossMargin / 2, true),
        betterWhenHigher: false,
      },
    ]

    return NextResponse.json({
      benchmark,
      niche: org?.niche,
      comparisons,
    })
  } catch (error) {
    console.error("Benchmarks error:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
