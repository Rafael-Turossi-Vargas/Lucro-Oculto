import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { sendInviteCredentialsEmail } from "@/lib/email/templates"
import bcrypt from "bcryptjs"
import crypto from "crypto"

function generatePassword(): string {
  // 12 chars: letters + digits + symbols — readable, no ambiguous chars (0/O/l/1)
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#%"
  return Array.from(crypto.randomBytes(12), (b) => chars[b % chars.length]).join("")
}

// POST /api/app/team/accept/[token] — Accept invite (no auth required)
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params

  const invite = await db.invite.findUnique({
    where: { token },
    include: { organization: { select: { name: true } } },
  })

  if (!invite) return NextResponse.json({ error: "Convite inválido" }, { status: 404 })
  if (invite.acceptedAt) return NextResponse.json({ error: "Convite já utilizado" }, { status: 400 })
  if (invite.expiresAt < new Date()) return NextResponse.json({ error: "Convite expirado" }, { status: 400 })

  const email = invite.email.toLowerCase()
  const existingUser = await db.user.findUnique({ where: { email } })

  if (!existingUser) {
    // ── New user: create account with random password ──────────────────────
    const plainPassword = generatePassword()
    const passwordHash = await bcrypt.hash(plainPassword, 12)

    const user = await db.user.create({
      data: {
        email,
        name: email.split("@")[0],
        passwordHash,
        isInvitedUser: true,
        preferredOrganizationId: invite.organizationId,
      },
    })

    await db.$transaction([
      db.membership.create({
        data: {
          userId: user.id,
          organizationId: invite.organizationId,
          role: invite.role,
        },
      }),
      db.invite.update({
        where: { id: invite.id },
        data: { acceptedAt: new Date() },
      }),
    ])

    // Send credentials email (fire-and-forget)
    sendInviteCredentialsEmail(
      email,
      plainPassword,
      invite.organization.name,
      invite.invitedByName ?? "Seu gestor"
    ).catch((err) => console.error("[invite:credentials-email]", err))

    return NextResponse.json({ success: true, isNewUser: true, email })
  }

  // ── Existing user: just add membership ──────────────────────────────────
  const existingMembership = await db.membership.findFirst({
    where: { userId: existingUser.id, organizationId: invite.organizationId },
  })

  if (!existingMembership) {
    await db.$transaction([
      db.membership.create({
        data: {
          userId: existingUser.id,
          organizationId: invite.organizationId,
          role: invite.role,
        },
      }),
      db.invite.update({
        where: { id: invite.id },
        data: { acceptedAt: new Date() },
      }),
      db.user.update({
        where: { id: existingUser.id },
        data: { preferredOrganizationId: invite.organizationId },
      }),
    ])
  } else {
    await db.invite.update({ where: { id: invite.id }, data: { acceptedAt: new Date() } })
  }

  return NextResponse.json({ success: true, isNewUser: false, email })
}

// GET /api/app/team/accept/[token] — Get invite info (public)
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params

  const invite = await db.invite.findUnique({
    where: { token },
    include: { organization: { select: { name: true } } },
  })

  if (!invite) return NextResponse.json({ error: "Convite inválido" }, { status: 404 })
  if (invite.acceptedAt) return NextResponse.json({ error: "Convite já utilizado" }, { status: 400 })
  if (invite.expiresAt < new Date()) return NextResponse.json({ error: "Convite expirado" }, { status: 400 })

  // Check if current session user is already logged in (to customize UX)
  const session = await getServerSession(authOptions)
  const currentEmail = session?.user?.email?.toLowerCase() ?? null

  return NextResponse.json({
    email: invite.email,
    organizationName: invite.organization.name,
    invitedByName: invite.invitedByName,
    currentEmail,
  })
}
