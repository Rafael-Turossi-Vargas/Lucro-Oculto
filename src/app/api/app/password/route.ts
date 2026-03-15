import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"
import { can } from "@/lib/roles"
import { logAudit } from "@/lib/audit"

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    if (session.user.role !== "owner") {
      return NextResponse.json({ error: "Apenas o proprietário pode alterar a senha" }, { status: 403 })
    }

    const { currentPassword, newPassword } = await request.json() as {
      currentPassword: string
      newPassword: string
    }

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Campos obrigatórios" }, { status: 400 })
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ error: "Nova senha deve ter pelo menos 8 caracteres" }, { status: 400 })
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { passwordHash: true },
    })

    if (!user?.passwordHash) {
      return NextResponse.json({ error: "Conta sem senha definida" }, { status: 400 })
    }

    const valid = await bcrypt.compare(currentPassword, user.passwordHash)
    if (!valid) {
      return NextResponse.json({ error: "Senha atual incorreta" }, { status: 400 })
    }

    const hash = await bcrypt.hash(newPassword, 13)
    await db.user.update({ where: { id: session.user.id }, data: { passwordHash: hash } })

    void logAudit({ action: "password.changed", status: "success", userId: session.user.id, organizationId: session.user.organizationId })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
