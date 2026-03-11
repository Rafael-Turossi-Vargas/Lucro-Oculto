import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { can } from "@/lib/roles"
import bcrypt from "bcryptjs"
import { z } from "zod"

const pinSchema = z.object({
  pin: z
    .string()
    .min(4, "PIN deve ter no mínimo 4 dígitos")
    .max(8, "PIN deve ter no máximo 8 dígitos")
    .regex(/^\d+$/, "PIN deve conter apenas números"),
})

// PUT — Set or change the finance PIN (owner only)
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    if (!can(session.user.role, "finance:manage")) {
      return NextResponse.json({ error: "Apenas o proprietário pode configurar o PIN financeiro" }, { status: 403 })
    }

    const body = await req.json().catch(() => ({}))
    const parsed = pinSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "PIN inválido" }, { status: 400 })
    }

    const hash = await bcrypt.hash(parsed.data.pin, 12)

    await db.organization.update({
      where: { id: session.user.organizationId },
      data: {
        financePinHash: hash,
        financePinAttempts: 0,
        financePinLockedUntil: null,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Set PIN error:", error)
    const msg = process.env.NODE_ENV === "development" && error instanceof Error ? error.message : "Erro ao salvar PIN"
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

// DELETE — Remove the finance PIN (owner only)
export async function DELETE() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    if (!can(session.user.role, "finance:manage")) {
      return NextResponse.json({ error: "Apenas o proprietário pode remover o PIN financeiro" }, { status: 403 })
    }

    await db.organization.update({
      where: { id: session.user.organizationId },
      data: { financePinHash: null, financePinAttempts: 0, financePinLockedUntil: null },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Remove PIN error:", error)
    return NextResponse.json({ error: "Erro ao remover PIN" }, { status: 500 })
  }
}

// GET — Check whether a PIN is configured (owner only — for settings UI)
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    if (!can(session.user.role, "finance:manage")) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 })
    }

    const org = await db.organization.findUnique({
      where: { id: session.user.organizationId },
      select: { financePinHash: true },
    })

    return NextResponse.json({ hasPin: !!org?.financePinHash })
  } catch (error) {
    console.error("Get PIN status error:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
