import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import bcrypt from "bcryptjs"

import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { logAudit } from "@/lib/audit"

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

    if (session.user.role !== "admin") {
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

// DELETE /api/account — exclui a conta e toda a organização (apenas owner)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || !session?.user?.organizationId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    if (session.user.role !== "owner") {
      return NextResponse.json({ error: "Apenas o proprietário pode excluir a conta" }, { status: 403 })
    }

    const { password } = await request.json() as { password?: string }

    if (!password) {
      return NextResponse.json({ error: "Senha obrigatória para confirmar exclusão" }, { status: 400 })
    }

    // Verifica senha antes de excluir
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { passwordHash: true },
    })

    if (!user?.passwordHash) {
      return NextResponse.json({ error: "Conta sem senha definida" }, { status: 400 })
    }

    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) {
      return NextResponse.json({ error: "Senha incorreta" }, { status: 400 })
    }

    // Exclui organização em cascata (analyses, insights, alerts, recommendations, uploads, reports, members)
    await db.organization.delete({
      where: { id: session.user.organizationId },
    })

    void logAudit({ action: "account.deleted", status: "success", userId: session.user.id, organizationId: session.user.organizationId })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Account delete error:", error)
    return NextResponse.json({ error: "Erro ao excluir conta" }, { status: 500 })
  }
}