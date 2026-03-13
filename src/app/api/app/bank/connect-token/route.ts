import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { createConnectToken } from "@/lib/pluggy"
import { rateLimit } from "@/lib/rate-limit"

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown"
  if (!rateLimit(`bank-connect:${ip}`, 20, 3600)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 })
  }

  const session = await getServerSession(authOptions)
  if (!session?.user?.organizationId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!process.env.PLUGGY_CLIENT_ID || !process.env.PLUGGY_CLIENT_SECRET) {
    return NextResponse.json(
      { error: "Integração bancária não configurada. Adicione PLUGGY_CLIENT_ID e PLUGGY_CLIENT_SECRET no .env." },
      { status: 503 }
    )
  }

  try {
    // Use organizationId as clientUserId to track which org connected
    const accessToken = await createConnectToken(session.user.organizationId)
    return NextResponse.json({ connectToken: accessToken })
  } catch (err) {
    console.error("[bank/connect-token]", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao criar token de conexão" },
      { status: 500 }
    )
  }
}
