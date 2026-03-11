import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { id } = await params

    const analysis = await db.analysis.findFirst({
      where: { id, organizationId: session.user.organizationId },
      include: {
        insights: { orderBy: { createdAt: "asc" } },
        alerts: { orderBy: { createdAt: "asc" } },
        recommendations: { orderBy: { priority: "asc" } },
        scoreSnapshots: { orderBy: { createdAt: "desc" }, take: 1 },
        upload: { select: { fileName: true, rowsCount: true, periodStart: true, periodEnd: true } },
      },
    })

    if (!analysis) {
      return NextResponse.json({ error: "Análise não encontrada" }, { status: 404 })
    }

    return NextResponse.json(analysis)
  } catch (error) {
    console.error("Analysis fetch error:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
