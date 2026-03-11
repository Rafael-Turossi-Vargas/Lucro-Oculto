import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { can } from "@/lib/roles"

export async function GET(
  _req: NextRequest,
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
        insights: { orderBy: { amount: "desc" } },
        alerts: { orderBy: { createdAt: "desc" } },
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
    console.error("Analysis by ID error:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }
    if (!can(session.user.role, "upload:delete")) {
      return NextResponse.json({ error: "Sem permissão para excluir análises" }, { status: 403 })
    }

    const { id } = await params

    const analysis = await db.analysis.findFirst({
      where: { id, organizationId: session.user.organizationId },
      select: { id: true, uploadId: true },
    })

    if (!analysis) {
      return NextResponse.json({ error: "Análise não encontrada" }, { status: 404 })
    }

    // Delete non-cascading relations first, then analysis (cascades insights/alerts/recommendations)
    await db.$transaction([
      db.scoreSnapshot.deleteMany({ where: { analysisId: id } }),
      db.report.deleteMany({ where: { analysisId: id } }),
      db.analysis.delete({ where: { id } }),
      db.upload.delete({ where: { id: analysis.uploadId } }),
    ])

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Analysis delete error:", error)
    return NextResponse.json({ error: "Erro ao excluir análise" }, { status: 500 })
  }
}
