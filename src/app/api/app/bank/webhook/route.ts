import { NextResponse } from "next/server"
import { z } from "zod"
import { db } from "@/lib/db"
import { syncBankTransactions } from "@/lib/bank-sync"

const webhookSchema = z.object({
  event: z.string().min(1).max(100),
  itemId: z.string().uuid(),
})

/**
 * POST /api/app/bank/webhook
 * Receives Pluggy webhook events.
 * Events: item/created, item/updated, item/error
 * Body: { event, eventId, itemId, ... }
 * MUST respond 2XX within 5 seconds.
 */
export async function POST(req: Request) {
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const parsed = webhookSchema.safeParse(body)
  if (!parsed.success) {
    // Responde 200 para evitar retries do Pluggy em payloads inválidos
    return NextResponse.json({ received: true })
  }

  const { event, itemId } = parsed.data

  if (event === "item/error") {
    await db.bankConnection
      .updateMany({ where: { pluggyItemId: itemId }, data: { status: "error" } })
      .catch(() => null)
    return NextResponse.json({ received: true })
  }

  if (event === "item/created" || event === "item/updated") {
    // Find the connection to get organizationId
    const conn = await db.bankConnection.findFirst({ where: { pluggyItemId: itemId } })
    if (!conn) {
      return NextResponse.json({ received: true })
    }

    // Respond 200 immediately, then sync in background
    // We trigger sync asynchronously — the response is already sent
    syncBankTransactions(itemId, conn.organizationId).catch(err => {
      console.error(`[bank/webhook] sync failed for item ${itemId}:`, err)
      db.bankConnection
        .updateMany({ where: { pluggyItemId: itemId }, data: { status: "error" } })
        .catch(() => null)
    })
  }

  return NextResponse.json({ received: true })
}
