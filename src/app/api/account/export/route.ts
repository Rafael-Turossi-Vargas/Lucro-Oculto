import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

// GET /api/account/export — exporta todos os dados da organização (LGPD) — somente proprietário
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || !session?.user?.organizationId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    if (session.user.role !== "owner" && session.user.role !== "admin") {
      return NextResponse.json({ error: "Apenas o proprietário pode exportar os dados da organização" }, { status: 403 })
    }

    const userId = session.user.id
    const organizationId = session.user.organizationId

    const [user, organization, analyses, uploads, reports] = await Promise.all([
      db.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, email: true, createdAt: true, updatedAt: true },
      }),
      db.organization.findUnique({
        where: { id: organizationId },
        select: { id: true, name: true, slug: true, niche: true, plan: true, createdAt: true },
      }),
      db.analysis.findMany({
        where: { organizationId },
        orderBy: { createdAt: "desc" },
        select: {
          id: true, status: true, score: true,
          totalExpenses: true, totalIncome: true, netResult: true,
          savingsMin: true, savingsMax: true,
          periodStart: true, periodEnd: true, createdAt: true,
          insights: { select: { type: true, title: true, description: true, impact: true, amount: true } },
          alerts: { select: { type: true, severity: true, title: true, message: true } },
          recommendations: { select: { title: true, description: true, urgency: true, savingsEstimate: true } },
        },
      }),
      db.upload.findMany({
        where: { organizationId },
        orderBy: { createdAt: "desc" },
        select: { id: true, fileName: true, fileSize: true, fileType: true, status: true, rowsCount: true, createdAt: true },
      }),
      db.report.findMany({
        where: { organizationId },
        orderBy: { createdAt: "desc" },
        select: { id: true, title: true, status: true, createdAt: true },
      }),
    ])

    const exportData = {
      exportedAt: new Date().toISOString(),
      user,
      organization,
      summary: {
        totalAnalyses: analyses.length,
        totalUploads: uploads.length,
        totalReports: reports.length,
      },
      analyses,
      uploads,
      reports,
    }

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="lucro-oculto-dados-${new Date().toISOString().slice(0, 10)}.json"`,
      },
    })
  } catch (error) {
    console.error("Account export error:", error)
    return NextResponse.json({ error: "Erro ao exportar dados" }, { status: 500 })
  }
}
