import * as XLSX from "xlsx"
import type { ParsedUpload, RawTransaction } from "@/types/transactions"
import { detectColumns, normalizeAmount, normalizeDate } from "./csv"

export async function parseXLSX(buffer: Buffer): Promise<ParsedUpload> {
  const workbook = XLSX.read(buffer, {
    type: "buffer",
    cellDates: false,
  })

  const sheetName = workbook.SheetNames[0]
  const sheet = workbook.Sheets[sheetName]

  const rawRows = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    defval: "",
    raw: false,
  }) as unknown[][]

  if (rawRows.length < 2) {
    return {
      transactions: [],
      headers: [],
      rowsCount: 0,
      errors: ["Arquivo vazio ou sem dados"],
    }
  }

  const headers = rawRows[0]
    .map((header) => String(header ?? "").trim())
    .filter(Boolean)

  const mapping = detectColumns(headers)

  if (!mapping) {
    return {
      transactions: [],
      headers,
      rowsCount: 0,
      errors: [
        "Não foi possível detectar as colunas. Certifique-se de ter colunas de data, descrição e valor.",
      ],
    }
  }

  const transactions: RawTransaction[] = []
  const errors: string[] = []

  for (let index = 1; index < rawRows.length; index++) {
    const row = rawRows[index]
    const record: Record<string, string> = {}

    headers.forEach((header, headerIndex) => {
      record[header] = String(row[headerIndex] ?? "").trim()
    })

    const dateRaw = record[mapping.dateColumn] ?? ""
    const descriptionRaw = record[mapping.descriptionColumn] ?? ""

    if (!dateRaw && !descriptionRaw) continue

    const date = normalizeDate(dateRaw)
    if (!date) {
      if (errors.length < 10) {
        errors.push(`Linha ${index + 1}: data inválida "${dateRaw}"`)
      }
      continue
    }

    let amount = 0

    if (mapping.creditColumn && mapping.debitColumn) {
      const credit = normalizeAmount(record[mapping.creditColumn] ?? "0")
      const debit = normalizeAmount(record[mapping.debitColumn] ?? "0")
      amount = credit - Math.abs(debit)
    } else if (mapping.amountColumn) {
      amount = normalizeAmount(record[mapping.amountColumn] ?? "0")
    }

    transactions.push({
      ...record,
      date: date.toISOString(),
      description: descriptionRaw,
      amount,
    })
  }

  const dates = transactions
    .map((transaction) => new Date(transaction.date))
    .filter((date) => !Number.isNaN(date.getTime()))
    .sort((a, b) => a.getTime() - b.getTime())

  return {
    transactions,
    headers,
    rowsCount: transactions.length,
    periodStart: dates[0],
    periodEnd: dates[dates.length - 1],
    errors,
  }
}