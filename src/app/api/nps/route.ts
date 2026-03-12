import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || !session?.user?.organizationId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const body = await req.json().catch(() => ({}))
    const score = (body as { score?: unknown }).score

    if (typeof score !== "number" || !Number.isInteger(score) || score < 0 || score > 10) {
      return NextResponse.json({ error: "Score deve ser um número inteiro entre 0 e 10" }, { status: 400 })
    }

    // TODO: persist to NPS table (add NpsResponse model to schema)
    console.log("[NPS]", { userId: session.user.id, organizationId: session.user.organizationId, score })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
