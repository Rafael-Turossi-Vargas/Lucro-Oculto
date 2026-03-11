import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { db } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json() as { token?: string; password?: string }

    if (!token || !password) {
      return NextResponse.json({ error: "Token e senha são obrigatórios" }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "A senha deve ter no mínimo 8 caracteres" }, { status: 400 })
    }

    const resetToken = await db.passwordResetToken.findUnique({
      where: { token },
      include: { user: { select: { id: true } } },
    })

    if (!resetToken) {
      return NextResponse.json({ error: "Token inválido ou expirado" }, { status: 400 })
    }

    if (resetToken.usedAt) {
      return NextResponse.json({ error: "Este link já foi utilizado" }, { status: 400 })
    }

    if (resetToken.expiresAt < new Date()) {
      return NextResponse.json({ error: "Link expirado. Solicite um novo." }, { status: 400 })
    }

    const passwordHash = await bcrypt.hash(password, 12)

    await db.$transaction([
      db.user.update({
        where: { id: resetToken.userId },
        data: { passwordHash },
      }),
      db.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { usedAt: new Date() },
      }),
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Reset password error:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
