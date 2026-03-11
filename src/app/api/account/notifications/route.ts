import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

const DEFAULT_PREFS = {
  leaks: true,
  alerts: true,
  weekly: false,
  tips: true,
  billing: true,
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { notificationPrefs: true },
    })

    const prefs = (user?.notificationPrefs as typeof DEFAULT_PREFS | null) ?? DEFAULT_PREFS
    return NextResponse.json({ prefs })
  } catch {
    return NextResponse.json({ error: "Erro ao buscar preferências" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const body = await req.json() as Partial<typeof DEFAULT_PREFS>
    const prefs = { ...DEFAULT_PREFS, ...body }

    await db.user.update({
      where: { id: session.user.id },
      data: { notificationPrefs: prefs },
    })

    return NextResponse.json({ prefs })
  } catch {
    return NextResponse.json({ error: "Erro ao salvar preferências" }, { status: 500 })
  }
}
