import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { can } from "@/lib/roles"

function toCSV(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return ""
  const headers = Object.keys(rows[0]!)
  const escape = (v: unknown) => {
    const s = v === null || v === undefined ? "" : String(v)
    return s.includes(",") || s.includes('"') || s.includes("\n")
      ? `"${s.replace(/"/g, '""')}"`
      : s
  }
  const lines = [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => escape(r[h])).join(",")),
  ]
  return lines.join("\n")
}

// GET /api/app/export?type=leaks|opportunities|alerts|recommendations
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    if (!can(session.user.role, "reports:generate")) {
      return NextResponse.json({ error: "Sem permissão para exportar dados" }, { status: 403 })
    }

    const organizationId = session.user.organizationId
    const type = request.nextUrl.searchParams.get("type") ?? "leaks"

    // Pega a última análise concluída
    const analysis = await db.analysis.findFirst({
      where: { organizationId, status: "done" },
      orderBy: { createdAt: "desc" },
      select: { id: true },
    })

    if (!analysis) {
      return NextResponse.json({ error: "Nenhuma análise encontrada" }, { status: 404 })
    }

    let csv = ""
    let filename = "export"

    if (type === "leaks" || type === "opportunities") {
      const insightType = type === "leaks" ? "leak" : "opportunity"
      const rows = await db.insight.findMany({
        where: { analysisId: analysis.id, type: insightType },
        orderBy: [{ impact: "asc" }, { amount: "desc" }],
        select: { title: true, description: true, impact: true, urgency: true, amount: true, category: true },
      })

      csv = toCSV(
        rows.map((r) => ({
          titulo: r.title,
          descricao: r.description,
          impacto: r.impact === "high" ? "Alto" : r.impact === "medium" ? "Médio" : "Baixo",
          urgencia: r.urgency ?? "",
          valor_mensal: r.amount ? Number(r.amount).toFixed(2) : "",
          categoria: r.category ?? "",
        }))
      )
      filename = type === "leaks" ? "vazamentos" : "oportunidades"
    }

    if (type === "alerts") {
      const rows = await db.alert.findMany({
        where: { analysisId: analysis.id, isDismissed: false },
        orderBy: { severity: "asc" },
        select: { type: true, severity: true, title: true, message: true, amount: true },
      })

      csv = toCSV(
        rows.map((r) => ({
          tipo: r.type,
          severidade: r.severity === "critical" ? "Crítico" : r.severity === "warning" ? "Atenção" : "Info",
          titulo: r.title,
          mensagem: r.message,
          valor: r.amount ? Number(r.amount).toFixed(2) : "",
        }))
      )
      filename = "alertas"
    }

    if (type === "recommendations") {
      const rows = await db.recommendation.findMany({
        where: { analysisId: analysis.id },
        orderBy: { priority: "asc" },
        select: { title: true, description: true, urgency: true, difficulty: true, savingsEstimate: true, status: true },
      })

      csv = toCSV(
        rows.map((r) => ({
          titulo: r.title,
          descricao: r.description,
          urgencia: r.urgency ?? "",
          dificuldade: r.difficulty ?? "",
          economia_estimada: r.savingsEstimate ? Number(r.savingsEstimate).toFixed(2) : "",
          status: r.status,
        }))
      )
      filename = "plano-de-acao"
    }

    if (!csv) {
      return NextResponse.json({ error: "Tipo inválido" }, { status: 400 })
    }

    return new NextResponse("\uFEFF" + csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    })
  } catch (error) {
    console.error("Export error:", error)
    return NextResponse.json({ error: "Erro ao exportar" }, { status: 500 })
  }
}
