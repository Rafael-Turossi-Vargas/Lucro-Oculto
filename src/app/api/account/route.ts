import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"

// DELETE /api/account — exclui conta e todos os dados (LGPD) — somente proprietário
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || !session?.user?.organizationId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Apenas proprietário pode excluir a conta
    if (session.user.role !== "owner" && session.user.role !== "admin") {
      return NextResponse.json({ error: "Apenas o proprietário pode excluir a conta" }, { status: 403 })
    }

    // Requer confirmação de senha
    const body = await req.json().catch(() => ({})) as { password?: string }
    if (!body.password) {
      return NextResponse.json({ error: "Senha obrigatória para confirmar exclusão" }, { status: 400 })
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { passwordHash: true },
    })

    if (!user?.passwordHash) {
      return NextResponse.json({ error: "Conta sem senha definida — use o suporte" }, { status: 400 })
    }

    const passwordValid = await bcrypt.compare(body.password, user.passwordHash)
    if (!passwordValid) {
      return NextResponse.json({ error: "Senha incorreta" }, { status: 401 })
    }

    const userId = session.user.id
    const organizationId = session.user.organizationId

    // Verifica se é o único membro da organização
    const memberCount = await db.membership.count({ where: { organizationId } })

    // Exclui tudo em transação
    await db.$transaction(async (tx) => {
      // Se for o único membro, exclui a organização inteira (cascade apaga análises, uploads, etc.)
      if (memberCount === 1) {
        await tx.organization.delete({ where: { id: organizationId } })
      } else {
        // Apenas remove o membro da organização
        await tx.membership.deleteMany({ where: { userId, organizationId } })
      }

      // Exclui o usuário (cascade apaga contas, sessões, tokens)
      await tx.user.delete({ where: { id: userId } })
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Account deletion error:", error)
    return NextResponse.json({ error: "Erro ao excluir conta" }, { status: 500 })
  }
}
