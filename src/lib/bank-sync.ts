import { createPluggyClient } from "@/lib/pluggy"
import { db } from "@/lib/db"

/**
 * Syncs bank transactions for a connected Pluggy item.
 * Creates a synthetic Upload record and imports all transactions from the last 90 days.
 * Skips duplicates using pluggyTransactionId.
 */
export async function syncBankTransactions(
  itemId: string,
  organizationId: string
): Promise<{ uploadId: string; imported: number; skipped: number }> {
  const pluggy = createPluggyClient()

  // Lookup org owner to satisfy Upload.userId FK
  const membership = await db.membership.findFirst({
    where: { organizationId, role: "owner" },
  })
  const userId = membership?.userId
  if (!userId) throw new Error("No owner found for organization")

  // Mark connection as syncing
  await db.bankConnection.updateMany({
    where: { pluggyItemId: itemId, organizationId },
    data: { status: "updating" },
  })

  // Fetch accounts for this item
  const accountsPage = await pluggy.fetchAccounts(itemId)
  const accounts = accountsPage.results ?? []

  if (accounts.length === 0) {
    await db.bankConnection.updateMany({
      where: { pluggyItemId: itemId },
      data: { status: "connected", lastSyncAt: new Date() },
    })
    return { uploadId: "", imported: 0, skipped: 0 }
  }

  // Create synthetic Upload record for this sync batch
  const bankConn = await db.bankConnection.findFirst({ where: { pluggyItemId: itemId } })
  const upload = await db.upload.create({
    data: {
      organizationId,
      userId,
      fileName: `bank_sync_${bankConn?.bankName ?? itemId}_${new Date().toISOString().slice(0, 10)}`,
      fileUrl: `bank://pluggy/${itemId}`,
      fileType: "bank_sync",
      status: "processing",
    },
  })

  // Date range: last 90 days
  const from = new Date()
  from.setDate(from.getDate() - 90)
  const fromStr = from.toISOString().slice(0, 10)

  // Collect all transactions across all accounts
  let imported = 0
  let skipped = 0

  for (const account of accounts) {
    let pluggyTxs
    try {
      pluggyTxs = await pluggy.fetchAllTransactions(account.id, { from: fromStr })
    } catch {
      continue // skip account on error, continue others
    }

    if (!pluggyTxs || pluggyTxs.length === 0) continue

    // Fetch existing pluggy IDs for this org to deduplicate
    const existingIds = new Set(
      (
        await db.transaction.findMany({
          where: {
            organizationId,
            pluggyTransactionId: { in: pluggyTxs.map(t => t.id) },
          },
          select: { pluggyTransactionId: true },
        })
      ).map(t => t.pluggyTransactionId)
    )

    const toInsert = pluggyTxs
      .filter(t => !existingIds.has(t.id))
      .map(t => ({
        organizationId,
        uploadId: upload.id,
        date: new Date(t.date),
        description: t.description,
        // DEBIT = negative (money out), CREDIT = positive (money in)
        amount: t.type === "DEBIT" ? -Math.abs(t.amount) : Math.abs(t.amount),
        vendor: t.merchant?.name ?? null,
        categorySlug: t.category ?? null,
        isRecurring: false,
        tags: [] as string[],
        source: "bank",
        pluggyTransactionId: t.id,
        rawData: {
          pluggyId: t.id,
          accountId: t.accountId,
          type: t.type,
          balance: t.balance,
          currencyCode: t.currencyCode,
          operationType: t.operationType,
          merchantCnpj: t.merchant?.cnpj ?? null,
        },
      }))

    skipped += pluggyTxs.length - toInsert.length

    if (toInsert.length > 0) {
      await db.transaction.createMany({ data: toInsert })
      imported += toInsert.length
    }
  }

  // Update upload record with final count
  await db.upload.update({
    where: { id: upload.id },
    data: {
      status: "done",
      rowsCount: imported,
      periodStart: from,
      periodEnd: new Date(),
    },
  })

  // Mark connection as connected + update lastSyncAt
  await db.bankConnection.updateMany({
    where: { pluggyItemId: itemId },
    data: { status: "connected", lastSyncAt: new Date() },
  })

  return { uploadId: upload.id, imported, skipped }
}
