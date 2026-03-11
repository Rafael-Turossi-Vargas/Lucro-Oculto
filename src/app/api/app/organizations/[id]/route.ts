import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

// Cooldown em horas aplicado quando o usuário exclui estando no limite máximo de empresas
const COOLDOWN_HOURS = 72
const MAX_ORGS = 3

// DELETE /api/app/organizations/[id]
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.organizationId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const userId = session.user.id
  const plan = session.user.plan
  const { id: orgId } = await params

  if (plan !== "premium" && plan !== "admin") {
    return NextResponse.json({ error: "Plano Premium necessário" }, { status: 403 })
  }

  // Verifica se é dono desta organização
  const membership = await db.membership.findFirst({
    where: { userId, organizationId: orgId, role: "owner" },
  })
  if (!membership) {
    return NextResponse.json({ error: "Você não é o dono desta empresa" }, { status: 403 })
  }

  // Garante que a org existe e não está já excluída
  const org = await db.organization.findFirst({
    where: { id: orgId, deletedAt: null },
  })
  if (!org) {
    return NextResponse.json({ error: "Empresa não encontrada" }, { status: 404 })
  }

  // Não pode excluir a empresa ativa da sessão — deve trocar primeiro
  const currentOrgId = session.user.organizationId
  if (orgId === currentOrgId) {
    return NextResponse.json({
      error: "Não é possível excluir a empresa ativa. Troque para outra empresa antes de excluir esta.",
    }, { status: 400 })
  }

  // Conta quantas orgs ativas o usuário possui como dono
  const activeOwnedCount = await db.membership.count({
    where: {
      userId,
      role: "owner",
      organization: { deletedAt: null },
    },
  })

  // Não pode excluir a última empresa
  if (activeOwnedCount <= 1) {
    return NextResponse.json({
      error: "Você não pode excluir sua única empresa.",
    }, { status: 400 })
  }

  // Soft-delete: preserva todos os dados, apenas marca como excluída
  await db.$transaction(async (tx) => {
    await tx.organization.update({
      where: { id: orgId },
      data: { deletedAt: new Date() },
    })

    // Remove a membership do dono na org excluída
    await tx.membership.delete({ where: { id: membership.id } })

    // Se estava no limite máximo, aplica cooldown para criação de nova empresa
    if (activeOwnedCount >= MAX_ORGS) {
      const cooldownUntil = new Date(Date.now() + COOLDOWN_HOURS * 60 * 60 * 1000)
      await tx.user.update({
        where: { id: userId },
        data: { orgCooldownUntil: cooldownUntil },
      })
    }

    // Se a org excluída era a preferida de alguém, limpa a preferência
    await tx.user.updateMany({
      where: { preferredOrganizationId: orgId },
      data: { preferredOrganizationId: null },
    })

    // Cancela convites pendentes da org excluída
    await tx.invite.deleteMany({ where: { organizationId: orgId } })
  })

  return NextResponse.json({
    success: true,
    cooldownApplied: activeOwnedCount >= MAX_ORGS,
    cooldownHours: COOLDOWN_HOURS,
  })
}
