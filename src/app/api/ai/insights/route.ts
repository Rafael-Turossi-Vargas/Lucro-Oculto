import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

type InsightItem = {
  id: string
  type: string
  title: string
  description: string
  impact: string | null
  urgency: string | null
  amount: unknown
  category: string | null
  status: string
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const analysis = await db.analysis.findFirst({
      where: {
        organizationId: session.user.organizationId,
        status: "done",
      },
      orderBy: { createdAt: "desc" },
      include: {
        insights: true,
        alerts: true,
        recommendations: true,
      },
    })

    if (!analysis) {
      return NextResponse.json({ error: "Nenhuma análise encontrada" }, { status: 404 })
    }

    const insights = analysis.insights as InsightItem[]

    const leaks = insights.filter((i: InsightItem) => i.type === "leak")
    const opportunities = insights.filter((i: InsightItem) => i.type === "opportunity")
    const criticalAlerts = insights.filter(
      (i: InsightItem) => i.type === "leak" && i.impact === "high"
    )

    return NextResponse.json({
      analysisId: analysis.id,
      leaks,
      opportunities,
      criticalAlerts,
      alerts: analysis.alerts,
      recommendations: analysis.recommendations,
    })
  } catch (error) {
    console.error("AI insights error:", error)
    return NextResponse.json(
      { error: "Erro ao carregar insights" },
      { status: 500 }
    )
  }
}