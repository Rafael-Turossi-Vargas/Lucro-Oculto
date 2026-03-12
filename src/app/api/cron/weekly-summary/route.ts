import { NextResponse } from "next/server"
import { db as prisma } from "@/lib/db"
import { sendWeeklySummaryEmail } from "@/lib/email/templates"

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Idempotency: only send to orgs that haven't received a summary in the last 6 days
    const sixDaysAgo = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)

    const orgs = await prisma.organization.findMany({
      where: {
        plan: { in: ["pro", "premium"] },
        deletedAt: null,
        OR: [
          { lastWeeklySummaryAt: null },
          { lastWeeklySummaryAt: { lt: sixDaysAgo } },
        ],
      },
      include: {
        memberships: { include: { user: true }, where: { role: "owner" } },
        analyses: {
          where: { status: "done" },
          orderBy: { createdAt: "desc" },
          take: 1,
          include: { alerts: { where: { isDismissed: false } } },
        },
      },
    })

    let sent = 0
    let failed = 0
    let skipped = 0

    for (const org of orgs) {
      const owner = org.memberships[0]?.user
      const latestAnalysis = org.analyses[0]
      if (!owner?.email || !latestAnalysis) { skipped++; continue }

      try {
        await sendWeeklySummaryEmail(
          owner.email,
          owner.name ?? "usuário",
          org.name,
          {
            score: latestAnalysis.score,
            totalExpenses: latestAnalysis.totalExpenses ? Number(latestAnalysis.totalExpenses) : null,
            totalIncome: latestAnalysis.totalIncome ? Number(latestAnalysis.totalIncome) : null,
            netResult: latestAnalysis.netResult ? Number(latestAnalysis.netResult) : null,
            savingsMin: latestAnalysis.savingsMin ? Number(latestAnalysis.savingsMin) : null,
            savingsMax: latestAnalysis.savingsMax ? Number(latestAnalysis.savingsMax) : null,
            createdAt: latestAnalysis.createdAt,
            alerts: latestAnalysis.alerts.map((a) => ({
              severity: a.severity,
              title: a.title,
              message: a.message,
            })),
          }
        )
        // Stamp org so duplicates are blocked until next week
        await prisma.organization.update({
          where: { id: org.id },
          data: { lastWeeklySummaryAt: new Date() },
        })
        sent++
      } catch (emailErr) {
        console.error(`[weekly-summary] Failed to send to ${owner.email}:`, emailErr)
        failed++
      }
    }

    return NextResponse.json({ ok: true, sent, failed, skipped })
  } catch (error) {
    console.error("[weekly-summary]", error)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
