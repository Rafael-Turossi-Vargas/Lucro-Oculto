import Papa from "papaparse"
import type { ParsedUpload, RawTransaction, UploadMapping } from "@/types/transactions"

type CsvRow = Record<string, string>

export function normalizeAmount(value: string): number {
  const cleaned = String(value ?? "")
    .replace(/\s/g, "")
    .replace(/\./g, "")
    .replace(",", ".")
    .replace(/[^\d.-]/g, "")

  const parsed = Number(cleaned)
  return Number.isFinite(parsed) ? parsed : 0
}

export function normalizeDate(value: string): Date | null {
  const raw = String(value ?? "").trim()
  if (!raw) return null

  const isoDate = new Date(raw)
  if (!Number.isNaN(isoDate.getTime())) return isoDate

  const brMatch = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (brMatch) {
    const [, dd, mm, yyyy] = brMatch
    const date = new Date(`${yyyy}-${mm}-${dd}T00:00:00`)
    if (!Number.isNaN(date.getTime())) return date
  }

  return null
}

export function detectColumns(headers: string[]): UploadMapping | null {
  const normalized = headers.map((header) => header.toLowerCase().trim())

  const dateIndex = normalized.findIndex((header) =>
    ["data", "date", "dt", "data lançamento", "data lancamento"].includes(header)
  )

  const descriptionIndex = normalized.findIndex((header) =>
    ["descricao", "descrição", "description", "historico", "histórico", "memo"].includes(header)
  )

  const amountIndex = normalized.findIndex((header) =>
    ["valor", "amount", "total"].includes(header)
  )

  const creditIndex = normalized.findIndex((header) =>
    ["credito", "crédito", "credit"].includes(header)
  )

  const debitIndex = normalized.findIndex((header) =>
    ["debito", "débito", "debit"].includes(header)
  )

  const dateColumn = dateIndex >= 0 ? headers[dateIndex] : undefined
  const descriptionColumn = descriptionIndex >= 0 ? headers[descriptionIndex] : undefined
  const amountColumn = amountIndex >= 0 ? headers[amountIndex] : undefined
  const creditColumn = creditIndex >= 0 ? headers[creditIndex] : undefined
  const debitColumn = debitIndex >= 0 ? headers[debitIndex] : undefined

  if (!dateColumn || !descriptionColumn) return null
  if (!amountColumn && !(creditColumn && debitColumn)) return null

  return {
    dateColumn,
    descriptionColumn,
    amountColumn: amountColumn ?? "",
    creditColumn,
    debitColumn,
  }
}

export async function parseCSV(content: string): Promise<ParsedUpload> {
  const result = Papa.parse<CsvRow>(content, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => String(header ?? "").trim(),
  })

  const rows = result.data ?? []
  const headers = result.meta.fields ?? []
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

  for (let index = 0; index < rows.length; index++) {
    const row = rows[index]
    const dateRaw = row[mapping.dateColumn] ?? ""
    const descriptionRaw = row[mapping.descriptionColumn] ?? ""

    if (!dateRaw && !descriptionRaw) continue

    const date = normalizeDate(dateRaw)
    if (!date) {
      if (errors.length < 10) {
        errors.push(`Linha ${index + 2}: data inválida "${dateRaw}"`)
      }
      continue
    }

    let amount = 0

    if (mapping.creditColumn && mapping.debitColumn) {
      const credit = normalizeAmount(row[mapping.creditColumn] ?? "0")
      const debit = normalizeAmount(row[mapping.debitColumn] ?? "0")
      amount = credit - Math.abs(debit)
    } else if (mapping.amountColumn) {
      amount = normalizeAmount(row[mapping.amountColumn] ?? "0")
    }

    transactions.push({
      ...row,
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