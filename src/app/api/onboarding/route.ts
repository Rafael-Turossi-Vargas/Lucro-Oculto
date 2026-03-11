import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const data = await request.json()
    const { businessType, niche, monthlyRevenueRange, employeeCountRange, financialTools, mainPainPoints, primaryGoal, currentControl } = data

    await db.$transaction([
      db.onboardingProfile.upsert({
        where: { organizationId: session.user.organizationId },
        update: {
          businessType,
          niche: niche ?? businessType,
          monthlyRevenueRange,
          employeeCountRange,
          financialTools: financialTools ?? [],
          mainPainPoints: mainPainPoints ?? [],
          primaryGoal,
          currentControl,
          completed: true,
          completedAt: new Date(),
        },
        create: {
          organizationId: session.user.organizationId,
          businessType,
          niche: niche ?? businessType,
          monthlyRevenueRange,
          employeeCountRange,
          financialTools: financialTools ?? [],
          mainPainPoints: mainPainPoints ?? [],
          primaryGoal,
          currentControl,
          completed: true,
          completedAt: new Date(),
        },
      }),
      db.organization.update({
        where: { id: session.user.organizationId },
        data: { niche: niche ?? businessType },
      }),
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Onboarding error:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
