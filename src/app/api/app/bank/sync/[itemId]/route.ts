import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { syncBankTransactions } from "@/lib/bank-sync"
import { rateLimit, getClientIp } from "@/lib/rate-limit"

/** POST /api/app/bank/sync/[itemId] — manually trigger a re-sync */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ itemId: string }> }
) {
  const ip = getClientIp(req)
  const rl = await rateLimit(`bank-sync-manual:${ip}`, 5, 60 * 60 * 1000)
  if (!rl.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 })
  }

  const session = await getServerSession(authOptions)
  if (!session?.user?.organizationId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { itemId } = await params

  const connection = await db.bankConnection.findFirst({
    where: { pluggyItemId: itemId, organizationId: session.user.organizationId },
  })

  if (!connection) {
    return NextResponse.json({ error: "Connection not found" }, { status: 404 })
  }

  try {
    const result = await syncBankTransactions(itemId, session.user.organizationId)
    return NextResponse.json({ ok: true, ...result })
  } catch (err) {
    console.error(`[bank/sync] failed for item ${itemId}:`, err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Sync failed" },
      { status: 500 }
    )
  }
}
