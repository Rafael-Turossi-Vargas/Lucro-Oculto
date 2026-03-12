import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || !session?.user?.organizationId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const body = await req.json().catch(() => ({}))
    const score = (body as { score?: unknown; comment?: unknown }).score
    const comment = (body as { score?: unknown; comment?: unknown }).comment

    if (typeof score !== "number" || !Number.isInteger(score) || score < 0 || score > 10) {
      return NextResponse.json({ error: "Score deve ser um número inteiro entre 0 e 10" }, { status: 400 })
    }

    const commentValue = typeof comment === "string" ? comment.slice(0, 500) : null

    // Upsert: one response per user per org (update if already submitted)
    await db.npsResponse.upsert({
      where: {
        userId_organizationId: {
          userId: session.user.id,
          organizationId: session.user.organizationId,
        },
      },
      update: { score, comment: commentValue },
      create: {
        userId: session.user.id,
        organizationId: session.user.organizationId,
        score,
        comment: commentValue,
      },
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
