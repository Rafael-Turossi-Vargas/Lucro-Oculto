import { NextResponse } from "next/server"
import { db as prisma } from "@/lib/db"

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Fetch orgs with recent analyses
    const orgs = await prisma.organization.findMany({
      where: { plan: { in: ["pro", "premium"] } },
      include: {
        memberships: { include: { user: true }, where: { role: "owner" } },
        analyses: {
          where: { status: "completed" },
          orderBy: { createdAt: "desc" },
          take: 1,
          include: { alerts: { where: { isDismissed: false } } },
        },
      },
    })

    let sent = 0
    for (const org of orgs) {
      const owner = org.memberships[0]?.user
      const latestAnalysis = org.analyses[0]
      if (!owner?.email || !latestAnalysis) continue

      // TODO: Send email via Resend
      // await resend.emails.send({
      //   from: "Lucro Oculto <noreply@lucrooculto.com.br>",
      //   to: owner.email,
      //   subject: `Resumo semanal — ${org.name}`,
      //   html: buildWeeklySummaryHtml({ org, analysis: latestAnalysis, user: owner }),
      // })

      sent++
    }

    return NextResponse.json({ ok: true, sent })
  } catch (error) {
    console.error("[weekly-summary]", error)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
