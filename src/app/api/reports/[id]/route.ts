import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { generateAnalysisPdf, type PdfReportData } from "@/lib/pdf/generator"

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

    const report = await db.report.findFirst({
      where: { id, organizationId: session.user.organizationId },
      include: {
        analysis: {
          include: {
            insights: { orderBy: { createdAt: "asc" } },
            alerts: { orderBy: { createdAt: "asc" } },
            recommendations: { orderBy: { priority: "asc" } },
            upload: { select: { fileName: true, rowsCount: true } },
            organization: { select: { name: true } },
          },
        },
      },
    })

    if (!report || !report.analysis) {
      return NextResponse.json({ error: "Relatório não encontrado" }, { status: 404 })
    }

    const a = report.analysis

    const data: PdfReportData = {
      orgName: a.organization?.name ?? "Empresa",
      fileName: a.upload?.fileName ?? "Extrato",
      score: a.score ?? 0,
      totalExpenses: String(a.totalExpenses ?? 0),
      totalIncome: String(a.totalIncome ?? 0),
      netResult: String(a.netResult ?? 0),
      savingsMin: String(a.savingsMin ?? 0),
      savingsMax: String(a.savingsMax ?? 0),
      periodStart: a.periodStart ? a.periodStart.toISOString() : null,
      periodEnd: a.periodEnd ? a.periodEnd.toISOString() : null,
      rowsCount: a.upload?.rowsCount ?? null,
      insights: a.insights.map(i => ({
        id: i.id,
        type: i.type,
        title: i.title,
        description: i.description,
        impact: i.impact ?? "low",
        amount: i.amount ? String(i.amount) : null,
      })),
      alerts: a.alerts.map(al => ({
        id: al.id,
        severity: al.severity,
        title: al.title,
        message: al.message,
        amount: al.amount ? String(al.amount) : null,
      })),
      recommendations: a.recommendations.map(r => ({
        id: r.id,
        title: r.title,
        description: r.description,
        urgency: r.urgency,
        savingsEstimate: r.savingsEstimate ? String(r.savingsEstimate) : null,
        priority: r.priority,
      })),
      generatedAt: new Date().toLocaleDateString("pt-BR"),
    }

    const pdfBuffer = await Promise.race([
      generateAnalysisPdf(data),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("PDF generation timeout")), 30_000)
      ),
    ])

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="relatorio-lucro-oculto-${id}.pdf"`,
        "Content-Length": String(pdfBuffer.length),
      },
    })
  } catch (error) {
    console.error("PDF generation error:", error)
    return NextResponse.json({ error: "Erro ao gerar PDF" }, { status: 500 })
  }
}
