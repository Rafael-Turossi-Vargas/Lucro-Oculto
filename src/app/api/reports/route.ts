import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { can } from "@/lib/roles"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || !session?.user?.organizationId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    if (!can(session.user.role, "reports:generate")) {
      return NextResponse.json({ error: "Sem permissão para gerar relatórios" }, { status: 403 })
    }

    const { analysisId } = await request.json()

    if (!analysisId) {
      return NextResponse.json(
        { error: "analysisId obrigatório" },
        { status: 400 }
      )
    }

    const analysis = await db.analysis.findFirst({
      where: {
        id: analysisId,
        organizationId: session.user.organizationId,
      },
      include: {
        insights: true,
        alerts: true,
        recommendations: { orderBy: { priority: "asc" } },
        scoreSnapshots: { take: 1 },
        organization: true,
      },
    })

    if (!analysis) {
      return NextResponse.json(
        { error: "Análise não encontrada" },
        { status: 404 }
      )
    }

    const report = await db.report.create({
      data: {
        organizationId: session.user.organizationId,
        analysisId,
        userId: session.user.id,
        title: `Relatório de Eficiência Financeira — ${new Date().toLocaleDateString("pt-BR")}`,
        status: "generating",
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    })

    await db.report.update({
      where: { id: report.id },
      data: {
        status: "done",
        fileUrl: `/api/reports/${report.id}/download`,
      },
    })

    return NextResponse.json({
      reportId: report.id,
      status: "done",
    })
  } catch (error) {
    console.error("Report generation error:", error)
    return NextResponse.json(
      { error: "Erro ao gerar relatório" },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const reports = await db.report.findMany({
      where: { organizationId: session.user.organizationId },
      orderBy: { createdAt: "desc" },
      take: 20,
    })

    return NextResponse.json(reports)
  } catch (error) {
    console.error("Reports fetch error:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}