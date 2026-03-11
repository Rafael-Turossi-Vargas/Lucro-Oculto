import type { RawTransaction } from "@/types/transactions"

export interface DuplicateGroup {
  transactions: string[]
  amount: number
  description: string
  dates: string[]
  totalDuplicated: number
}

export interface DuplicatesResult {
  duplicateGroups: DuplicateGroup[]
  totalDuplicated: number
}

function similar(a: string, b: string): boolean {
  const na = a.toLowerCase().replace(/\s+/g, "").substring(0, 20)
  const nb = b.toLowerCase().replace(/\s+/g, "").substring(0, 20)
  if (na === nb) return true
  // Simple prefix match
  const minLen = Math.min(na.length, nb.length)
  const match = [...na].filter((c, i) => c === nb[i]).length
  return minLen > 5 && match / minLen > 0.8
}

export function detectDuplicates(
  transactions: Array<RawTransaction & { id?: string }>
): DuplicatesResult {
  const expenses = transactions
    .filter((t) => (t.amount as number) < 0)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const WINDOW_DAYS = 7
  const groups: DuplicateGroup[] = []
  const used = new Set<number>()

  for (let i = 0; i < expenses.length; i++) {
    if (used.has(i)) continue
    const t = expenses[i]
    const tDate = new Date(t.date).getTime()
    const tAmt = Math.abs(t.amount as number)

    const group: number[] = [i]

    for (let j = i + 1; j < expenses.length; j++) {
      if (used.has(j)) continue
      const u = expenses[j]
      const uDate = new Date(u.date).getTime()
      const diffDays = Math.abs(uDate - tDate) / (1000 * 60 * 60 * 24)

      if (diffDays > WINDOW_DAYS) break
      const uAmt = Math.abs(u.amount as number)
      if (Math.abs(uAmt - tAmt) / (tAmt || 1) > 0.02) continue
      if (!similar(t.description, u.description)) continue

      group.push(j)
    }

    if (group.length >= 2) {
      group.forEach((idx) => used.add(idx))
      const groupTxs = group.map((idx) => expenses[idx])
      groups.push({
        transactions: groupTxs.map((tx, idx) => tx.id ?? `t_${idx}`),
        amount: tAmt,
        description: t.description,
        dates: groupTxs.map((tx) => tx.date),
        totalDuplicated: tAmt * (group.length - 1), // first is legit, rest are duplicates
      })
    }
  }

  const totalDuplicated = groups.reduce((s, g) => s + g.totalDuplicated, 0)
  return { duplicateGroups: groups, totalDuplicated }
}
