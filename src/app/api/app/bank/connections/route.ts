import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { getPluggyItem } from "@/lib/pluggy"
import { syncBankTransactions } from "@/lib/bank-sync"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.organizationId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const connections = await db.bankConnection.findMany({
    where: {
      organizationId: session.user.organizationId,
      status: { not: "disconnected" },
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json({ connections })
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.organizationId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json().catch(() => ({}))
  const { itemId, bankName } = body as { itemId?: string; bankName?: string }

  if (!itemId) {
    return NextResponse.json({ error: "itemId is required" }, { status: 400 })
  }

  let resolvedName = bankName ?? "Banco"
  let connectorId = 0

  if (process.env.PLUGGY_CLIENT_ID && process.env.PLUGGY_CLIENT_SECRET) {
    try {
      const item = await getPluggyItem(itemId)
      resolvedName = item.connector.name
      connectorId = item.connector.id
    } catch {
      // proceed with provided values
    }
  }

  const connection = await db.bankConnection.upsert({
    where: { pluggyItemId: itemId },
    create: {
      organizationId: session.user.organizationId,
      pluggyItemId: itemId,
      bankName: resolvedName,
      connectorId,
      status: "connected",
      lastSyncAt: new Date(),
    },
    update: {
      status: "connected",
      bankName: resolvedName,
      lastSyncAt: new Date(),
    },
  })

  // Trigger initial transaction sync in background (don't block the response)
  syncBankTransactions(itemId, session.user.organizationId).catch(err => {
    console.error(`[bank/connections] initial sync failed for item ${itemId}:`, err)
  })

  return NextResponse.json({ connection }, { status: 201 })
}
