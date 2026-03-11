import { NextRequest, NextResponse } from "next/server"
import { randomBytes } from "crypto"
import { db } from "@/lib/db"
import { sendPasswordResetEmail } from "@/lib/email/templates"
import { rateLimit } from "@/lib/rate-limit"

export async function POST(request: NextRequest) {
  try {
    // Rate limit: 3 pedidos por IP por 15 minutos
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
    const rl = rateLimit(`forgot-password:${ip}`, 3, 15 * 60 * 1000)
    if (!rl.success) {
      return NextResponse.json({ success: true }) // retorna sucesso mesmo assim (privacidade)
    }

    const { email } = await request.json() as { email?: string }

    if (!email) {
      return NextResponse.json({ error: "Email obrigatório" }, { status: 400 })
    }

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
