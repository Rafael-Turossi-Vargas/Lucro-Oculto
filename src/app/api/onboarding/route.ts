import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { z } from "zod"

const ALLOWED_STRINGS = z.string().max(100).optional()

const onboardingSchema = z.object({
  businessType: ALLOWED_STRINGS,
  niche: ALLOWED_STRINGS,
  monthlyRevenueRange: ALLOWED_STRINGS,
  employeeCountRange: ALLOWED_STRINGS,
  financialTools: z.array(z.string().max(100)).max(20).optional(),
  mainPainPoints: z.array(z.string().max(100)).max(20).optional(),
  primaryGoal: ALLOWED_STRINGS,
  currentControl: ALLOWED_STRINGS,
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const parsed = onboardingSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 })
    }
    const { businessType, niche, monthlyRevenueRange, employeeCountRange, financialTools, mainPainPoints, primaryGoal, currentControl } = parsed.data

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
