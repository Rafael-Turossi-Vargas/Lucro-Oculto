import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { deletePluggyItem } from "@/lib/pluggy"

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ itemId: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.organizationId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { itemId } = await params

  const connection = await db.bankConnection.findFirst({
    where: { pluggyItemId: itemId, organizationId: session.user.organizationId },
  })

  if (!connection) {
    return NextResponse.json({ error: "Connection not found" }, { status: 404 })
  }

  if (process.env.PLUGGY_CLIENT_ID && process.env.PLUGGY_CLIENT_SECRET) {
    try {
      await deletePluggyItem(itemId)
    } catch {
      // continue even if Pluggy deletion fails
    }
  }

  await db.bankConnection.update({
    where: { pluggyItemId: itemId },
    data: { status: "disconnected" },
  })

  return NextResponse.json({ ok: true })
}
