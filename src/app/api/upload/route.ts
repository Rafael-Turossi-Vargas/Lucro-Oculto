import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { parseCSV } from "@/lib/parsers/csv"
import { parseXLSX } from "@/lib/parsers/xlsx"
import { runAnalysis } from "@/lib/analysis/engine"
import { rateLimit } from "@/lib/rate-limit"
import { can } from "@/lib/roles"

const MAX_FILE_SIZE = 10 * 1024 * 1024

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || !session?.user?.organizationId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    if (!can(session.user.role, "upload:create")) {
      return NextResponse.json({ error: "Sem permissão para fazer upload" }, { status: 403 })
    }

    // Rate limit: 10 uploads por hora por organização
    const rl = rateLimit(`upload:${session.user.organizationId}`, 10, 60 * 60 * 1000)
    if (!rl.success) {
      return NextResponse.json(
        { error: "Muitos uploads. Tente novamente mais tarde." },
        { status: 429 }
      )
    }

    const organizationId = session.user.organizationId
    const userId = session.user.id

    const organization = await db.organization.findUnique({
      where: { id: organizationId },
    })

    if (!organization) {
      return NextResponse.json(
        { error: "Organização não encontrada" },
        { status: 404 }
      )
    }

    const formData = await request.formData()
    const file = formData.get("file")

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Nenhum arquivo enviado" },
        { status: 400 }
      )
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Arquivo muito grande. Máximo 10MB" },
        { status: 413 }
      )
    }

    const extension = file.name.split(".").pop()?.toLowerCase() ?? ""

    if (!["csv", "xlsx", "xls"].includes(extension)) {
      return NextResponse.json(
        { error: "Formato inválido. Use .csv ou .xlsx" },
        { status: 415 }
      )
    }

    // Validate MIME type alongside extension (defense in depth)
    const allowedMimes = [
      "text/csv",
      "text/plain",
      "application/csv",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/octet-stream", // some browsers send this for xlsx
    ]
    if (file.type && !allowedMimes.includes(file.type)) {
      return NextResponse.json(
        { error: "Tipo de arquivo inválido. Use .csv ou .xlsx" },
        { status: 415 }
      )
    }

    // For free plan: verify monthly limit atomically inside a transaction to prevent race conditions
    let upload: Awaited<ReturnType<typeof db.upload.create>>
    let analysis: Awaited<ReturnType<typeof db.analysis.create>>

    try {
      const result = await db.$transaction(async (tx) => {
        if (organization.plan === "free") {
          const thisMonth = new Date()
          thisMonth.setDate(1)
          thisMonth.setHours(0, 0, 0, 0)

          const uploadCount = await tx.upload.count({
            where: { organizationId, createdAt: { gte: thisMonth } },
          })

          if (uploadCount >= 1) {
            throw new Error("PLAN_LIMIT")
          }
        }

        const newUpload = await tx.upload.create({
          data: {
            organizationId,
            userId,
            fileName: file.name,
            fileUrl: `local://${file.name}`,
            fileSize: file.size,
            fileType: extension,
            status: "processing",
          },
        })

        const newAnalysis = await tx.analysis.create({
          data: {
            organizationId,
            uploadId: newUpload.id,
            status: "pending",
          },
        })

        return { upload: newUpload, analysis: newAnalysis }
      })

      upload = result.upload
      analysis = result.analysis
    } catch (txErr) {
      if (txErr instanceof Error && txErr.message === "PLAN_LIMIT") {
        return NextResponse.json(
          { error: "Limite do plano gratuito atingido. Faça upgrade para o plano Pro para análises ilimitadas." },
          { status: 429 }
        )
      }
      throw txErr
    }

    let parsed

    try {
      const buffer = Buffer.from(await file.arrayBuffer())

      if (extension === "csv") {
        parsed = await parseCSV(buffer.toString("utf-8"))
      } else {
        parsed = await parseXLSX(buffer)
      }
    } catch (error) {
      console.error("Parse error:", error)

      await db.upload.update({
        where: { id: upload.id },
        data: {
          status: "error",
          errorMessage: "Erro ao ler o arquivo",
        },
      })

      await db.analysis.update({
        where: { id: analysis.id },
        data: { status: "error" },
      })

      return NextResponse.json(
        { error: "Erro ao ler o arquivo. Verifique o formato." },
        { status: 422 }
      )
    }

    const rowLimit =
      organization.plan === "free"
        ? 200
        : organization.plan === "pro"
          ? 10000
          : organization.plan === "premium"
            ? 50000
            : 100000 // admin: sem limite prático

    const transactions = parsed.transactions.slice(0, rowLimit)

    await db.upload.update({
      where: { id: upload.id },
      data: {
        rowsCount: transactions.length,
        periodStart: parsed.periodStart,
        periodEnd: parsed.periodEnd,
        status: "done",
      },
    })

    runAnalysis(transactions, organizationId, upload.id, analysis.id).catch(
      async (error) => {
        console.error("Analysis error:", error)
        await db.analysis.update({
          where: { id: analysis.id },
          data: { status: "error" },
        })
      }
    )

    return NextResponse.json(
      {
        uploadId: upload.id,
        analysisId: analysis.id,
        status: "processing",
        rowsCount: transactions.length,
      },
      { status: 202 }
    )
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}