import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  const score = (body as { score?: number }).score
  // In production, save to DB or send to analytics
  console.log("[NPS]", score)
  return NextResponse.json({ ok: true })
}
