import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { z } from "zod"

// POST /api/app/switch-org — Switch active organization in session
export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.organizationId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const userId = session.user.id

  const body = await req.json().catch(() => ({}))
  const parsed = z.object({ organizationId: z.string() }).safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "organizationId inválido" }, { status: 400 })

  const { organizationId } = parsed.data

  // Verify user is a member of this org
  const membership = await db.membership.findFirst({
    where: { userId, organizationId },
  })
  if (!membership) return NextResponse.json({ error: "Sem acesso a esta organização" }, { status: 403 })

  // Persist preference
  await db.user.update({
    where: { id: userId },
    data: { preferredOrganizationId: organizationId },
  })

  return NextResponse.json({ success: true, organizationId })
}
