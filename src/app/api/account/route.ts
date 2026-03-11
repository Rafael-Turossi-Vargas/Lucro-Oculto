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

    if (session.user.role !== "admin" && session.user.role !== "owner") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
    }

    const [
      totalUsers,
      totalOrganizations,
      totalUploads,
      totalReports,
      totalAnalyses,
      planDistribution,
    ] = await Promise.all([
      db.user.count(),
      db.organization.count(),
      db.upload.count(),
      db.report.count(),
      db.analysis.count(),
      db.organization.groupBy({
        by: ["plan"],
        _count: {
          _all: true,
        },
      }),
    ])

    const typedPlanDistribution = planDistribution as PlanDistributionItem[]

    const planMap = Object.fromEntries(
      typedPlanDistribution.map((planItem: PlanDistributionItem) => [
        planItem.plan,
        planItem._count._all,
      ])
    )

    return NextResponse.json({
      totals: {
        users: totalUsers,
        organizations: totalOrganizations,
        uploads: totalUploads,
        reports: totalReports,
        analyses: totalAnalyses,
      },
      plans: {
        free: planMap.free ?? 0,
        pro: planMap.pro ?? 0,
        enterprise: planMap.enterprise ?? 0,
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