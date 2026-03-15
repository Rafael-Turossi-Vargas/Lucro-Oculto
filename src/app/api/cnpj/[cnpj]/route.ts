import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { rateLimit } from "@/lib/rate-limit"

type BrasilApiCnpj = {
  cnpj: string
  razao_social?: string
  nome_fantasia?: string
  situacao_cadastral?: number | string
  descricao_situacao_cadastral?: string
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ cnpj: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  // Rate limit: 20 lookups per user per hour
  const rl = await rateLimit(`cnpj:${session.user.id}`, 20, 60 * 60 * 1000)
  if (!rl.success) {
    return NextResponse.json({ error: "Muitas consultas. Tente novamente mais tarde." }, { status: 429 })
  }

  const { cnpj } = await params
  const digits = cnpj.replace(/\D/g, "")

  if (digits.length !== 14) {
    return NextResponse.json({ error: "CNPJ inválido" }, { status: 400 })
  }

  try {
    const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${digits}`, {
      signal: AbortSignal.timeout(10000),
      headers: { "User-Agent": "LucroOculto/1.0" },
    })

    if (!res.ok) {
      return NextResponse.json(
        { error: "CNPJ não encontrado na Receita Federal" },
        { status: 404 }
      )
    }

    const data = (await res.json()) as BrasilApiCnpj

    // situacao_cadastral = 2 significa ATIVA na Receita Federal
    const descricao = (data.descricao_situacao_cadastral ?? "").toUpperCase()
    const isAtiva = descricao === "ATIVA" || data.situacao_cadastral === 2 || data.situacao_cadastral === "2"

    return NextResponse.json({
      cnpj: data.cnpj,
      razao_social: data.razao_social ?? "",
      nome_fantasia: data.nome_fantasia ?? "",
      ativa: isAtiva,
      descricao_situacao_cadastral: descricao,
    })
  } catch (err) {
    const isTimeout = err instanceof Error && err.name === "TimeoutError"
    return NextResponse.json(
      { error: isTimeout ? "Serviço indisponível, tente novamente" : "Erro ao consultar CNPJ" },
      { status: 503 }
    )
  }
}
