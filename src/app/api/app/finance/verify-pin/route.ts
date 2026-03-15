import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { can } from "@/lib/roles"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { logAudit } from "@/lib/audit"

const MAX_ATTEMPTS = 5
const LOCKOUT_MINUTES = 15

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.organizationId) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const { role, organizationId } = session.user

  // Only contador needs PIN — owners bypass
  if (!can(role, "finance:view")) {
    return NextResponse.json({ error: "Sem permissão para acessar dados financeiros" }, { status: 403 })
  }
  if (role === "owner" || role === "admin") {
    return NextResponse.json({ success: true }) // owners don't need PIN
  }

  const body = await req.json().catch(() => ({}))
  const parsed = z.object({ pin: z.string().min(4).max(8) }).safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "PIN inválido" }, { status: 400 })
  }

  const { pin } = parsed.data

  const org = await db.organization.findUnique({
    where: { id: organizationId },
    select: { financePinHash: true, financePinAttempts: true, financePinLockedUntil: true },
  })

  if (!org?.financePinHash) {
    return NextResponse.json(
      { error: "PIN de acesso financeiro não configurado. Solicite ao proprietário." },
      { status: 403 }
    )
  }

  // Check lockout
  if (org.financePinLockedUntil && org.financePinLockedUntil > new Date()) {
    const minsLeft = Math.ceil((org.financePinLockedUntil.getTime() - Date.now()) / 60000)
    return NextResponse.json(
      { error: `Muitas tentativas incorretas. Aguarde ${minsLeft} minuto(s).` },
      { status: 429 }
    )
  }

  const isValid = await bcrypt.compare(pin, org.financePinHash)

  if (!isValid) {
    const newAttempts = (org.financePinAttempts ?? 0) + 1
    const shouldLock = newAttempts >= MAX_ATTEMPTS
    await db.organization.update({
      where: { id: organizationId },
      data: {
        financePinAttempts: newAttempts,
        financePinLockedUntil: shouldLock
          ? new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000)
          : null,
      },
    })
    void logAudit({ action: "pin.verify_failure", status: "failure", userId: session.user.id, organizationId, metadata: { attempts: newAttempts, locked: shouldLock } })
    const remaining = MAX_ATTEMPTS - newAttempts
    return NextResponse.json(
      {
        error: shouldLock
          ? `PIN bloqueado por ${LOCKOUT_MINUTES} minutos após ${MAX_ATTEMPTS} tentativas incorretas.`
          : `PIN incorreto. ${remaining > 0 ? `${remaining} tentativa(s) restante(s).` : ""}`,
      },
      { status: 401 }
    )
  }

  // Reset attempts on success
  await db.organization.update({
    where: { id: organizationId },
    data: { financePinAttempts: 0, financePinLockedUntil: null },
  })

  void logAudit({ action: "pin.verify_success", status: "success", userId: session.user.id, organizationId })

  return NextResponse.json({ success: true })
}
