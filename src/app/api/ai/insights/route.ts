import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import Anthropic from "@anthropic-ai/sdk"

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { analysisId } = await req.json()
    if (!analysisId) {
      return NextResponse.json({ error: "analysisId obrigatório" }, { status: 400 })
    }

    const analysis = await db.analysis.findFirst({
      where: { id: analysisId, organizationId: session.user.organizationId },
      include: {
        insights: { orderBy: { createdAt: "asc" } },
        recommendations: { orderBy: { priority: "asc" }, take: 5 },
        organization: { select: { name: true, niche: true } },
        upload: { select: { fileName: true, rowsCount: true } },
      },
    })

    if (!analysis) {
      return NextResponse.json({ error: "Análise não encontrada" }, { status: 404 })
    }

    const leaks = analysis.insights.filter(i => i.type === "leak")
    const opportunities = analysis.insights.filter(i => i.type === "opportunity")

    const prompt = `Você é um CFO virtual especialista em eficiência financeira para PMEs brasileiras.

Analise os dados financeiros abaixo e escreva um parágrafo diagnóstico personalizado e direto ao ponto (máximo 4 frases).
Use linguagem profissional mas acessível. Foque nos problemas mais críticos e na maior oportunidade de economia.
Não use bullet points — apenas prosa fluida.

DADOS DA ANÁLISE:
- Empresa: ${analysis.organization?.name ?? "N/A"} (setor: ${analysis.organization?.niche ?? "não informado"})
- Arquivo: ${analysis.upload?.fileName ?? "extrato"} (${analysis.upload?.rowsCount ?? 0} transações)
- Score de eficiência: ${analysis.score}/100
- Total despesas: R$ ${Number(analysis.totalExpenses ?? 0).toLocaleString("pt-BR")}
- Total receitas: R$ ${Number(analysis.totalIncome ?? 0).toLocaleString("pt-BR")}
- Resultado líquido: R$ ${Number(analysis.netResult ?? 0).toLocaleString("pt-BR")}
- Economia potencial: R$ ${Number(analysis.savingsMin ?? 0).toLocaleString("pt-BR")} a R$ ${Number(analysis.savingsMax ?? 0).toLocaleString("pt-BR")}/mês

PRINCIPAIS VAZAMENTOS (${leaks.length} identificados):
${leaks.slice(0, 3).map(l => `- ${l.title}: ${l.description}${l.amount ? ` (R$ ${Number(l.amount).toLocaleString("pt-BR")}/mês)` : ""}`).join("\n") || "Nenhum"}

OPORTUNIDADES (${opportunities.length} identificadas):
${opportunities.slice(0, 2).map(o => `- ${o.title}: ${o.description}`).join("\n") || "Nenhuma"}

TOP RECOMENDAÇÕES:
${analysis.recommendations.slice(0, 3).map((r, i) => `${i + 1}. ${r.title}`).join("\n") || "Nenhuma"}

Escreva o parágrafo diagnóstico agora:`

    const response = await client.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 400,
      messages: [{ role: "user", content: prompt }],
    })

    const text = response.content.find(b => b.type === "text")?.text ?? ""

    return NextResponse.json({ insight: text })
  } catch (error) {
    console.error("AI insights error:", error)
    return NextResponse.json({ error: "Erro ao gerar insight" }, { status: 500 })
  }
}
