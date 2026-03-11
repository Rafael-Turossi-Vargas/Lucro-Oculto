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

    const analyses = await db.analysis.findMany({
      where: { organizationId: session.user.organizationId },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        status: true,
        score: true,
        totalExpenses: true,
        totalIncome: true,
        netResult: true,
        savingsMin: true,
        savingsMax: true,
        periodStart: true,
        periodEnd: true,
        createdAt: true,
        completedAt: true,
        upload: { select: { fileName: true, rowsCount: true } },
        _count: { select: { insights: true, alerts: true } },
      },
    })

    return NextResponse.json({ analyses })
  } catch (error) {
    console.error("Analyses list error:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
