import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { sendTeamInviteEmail } from "@/lib/email/templates"
import { can, getInvitableRoles } from "@/lib/roles"
import { z } from "zod"
import { logAudit } from "@/lib/audit"

const MAX_MEMBERS = 5

// GET /api/app/team — List team members and pending invites
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.organizationId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { organizationId, plan, role } = session.user

  if (plan !== "premium" && plan !== "admin") {
    return NextResponse.json({ error: "Plano Premium necessário" }, { status: 403 })
  }
  if (!can(role, "team:view")) {
    return NextResponse.json({ error: "Sem permissão para ver a equipe" }, { status: 403 })
  }

  const [members, invites] = await Promise.all([
    db.membership.findMany({
      where: { organizationId },
      include: { user: { select: { id: true, name: true, email: true, createdAt: true } } },
      orderBy: { createdAt: "asc" },
    }),
    db.invite.findMany({
      where: { organizationId, acceptedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: "desc" },
    }),
  ])

  return NextResponse.json({ members, invites, maxMembers: MAX_MEMBERS, role })
}

// POST /api/app/team — Invite a new member
export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.organizationId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { organizationId, plan, role } = session.user
  const inviterName = session.user.name ?? ""

  if (plan !== "premium" && plan !== "admin") {
    return NextResponse.json({ error: "Plano Premium necessário" }, { status: 403 })
  }
  if (!can(role, "team:invite")) {
    return NextResponse.json({ error: "Sem permissão para convidar membros" }, { status: 403 })
  }

  const body = await req.json().catch(() => ({}))
  const parsed = z.object({
    email: z.string().email(),
    role: z.string().min(1),
  }).safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 })

  const { email, role: targetRole } = parsed.data

  // Validate that the inviter can assign this role
  const invitableRoles = getInvitableRoles(role)
  if (!invitableRoles.includes(targetRole as never)) {
    return NextResponse.json({
      error: `Você não pode convidar com a função "${targetRole}"`,
    }, { status: 403 })
  }

  // Check member limit
  const memberCount = await db.membership.count({ where: { organizationId } })
  if (memberCount >= MAX_MEMBERS) {
    return NextResponse.json({ error: `Limite de ${MAX_MEMBERS} membros atingido` }, { status: 400 })
  }

  // Check if already a member
  const existingMember = await db.membership.findFirst({
    where: { organizationId, user: { email } },
  })
  if (existingMember) return NextResponse.json({ error: "Este usuário já é membro" }, { status: 400 })

  const org = await db.organization.findUnique({ where: { id: organizationId }, select: { name: true } })

  // Upsert invite (reset token + expiry if re-inviting)
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  const invite = await db.invite.upsert({
    where: { organizationId_email: { organizationId, email } },
    update: { token: crypto.randomUUID(), expiresAt, acceptedAt: null, invitedByName: inviterName, role: targetRole },
    create: { organizationId, email, role: targetRole, expiresAt, invitedByName: inviterName },
  })

  await sendTeamInviteEmail(email, invite.token, org?.name ?? "sua empresa", inviterName ?? "Alguém").catch(() => {})

  void logAudit({ action: "team.member_invited", status: "success", userId: session.user.id, organizationId, metadata: { targetEmail: email, role: targetRole } })

  return NextResponse.json({ success: true, invite })
}
