import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { can, getInvitableRoles } from "@/lib/roles"
import { z } from "zod"

// DELETE /api/app/team/[userId] — Remove a member
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.organizationId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { organizationId, plan, role, id: requesterId } = session.user

  if (plan !== "premium" && plan !== "admin") {
    return NextResponse.json({ error: "Plano Premium necessário" }, { status: 403 })
  }
  if (!can(role, "team:remove")) {
    return NextResponse.json({ error: "Apenas o proprietário pode remover membros" }, { status: 403 })
  }

  const { userId } = await params

  if (userId === requesterId) {
    return NextResponse.json({ error: "Você não pode remover a si mesmo" }, { status: 400 })
  }

  const membership = await db.membership.findFirst({
    where: { userId, organizationId },
  })
  if (!membership) return NextResponse.json({ error: "Membro não encontrado" }, { status: 404 })
  if (membership.role === "owner") {
    return NextResponse.json({ error: "Não é possível remover o proprietário" }, { status: 400 })
  }

  await db.membership.delete({ where: { id: membership.id } })

  await db.user.updateMany({
    where: { id: userId, preferredOrganizationId: organizationId },
    data: { preferredOrganizationId: null },
  })

  return NextResponse.json({ success: true })
}

// PATCH /api/app/team/[userId] — Change a member's role
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.organizationId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { organizationId, plan, role: requesterRole, id: requesterId } = session.user

  if (plan !== "premium" && plan !== "admin") {
    return NextResponse.json({ error: "Plano Premium necessário" }, { status: 403 })
  }
  if (!can(requesterRole, "team:change_role")) {
    return NextResponse.json({ error: "Apenas o proprietário pode alterar funções" }, { status: 403 })
  }

  const { userId } = await params

  if (userId === requesterId) {
    return NextResponse.json({ error: "Você não pode alterar sua própria função" }, { status: 400 })
  }

  const body = await req.json().catch(() => ({}))
  const parsed = z.object({ role: z.string().min(1) }).safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Função inválida" }, { status: 400 })

  const { role: newRole } = parsed.data

  // Owner can only assign invitable roles (cannot promote to owner)
  const assignable = getInvitableRoles(requesterRole)
  if (!assignable.includes(newRole as never)) {
    return NextResponse.json({ error: `Não é possível atribuir a função "${newRole}"` }, { status: 403 })
  }

  const membership = await db.membership.findFirst({
    where: { userId, organizationId },
  })
  if (!membership) return NextResponse.json({ error: "Membro não encontrado" }, { status: 404 })
  if (membership.role === "owner") {
    return NextResponse.json({ error: "Não é possível alterar a função do proprietário" }, { status: 400 })
  }

  await db.membership.update({
    where: { id: membership.id },
    data: { role: newRole },
  })

  return NextResponse.json({ success: true })
}
