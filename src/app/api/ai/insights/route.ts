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

    const criticalAlerts = analysis.insights.filter(i => i.type === "leak" && i.impact === "high")
    const netResult = Number(analysis.netResult ?? 0)
    const isDeficit = netResult < 0

    const prompt = `Você é um CFO sênior com profundo conhecimento em finanças para PMEs brasileiras. Escreva um diagnóstico financeiro executivo personalizado.

DADOS DA EMPRESA:
- Empresa: ${analysis.organization?.name ?? "N/A"}${analysis.organization?.niche ? ` | Setor: ${analysis.organization.niche}` : ""}
- Período analisado: ${analysis.upload?.rowsCount ?? 0} transações
- Score de eficiência financeira: ${analysis.score}/100 ${(analysis.score ?? 0) < 60 ? "(situação crítica)" : (analysis.score ?? 0) < 80 ? "(atenção necessária)" : "(boa gestão)"}

SITUAÇÃO FINANCEIRA:
- Despesas totais: R$ ${Number(analysis.totalExpenses ?? 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
- Receitas totais: R$ ${Number(analysis.totalIncome ?? 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
- Resultado: R$ ${netResult.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} ${isDeficit ? "⚠️ DÉFICIT — despesas maiores que receitas" : "✓ superávit"}
- Economia potencial identificada: R$ ${Number(analysis.savingsMin ?? 0).toLocaleString("pt-BR")} a R$ ${Number(analysis.savingsMax ?? 0).toLocaleString("pt-BR")}

VAZAMENTOS DE ALTA PRIORIDADE (${criticalAlerts.length} críticos de ${leaks.length} total):
${leaks.slice(0, 4).map(l => `- ${l.title}: ${l.description}${l.amount ? ` — R$ ${Number(l.amount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : ""}`).join("\n") || "Nenhum identificado"}

OPORTUNIDADES (${opportunities.length} identificadas):
${opportunities.slice(0, 3).map(o => `- ${o.title}: ${o.description}`).join("\n") || "Nenhuma"}

AÇÕES PRIORITÁRIAS:
${analysis.recommendations.slice(0, 4).map((r, i) => `${i + 1}. [${r.urgency === "immediate" ? "URGENTE" : r.urgency === "soon" ? "BREVE" : "MONITORAR"}] ${r.title} — economia estimada: R$ ${Number(r.savingsEstimate ?? 0).toLocaleString("pt-BR")}`).join("\n") || "Nenhuma"}

INSTRUÇÕES:
Escreva um diagnóstico executivo em EXATAMENTE 3 parágrafos curtos:
1. Parágrafo 1 — Situação atual: resumo objetivo do estado financeiro com os números mais relevantes
2. Parágrafo 2 — Problemas críticos: os 2-3 principais vazamentos ou riscos identificados, citando valores específicos
3. Parágrafo 3 — Próximos passos: as 2-3 ações mais impactantes que o gestor deve tomar imediatamente

Regras: linguagem profissional e direta, sem rodeios, sem bullet points (apenas prosa), cite valores em R$ quando disponíveis, seja específico sobre fornecedores e categorias mencionados nos dados.`

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 600,
      messages: [{ role: "user", content: prompt }],
    })

    const text = response.content.find(b => b.type === "text")?.text ?? ""

    return NextResponse.json({ insight: text })
  } catch (error) {
    console.error("AI insights error:", error)
    return NextResponse.json({ error: "Erro ao gerar insight" }, { status: 500 })
  }
}
