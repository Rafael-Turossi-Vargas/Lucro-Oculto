import Papa from "papaparse"
import type { ParsedUpload, RawTransaction, UploadMapping } from "@/types/transactions"

type CsvRow = Record<string, string>

export function normalizeAmount(value: string): number {
  let raw = String(value ?? "").trim()

  // Remove "R$" and currency symbols
  raw = raw.replace(/R\$\s*/gi, "").replace(/\s/g, "")

  // Negative in parentheses: (1.234,56) → -1234.56
  const isNegativeParens = raw.startsWith("(") && raw.endsWith(")")
  if (isNegativeParens) raw = "-" + raw.slice(1, -1)

  // Suffix "D" after space meaning débito: "1234,56 D" → negative
  const hasDebitSuffix = /\d D$/i.test(raw)
  if (hasDebitSuffix) raw = raw.slice(0, -2)

  // Detect BR vs EN number format: last separator wins
  const lastDot = raw.lastIndexOf(".")
  const lastComma = raw.lastIndexOf(",")

  let cleaned: string
  if (lastComma > lastDot) {
    // BR format: 1.234,56
    cleaned = raw.replace(/\./g, "").replace(",", ".")
  } else {
    // EN format: 1,234.56 or plain 1234.56
    cleaned = raw.replace(/,/g, "")
  }

  cleaned = cleaned.replace(/[^\d.-]/g, "")
  const parsed = Number(cleaned)
  const result = Number.isFinite(parsed) ? parsed : 0
  return hasDebitSuffix ? -Math.abs(result) : result
}

export function normalizeDate(value: string): Date | null {
  const raw = String(value ?? "").trim()
  if (!raw) return null

  // ISO / JS auto-parse (handles 2024-03-15, etc.)
  const isoDate = new Date(raw)
  if (!Number.isNaN(isoDate.getTime())) return isoDate

  // DD/MM/YYYY
  const brSlash = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (brSlash) {
    const d = new Date(`${brSlash[3]}-${brSlash[2]}-${brSlash[1]}T00:00:00`)
    if (!Number.isNaN(d.getTime())) return d
  }

  // DD-MM-YYYY
  const brDash = raw.match(/^(\d{2})-(\d{2})-(\d{4})$/)
  if (brDash) {
    const d = new Date(`${brDash[3]}-${brDash[2]}-${brDash[1]}T00:00:00`)
    if (!Number.isNaN(d.getTime())) return d
  }

  // DD.MM.YYYY
  const brDot = raw.match(/^(\d{2})\.(\d{2})\.(\d{4})$/)
  if (brDot) {
    const d = new Date(`${brDot[3]}-${brDot[2]}-${brDot[1]}T00:00:00`)
    if (!Number.isNaN(d.getTime())) return d
  }

  // YYYY/MM/DD
  const isoSlash = raw.match(/^(\d{4})\/(\d{2})\/(\d{2})$/)
  if (isoSlash) {
    const d = new Date(`${isoSlash[1]}-${isoSlash[2]}-${isoSlash[3]}T00:00:00`)
    if (!Number.isNaN(d.getTime())) return d
  }

  return null
}

// Normalize header: lowercase, remove accents and special chars → plain ASCII
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

