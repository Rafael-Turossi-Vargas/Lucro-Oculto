import { NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { rateLimit } from "@/lib/rate-limit"

export const dynamic = "force-dynamic"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.organizationId) {
    return new Response("Unauthorized", { status: 401 })
  }

  // Rate limit: 30 SSE connections per organization per hour
  const rl = rateLimit(`stream:${session.user.organizationId}`, 30, 60 * 60 * 1000)
  if (!rl.success) {
    return new Response("Too Many Requests", { status: 429 })
  }

  const { id } = await params
  const organizationId = session.user.organizationId
  const encoder = new TextEncoder()
  let closed = false

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: Record<string, unknown>) => {
        if (closed) return
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
        } catch {
          closed = true
        }
      }

      send({ type: "connected" })

      for (let i = 0; i < 60; i++) {
        if (closed) break

        const analysis = await db.analysis.findUnique({
          where: { id, organizationId },
          select: { id: true, status: true, score: true, savingsMin: true, savingsMax: true },
        })

        if (!analysis) {
          send({ type: "error", message: "Análise não encontrada" })
          break
        }

        // ── Item 16: Include top leaks when done ──────────────────────────
        let topLeaks: { title: string; amount: string | null }[] = []
        if (analysis.status === "done") {
          const leakRecords = await db.insight.findMany({
            where: { analysisId: id, type: "leak" },
            orderBy: { amount: "desc" },
            take: 2,
            select: { title: true, amount: true },
          })
          topLeaks = leakRecords.map((l: { title: string; amount: { toString(): string } | null }) => ({ title: l.title, amount: l.amount != null ? l.amount.toString() : null }))
        }

        send({
          type: "status",
          status: analysis.status,
          score: analysis.score,
          savingsMin: analysis.savingsMin,
          savingsMax: analysis.savingsMax,
          topLeaks,
        })

        if (analysis.status === "done" || analysis.status === "error") break

        await new Promise((r) => setTimeout(r, 2000))
      }

      try {
        controller.close()
      } catch {}
    },
    cancel() {
      closed = true
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  })
}
