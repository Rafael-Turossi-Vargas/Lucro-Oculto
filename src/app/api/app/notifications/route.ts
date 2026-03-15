import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }
    const orgId = session.user.organizationId

    const alerts = await db.alert.findMany({
      where: { organizationId: orgId, isDismissed: false },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        type: true,
        severity: true,
        title: true,
        message: true,
        amount: true,
        isRead: true,
        createdAt: true,
        analysisId: true,
      },
    })

    const unreadCount = alerts.filter((a) => !a.isRead).length

    return NextResponse.json({ alerts, unreadCount })
  } catch (error) {
    console.error("Notifications GET error:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

export async function PATCH() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }
    const orgId = session.user.organizationId

    await db.alert.updateMany({
      where: { organizationId: orgId, isRead: false, isDismissed: false },
      data: { isRead: true },
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Notifications PATCH error:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
