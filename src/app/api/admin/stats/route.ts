import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    const plan = (session?.user as { plan?: string })?.plan

    if (!session?.user?.id || plan !== "admin") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 })
    }

    const [
      totalUsers,
      totalOrgs,
      totalAnalyses,
      totalUploads,
      planDistribution,
      recentAnalyses,
      recentUsers,
    ] = await Promise.all([
      db.user.count(),
      db.organization.count(),
      db.analysis.count(),
      db.upload.count(),
      db.organization.groupBy({ by: ["plan"], _count: { _all: true } }),
      db.analysis.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          status: true,
          score: true,
          createdAt: true,
          organization: { select: { name: true } },
          upload: { select: { fileName: true } },
        },
      }),
      db.user.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          memberships: {
            select: { organization: { select: { name: true, plan: true } } },
          },
        },
      }),
    ])

    const planMap = Object.fromEntries(
      planDistribution.map((p) => [p.plan, p._count._all])
    )

    return NextResponse.json({
      totals: { users: totalUsers, orgs: totalOrgs, analyses: totalAnalyses, uploads: totalUploads },
      planDistribution: {
        free: planMap["free"] ?? 0,
        pro: planMap["pro"] ?? 0,
        admin: planMap["admin"] ?? 0,
      },
      recentAnalyses,
      recentUsers,
    })
  } catch (error) {
    console.error("Admin stats error:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
