import { NextRequest, NextResponse } from "next/server"
import { randomBytes } from "crypto"
import { z } from "zod"
import { db } from "@/lib/db"
import { sendPasswordResetEmail } from "@/lib/email/templates"
import { rateLimit, getClientIp } from "@/lib/rate-limit"
import { logAudit } from "@/lib/audit"

const schema = z.object({
  email: z.string().email("Email inválido").max(254),
})

export async function POST(request: NextRequest) {
  try {
    // Rate limit: 3 pedidos por IP por 15 minutos
    const ip = getClientIp(request)
    const rl = await rateLimit(`forgot-password:${ip}`, 3, 15 * 60 * 1000)
    if (!rl.success) {
      return NextResponse.json({ success: true }) // retorna sucesso mesmo assim (privacidade)
    }

    const body: unknown = await request.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Email inválido" }, { status: 400 })
    }
    const { email } = parsed.data

    // Always return success for privacy (don't reveal if email exists)
    const user = await db.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      select: { id: true, email: true, name: true, passwordHash: true },
    })

    if (user?.passwordHash) {
      // Delete any existing tokens for this user
      await db.passwordResetToken.deleteMany({ where: { userId: user.id } })

      const token = randomBytes(32).toString("hex")
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

      await db.passwordResetToken.create({
        data: { userId: user.id, token, expiresAt },
      })

      void logAudit({ action: "password.reset_requested", status: "success", userId: user.id, ip: getClientIp(request) })

      await sendPasswordResetEmail(user.email, user.name ?? "usuário", token).catch(() => {
        // Log but don't fail — user sees success message regardless
        console.error("Failed to send password reset email")
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Forgot password error:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
