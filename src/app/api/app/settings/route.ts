import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { can } from "@/lib/roles"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || !session?.user?.organizationId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const [user, org] = await Promise.all([
      db.user.findUnique({ where: { id: session.user.id }, select: { name: true, email: true } }),
      db.organization.findUnique({ where: { id: session.user.organizationId }, select: { name: true, niche: true, plan: true } }),
    ])

    return NextResponse.json({ user, org })
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || !session?.user?.organizationId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    if (!can(session.user.role, "settings:profile")) {
      return NextResponse.json({ error: "Sem permissão para alterar configurações" }, { status: 403 })
    }

    const { name, companyName, niche } = await request.json() as {
      name?: string
      companyName?: string
      niche?: string
    }

    // Apenas proprietário pode alterar dados da empresa
    const isOwner = session.user.role === "owner"
    if ((companyName !== undefined || niche !== undefined) && !isOwner) {
      return NextResponse.json({ error: "Apenas o proprietário pode alterar dados da empresa" }, { status: 403 })
    }

    await Promise.all([
      name !== undefined
        ? db.user.update({ where: { id: session.user.id }, data: { name: name.trim() || null } })
        : Promise.resolve(),
      (companyName !== undefined || niche !== undefined)
        ? db.organization.update({
            where: { id: session.user.organizationId },
            data: {
              ...(companyName !== undefined ? { name: companyName.trim() || "Minha Empresa" } : {}),
              ...(niche !== undefined ? { niche: niche.trim() || null } : {}),
            },
          })
        : Promise.resolve(),
    ])

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "Erro ao salvar" }, { status: 500 })
  }
}
