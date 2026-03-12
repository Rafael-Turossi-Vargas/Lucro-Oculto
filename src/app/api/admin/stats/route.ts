import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

type PlanDistributionItem = {
  plan: string
  _count: {
    _all: number
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Only system-level admin (not org owners) can access global stats
    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
    }

    const [
      totalOrganizations,
      totalUsers,
      totalUploads,
      totalReports,
      planDistributionRaw,
    ] = await Promise.all([
      db.organization.count(),
      db.user.count(),
      db.upload.count(),
      db.report.count(),
      db.organization.groupBy({
        by: ["plan"],
        _count: {
          _all: true,
        },
      }),
    ])

    const planDistribution = planDistributionRaw as PlanDistributionItem[]

    const planMap = Object.fromEntries(
      planDistribution.map((p: PlanDistributionItem) => [p.plan, p._count._all])
    )

    return NextResponse.json({
      totalOrganizations,
      totalUsers,
      totalUploads,
      totalReports,
      plans: {
        free: planMap.free ?? 0,
        pro: planMap.pro ?? 0,
        premium: planMap.premium ?? 0,
      },
    })
  } catch (error) {
    console.error("Admin stats error:", error)
    return NextResponse.json(
      { error: "Erro ao carregar estatísticas" },
      { status: 500 }
    )
  }
}