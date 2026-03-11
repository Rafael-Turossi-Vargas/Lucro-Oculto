import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const orgId = session.user.organizationId

    // Busca última análise completa
    const analysis = await db.analysis.findFirst({
      where: { organizationId: orgId, status: "done" },
      orderBy: { completedAt: "desc" },
      include: {
        insights: { orderBy: { amount: "desc" } },
        alerts: { where: { isDismissed: false }, orderBy: { createdAt: "desc" } },
        recommendations: { orderBy: { priority: "asc" } },
        scoreSnapshots: { orderBy: { createdAt: "desc" }, take: 1 },
        upload: { select: { fileName: true, rowsCount: true, periodStart: true, periodEnd: true } },
      },
    })

    // Score histórico (últimas 6 análises)
    const scoreHistory = await db.scoreSnapshot.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: "asc" },
      take: 6,
      select: { score: true, createdAt: true, analysisId: true },
    })

    // Contagem total de análises
    const analysesCount = await db.analysis.count({
      where: { organizationId: orgId, status: "done" },
    })

    // Análise em processamento?
    const pending = await db.analysis.findFirst({
      where: { organizationId: orgId, status: { in: ["pending", "running"] } },
      select: { id: true, status: true, createdAt: true },
    })

    return NextResponse.json({
      analysis,
      scoreHistory,
      analysesCount,
      pending,
    })
  } catch (error) {
    console.error("Dashboard API error:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
