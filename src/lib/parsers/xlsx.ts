import * as XLSX from "xlsx"
import type { ParsedUpload, RawTransaction } from "@/types/transactions"
import { detectColumns, normalizeAmount, normalizeDate } from "./csv"

// Normalize a header string the same way detectColumns does
function normalizeHeader(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

// Find the real header row by scanning for rows that contain date + value keywords
// (mirrors the same logic as findHeaderRow in csv.ts)
function findHeaderRowIndex(rows: unknown[][]): number {
  const DATE_KW = ["data", "date", "lancamento", "pagamento", "dt", "transaction date", "posting date"]
  const VALUE_KW = ["valor", "amount", "total", "credito", "debito", "credit", "debit", "vlr", "entrada", "saida", "value", "deposit", "withdrawal"]

  for (let i = 0; i < Math.min(rows.length, 100); i++) {
    const cols = (rows[i] ?? []).map((c) => normalizeHeader(String(c ?? "")))
    const hasDate = cols.some((c) => DATE_KW.some((kw) => c.includes(kw)))
    const hasValue = cols.some((c) => VALUE_KW.some((kw) => c.includes(kw)))
    if (hasDate && hasValue) return i
  }
  return 0
}

export async function parseXLSX(buffer: Buffer): Promise<ParsedUpload> {
  const workbook = XLSX.read(buffer, {
    type: "buffer",
    cellDates: true,  // Parse date cells as real Date objects
    raw: false,       // Format cells as strings when not a Date
  })

  const sheetName = workbook.SheetNames[0]
  const sheet = workbook.Sheets[sheetName]

  // Get raw rows with original indices preserved (header:1 = array mode)
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

  // Find real header row (skip metadata/title rows at the top)
  const headerRowIndex = findHeaderRowIndex(rawRows)
  const headerRow = rawRows[headerRowIndex] ?? []

  // Build headers array KEEPING original indices (do NOT filter — empty columns must preserve alignment)
  const headers: string[] = headerRow.map((h) => String(h ?? "").trim())

  // Filter out completely empty trailing headers for the column mapping lookup,
  // but keep the original index mapping separate
  const nonEmptyHeaders = headers.filter(Boolean)
  const mapping = detectColumns(nonEmptyHeaders)

  if (!mapping) {
    return {
      transactions: [],
      headers: nonEmptyHeaders,
      rowsCount: 0,
      errors: [
        `Colunas encontradas: [${nonEmptyHeaders.join(", ")}]. Não foi possível identificar data, descrição e valor.`,
      ],
    }
  }

  // Build a column-name → original-index map using the FULL headers (with gaps preserved)
  const headerIndexMap = new Map<string, number>()
  headers.forEach((h, i) => {
    if (h && !headerIndexMap.has(h)) {
      headerIndexMap.set(h, i)
    }
  })

  const transactions: RawTransaction[] = []
  const errors: string[] = []

  for (let rowNum = headerRowIndex + 1; rowNum < rawRows.length; rowNum++) {
    const row = rawRows[rowNum] ?? []

    // Build record using CORRECT original column indices
    const record: Record<string, string> = {}
    headers.forEach((header, colIndex) => {
      if (header) {
        const cell = row[colIndex]
        // If cell is a Date object (from cellDates: true), format it as ISO string
        if (cell instanceof Date) {
          record[header] = cell.toISOString()
        } else {
          record[header] = String(cell ?? "").trim()
        }
      }
    })

    const dateRaw = record[mapping.dateColumn] ?? ""
    const descriptionRaw = record[mapping.descriptionColumn] ?? ""

    if (!dateRaw && !descriptionRaw) continue

    // Also try numeric cell value directly for date columns (cellDates: true may not catch all)
    const dateColIndex = headerIndexMap.get(mapping.dateColumn) ?? -1
    const rawCell = dateColIndex >= 0 ? row[dateColIndex] : undefined
    const dateInput = rawCell instanceof Date ? rawCell.toISOString() : dateRaw

    const date = normalizeDate(dateInput)
    if (!date) {
      if (errors.length < 10) {
        errors.push(`Linha ${rowNum + 1}: data inválida "${dateRaw}"`)
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
    .map((t) => new Date(t.date))
    .filter((d) => !Number.isNaN(d.getTime()))
    .sort((a, b) => a.getTime() - b.getTime())

  return {
    transactions,
    headers: nonEmptyHeaders,
    rowsCount: transactions.length,
    periodStart: dates[0],
    periodEnd: dates[dates.length - 1],
    errors,
  }
}