export function detectColumns(headers: string[]): UploadMapping | null {
  const normalized = headers.map(normalizeHeader)

  const DATE_KW = [
    "data", "date", "lancamento", "pagamento", "vencimento",
    "competencia", "movimento", "emissao", "transacao", "referencia",
    "ocorrencia", "realizacao", "dt",
  ]
  const DESC_KW = [
    "descricao", "descr", "description", "historico", "hist",
    "memo", "observacao", "complemento", "detalhe", "nome",
    "estabelecimento", "favorecido", "beneficiario", "lojista",
    "informacao", "origem", "destino", "participante",
    "razao social", "empresa", "contraparte", "lancamento",
  ]
  const AMOUNT_KW = [
    "valor", "amount", "total", "quantia", "montante", "vlr", "preco", "custo",
  ]
  const CREDIT_KW = ["credito", "credit", "entrada", "receita", "deposito"]
  const DEBIT_KW = ["debito", "debit", "saida", "despesa", "saque"]

  const findIndex = (keywords: string[], exclude: number[] = []) =>
    normalized.findIndex((h, i) => {
      if (exclude.includes(i)) return false
      return keywords.some((kw) => h === kw || h.includes(kw))
    })

  let dateIndex = findIndex(DATE_KW)
  let descriptionIndex = findIndex(DESC_KW)
  let amountIndex = findIndex(AMOUNT_KW)
  const creditIndex = findIndex(CREDIT_KW)
  const debitIndex = findIndex(DEBIT_KW)

  // Fallback: any column starting with "dat"
  if (dateIndex < 0) {
    dateIndex = normalized.findIndex((h) => h.startsWith("dat"))
  }

  // Fallback for description: first text column not already mapped
  if (descriptionIndex < 0 || descriptionIndex === dateIndex) {
    const used = new Set([dateIndex, amountIndex, creditIndex, debitIndex].filter((i) => i >= 0))
    descriptionIndex = normalized.findIndex((h, i) => {
      if (used.has(i)) return false
      return !["valor", "saldo", "vlr", "total", "vl "].some((kw) => h.includes(kw))
    })
  }

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

// Try to find the real header row by scanning lines for known column keywords
function findHeaderRow(lines: string[], delimiter: string): number {
  for (let i = 0; i < Math.min(lines.length, 20); i++) {
    const cols = lines[i].split(delimiter).map(normalizeHeader)
    const hasDate = cols.some((c) => ["data", "date", "lancamento", "pagamento", "dt"].some((kw) => c.includes(kw)))
    const hasValue = cols.some((c) =>
      ["valor", "amount", "total", "credito", "debito", "credit", "debit", "vlr", "entrada", "saida"].some((kw) => c.includes(kw))
    )
    if (hasDate && hasValue) return i
  }
  return 0
}

// Detect the delimiter used in the CSV (;, ,, \t)
function detectDelimiter(sample: string): string {
  const counts = {
    ";": (sample.match(/;/g) ?? []).length,
    ",": (sample.match(/,/g) ?? []).length,
    "\t": (sample.match(/\t/g) ?? []).length,
  }
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0]
}

export async function parseCSV(content: string): Promise<ParsedUpload> {
  // Strip BOM if present
  const cleaned = content.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").replace(/\r/g, "\n")

  const lines = cleaned.split("\n").filter((l) => l.trim().length > 0)
  if (lines.length < 2) {
    return { transactions: [], headers: [], rowsCount: 0, errors: ["Arquivo vazio ou sem dados suficientes"] }
  }

  // Detect delimiter from first 5 lines
  const sample = lines.slice(0, 5).join("\n")
  const delimiter = detectDelimiter(sample)

  // Find real header row (skip metadata lines at the top)
  const headerRowIndex = findHeaderRow(lines, delimiter)
  const csvFromHeader = lines.slice(headerRowIndex).join("\n")

  console.log("[CSV Parser] delimiter:", JSON.stringify(delimiter), "headerRow:", headerRowIndex, "totalLines:", lines.length)
  console.log("[CSV Parser] first lines:", lines.slice(0, 5))

  const result = Papa.parse<CsvRow>(csvFromHeader, {
    header: true,
    skipEmptyLines: true,
    delimiter,
    transformHeader: (header) => String(header ?? "").trim(),
  })

  const rows = result.data ?? []
  const headers = result.meta.fields ?? []
  const mapping = detectColumns(headers)

  console.log("[CSV Parser] headers:", headers)
  console.log("[CSV Parser] mapping:", mapping)
  console.log("[CSV Parser] rows parsed:", rows.length)

  if (!mapping) {
    return {
      transactions: [],
      headers,
      rowsCount: 0,
      errors: [
        `Colunas encontradas: [${headers.join(", ")}]. Não foi possível identificar data, descrição e valor. Certifique-se de que o arquivo tem essas colunas.`,
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