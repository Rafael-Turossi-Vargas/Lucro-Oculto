import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

// DELETE /api/app/team/invite/[token] — Cancel a pending invite
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.organizationId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { organizationId, role } = session.user

  if (role !== "owner" && role !== "admin") {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
  }

  const { token } = await params

  const invite = await db.invite.findFirst({
    where: { token, organizationId },
  })
  if (!invite) return NextResponse.json({ error: "Convite não encontrado" }, { status: 404 })

  await db.invite.delete({ where: { id: invite.id } })

  return NextResponse.json({ success: true })
}
