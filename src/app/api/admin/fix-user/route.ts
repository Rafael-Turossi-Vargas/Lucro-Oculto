import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { db } from "@/lib/db"

/**
 * Endpoint temporário para corrigir usuários bloqueados por tokens expirados.
 * Protegido por ADMIN_SECRET env var.
 * Uso: POST /api/admin/fix-user { email, password?, secret }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { email?: string; password?: string; secret?: string }
    const { email, password, secret } = body

    const adminSecret = process.env.ADMIN_SECRET
    if (!adminSecret || secret !== adminSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!email) {
      return NextResponse.json({ error: "email required" }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase().trim()

    const user = await db.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, email: true, emailVerified: true },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Delete expired/pending verification tokens
    const deletedTokens = await db.verificationToken.deleteMany({
      where: { identifier: normalizedEmail },
    })

    // Mark email as verified
    const updated: Record<string, unknown> = { emailVerified: new Date() }

    // Reset password if provided
    if (password && password.length >= 8) {
      updated.passwordHash = await bcrypt.hash(password, 10)
    }

    await db.user.update({ where: { id: user.id }, data: updated })

    return NextResponse.json({
      ok: true,
      email: normalizedEmail,
      emailVerified: true,
      passwordReset: !!password,
      tokensDeleted: deletedTokens.count,
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error("fix-user error:", msg)
    return NextResponse.json({ error: "Internal error", detail: msg }, { status: 500 })
  }
}
