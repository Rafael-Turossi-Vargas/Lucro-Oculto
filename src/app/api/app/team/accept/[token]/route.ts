import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { sendInviteSetupEmail } from "@/lib/email/templates"
import { rateLimit } from "@/lib/rate-limit"
import bcrypt from "bcryptjs"
import crypto from "crypto"

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
    // ── New user: create account with random unusable password, send setup link ──
    // Never expose a plain-text password — instead generate a password-reset token
    const randomHash = await bcrypt.hash(crypto.randomUUID(), 12)

    const user = await db.user.create({
      data: {
        email,
        name: email.split("@")[0],
        passwordHash: randomHash,
        isInvitedUser: true,
        emailVerified: new Date(), // email implicitly verified via invite link
        preferredOrganizationId: invite.organizationId,
      },
    })

    const setupToken = crypto.randomUUID()
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

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
      db.passwordResetToken.create({
        data: { userId: user.id, token: setupToken, expiresAt },
      }),
    ])

    // Send secure setup link email — no plain-text password (fire-and-forget)
    sendInviteSetupEmail(
      email,
      setupToken,
      invite.organization.name,
      invite.invitedByName ?? "Seu gestor"
    ).catch((err) => console.error("[invite:setup-email]", err))

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
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  // Rate limit: 20 lookups per IP per hour
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
  const rl = rateLimit(`invite-lookup:${ip}`, 20, 60 * 60 * 1000)
  if (!rl.success) {
    return NextResponse.json({ error: "Muitas tentativas. Tente novamente mais tarde." }, { status: 429 })
  }

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
