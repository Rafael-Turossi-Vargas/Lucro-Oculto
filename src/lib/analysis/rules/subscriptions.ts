import { getSaasCategory } from "../categorizer"
import type { RawTransaction } from "@/types/transactions"

export interface Subscription {
  id: string
  description: string
  vendor: string
  monthlyAmount: number
  categorySlug: string
  saasCategory: string | null
  occurrences: number
  transactions: string[]
}

export interface SubscriptionGroup {
  category: string
  subscriptions: Subscription[]
  totalMonthly: number
}

export interface SubscriptionsResult {
  subscriptions: Subscription[]
  totalMonthly: number
  possiblyUnused: Subscription[]
  overlapping: SubscriptionGroup[]
}

const SUBSCRIPTION_KEYWORDS = [
  "slack", "notion", "figma", "trello", "asana", "monday", "clickup",
  "zoom", "google workspace", "microsoft 365", "adobe", "canva", "dropbox",
  "hubspot", "pipedrive", "github", "vercel", "aws", "azure", "digitalocean",
  "hotmart", "hotjar", "intercom", "typeform", "airtable", "zapier", "make",
  "activecampaign", "mailchimp", "rdstation", "semrush", "ahrefs", "moz",
  "assinatura", "mensalidade", "plano ", "subscription", "monthly", "anual",
]

function isSubscription(description: string): boolean {
  const lower = description.toLowerCase()
  return SUBSCRIPTION_KEYWORDS.some((kw) => lower.includes(kw))
}

export function detectSubscriptions(
  transactions: Array<RawTransaction & { id?: string }>
): SubscriptionsResult {
  const expenses = transactions.filter((t) => (t.amount as number) < 0)

  // Group by similar description
  const groups = new Map<string, typeof expenses>()
  for (const t of expenses) {
    const desc = t.description.toLowerCase().replace(/\s+\d{2}\/\d{2}|\d{4}/g, "").trim()
    if (!groups.has(desc)) groups.set(desc, [])
    groups.get(desc)!.push(t)
  }

  const subscriptions: Subscription[] = []

  for (const [key, group] of groups) {
    if (!isSubscription(key) && group.length < 2) continue

    const amounts = group.map((t) => Math.abs(t.amount as number))
    const avg = amounts.reduce((a, b) => a + b, 0) / amounts.length
    const allSimilar = amounts.every((a) => Math.abs(a - avg) / avg < 0.15)

    if (!allSimilar && group.length < 2) continue
    if (avg < 10) continue // ignore tiny amounts

    const saasCategory = getSaasCategory(key)
    subscriptions.push({
      id: `sub_${subscriptions.length}`,
      description: group[0].description,
      vendor: group[0].description.substring(0, 40),
      monthlyAmount: avg,
      categorySlug: "ferramentas_software",
      saasCategory,
      occurrences: group.length,
      transactions: group.map((t, i) => t.id ?? `t_${i}`),
    })
  }

  // Detect overlapping (same saas category)
  const bySaasCategory = new Map<string, Subscription[]>()
  for (const sub of subscriptions) {
    if (!sub.saasCategory) continue
    if (!bySaasCategory.has(sub.saasCategory)) bySaasCategory.set(sub.saasCategory, [])
    bySaasCategory.get(sub.saasCategory)!.push(sub)
  }

  const overlapping: SubscriptionGroup[] = []
  for (const [category, subs] of bySaasCategory) {
    if (subs.length >= 2) {
      overlapping.push({
        category,
        subscriptions: subs,
        totalMonthly: subs.reduce((s, sub) => s + sub.monthlyAmount, 0),
      })
    }
  }

  const totalMonthly = subscriptions.reduce((s, sub) => s + sub.monthlyAmount, 0)
  const possiblyUnused = subscriptions.filter((sub) => sub.occurrences === 1)

  return { subscriptions, totalMonthly, possiblyUnused, overlapping }
}
