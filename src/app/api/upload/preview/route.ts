import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { parseCSV } from "@/lib/parsers/csv"
import { parseXLSX } from "@/lib/parsers/xlsx"

// Endpoint de diagnóstico: retorna as colunas detectadas e as primeiras linhas
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const formData = await request.formData()
  const file = formData.get("file")
  if (!(file instanceof File)) return NextResponse.json({ error: "Sem arquivo" }, { status: 400 })

  const extension = file.name.split(".").pop()?.toLowerCase() ?? ""
  const buffer = Buffer.from(await file.arrayBuffer())

  let parsed
  if (extension === "csv") {
    parsed = await parseCSV(buffer.toString("utf-8"))
  } else {
    parsed = await parseXLSX(buffer)
  }

  return NextResponse.json({
    fileName: file.name,
    headers: parsed.headers,
    rowsCount: parsed.rowsCount,
    errors: parsed.errors,
    sampleRows: parsed.transactions.slice(0, 3),
  })
}
