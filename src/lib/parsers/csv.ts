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

// Excel serial date origin (Jan 1, 1900, adjusted for Excel's leap year bug)
const EXCEL_EPOCH = new Date(Date.UTC(1899, 11, 30))

export function normalizeDate(value: string | number): Date | null {
  // Excel serial date (numeric): e.g. 45000 → real date
  if (typeof value === "number" && value > 0) {
    const d = new Date(EXCEL_EPOCH.getTime() + value * 86400000)
    if (!Number.isNaN(d.getTime())) return d
  }

  const raw = String(value ?? "").trim()
  if (!raw) return null

  // Excel serial date as string: "45000" — threshold > 25000 avoids false-positives on year numbers like "2024"
  const serialNum = Number(raw)
  if (!Number.isNaN(serialNum) && serialNum > 25000 && serialNum < 100000 && !raw.includes("/") && !raw.includes("-") && !raw.includes(".")) {
    const d = new Date(EXCEL_EPOCH.getTime() + serialNum * 86400000)
    if (!Number.isNaN(d.getTime())) return d
  }

  // Strip trailing time/timezone portion (e.g. "15/01/2024 00:00:00", "2024-03-15T10:30:00Z")
  // so all subsequent patterns can match date-only strings
  const dateOnly = raw.replace(/[\sT]\d{1,2}:\d{2}.*$/, "").trim()

  // ISO 8601: 2024-03-15 or 2024-3-5
  if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(dateOnly)) {
    const d = new Date(`${dateOnly}T00:00:00`)
    if (!Number.isNaN(d.getTime())) return d
  }

  // DD/MM/YYYY or D/M/YYYY (Brazilian)
  const brSlash = dateOnly.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (brSlash) {
    const d = new Date(`${brSlash[3]}-${brSlash[2].padStart(2, "0")}-${brSlash[1].padStart(2, "0")}T00:00:00`)
    if (!Number.isNaN(d.getTime())) return d
  }

  // DD/MM/YY or D/M/YY (two-digit year — assume 2000s)
  const brSlashShort = dateOnly.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2})$/)
  if (brSlashShort) {
    const year = Number(brSlashShort[3]) < 50 ? `20${brSlashShort[3]}` : `19${brSlashShort[3]}`
    const d = new Date(`${year}-${brSlashShort[2].padStart(2, "0")}-${brSlashShort[1].padStart(2, "0")}T00:00:00`)
    if (!Number.isNaN(d.getTime())) return d
  }

  // DD-MM-YYYY or D-M-YYYY
  const brDash = dateOnly.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/)
  if (brDash) {
    const d = new Date(`${brDash[3]}-${brDash[2].padStart(2, "0")}-${brDash[1].padStart(2, "0")}T00:00:00`)
    if (!Number.isNaN(d.getTime())) return d
  }

  // DD.MM.YYYY or D.M.YYYY
  const brDot = dateOnly.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/)
  if (brDot) {
    const d = new Date(`${brDot[3]}-${brDot[2].padStart(2, "0")}-${brDot[1].padStart(2, "0")}T00:00:00`)
    if (!Number.isNaN(d.getTime())) return d
  }

  // YYYY/MM/DD or YYYY/M/D
  const isoSlash = dateOnly.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/)
  if (isoSlash) {
    const d = new Date(`${isoSlash[1]}-${isoSlash[2].padStart(2, "0")}-${isoSlash[3].padStart(2, "0")}T00:00:00`)
    if (!Number.isNaN(d.getTime())) return d
  }

  // Month name: "15 mar 2024", "15 março 2024", "Mar 15, 2024"
  const MONTH_MAP: Record<string, string> = {
    jan: "01", fev: "02", mar: "03", abr: "04", mai: "05", jun: "06",
    jul: "07", ago: "08", set: "09", out: "10", nov: "11", dez: "12",
    feb: "02", apr: "04", may: "05", aug: "08", sep: "09", oct: "10", dec: "12",
  }
  const monthName = dateOnly.match(/^(\d{1,2})\s+([a-záêç]{3,})\.?\s+(\d{4})$/i)
  if (monthName) {
    const m = MONTH_MAP[monthName[2].toLowerCase().slice(0, 3)]
    if (m) {
      const d = new Date(`${monthName[3]}-${m}-${monthName[1].padStart(2, "0")}T00:00:00`)
      if (!Number.isNaN(d.getTime())) return d
    }
  }

  // "Mar 15, 2024" or "March 15, 2024"
  const usMonthName = dateOnly.match(/^([a-z]{3,})\s+(\d{1,2}),?\s+(\d{4})$/i)
  if (usMonthName) {
    const m = MONTH_MAP[usMonthName[1].toLowerCase().slice(0, 3)]
    if (m) {
      const d = new Date(`${usMonthName[3]}-${m}-${usMonthName[2].padStart(2, "0")}T00:00:00`)
      if (!Number.isNaN(d.getTime())) return d
    }
  }

  // DDMMYYYY (without separator, common in some bank exports)
  const compact = dateOnly.match(/^(\d{2})(\d{2})(\d{4})$/)
  if (compact) {
    const d = new Date(`${compact[3]}-${compact[2]}-${compact[1]}T00:00:00`)
    if (!Number.isNaN(d.getTime())) return d
  }

  // Last resort: let the JS engine try to parse it (handles many locale-specific formats)
  const fallback = new Date(raw)
  if (!Number.isNaN(fallback.getTime())) return fallback

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
    // PT-BR
    "data", "lancamento", "pagamento", "vencimento",
    "competencia", "movimento", "emissao", "transacao", "referencia",
    "ocorrencia", "realizacao", "dt",
    // EN
    "date", "transaction date", "posting date", "value date", "settlement date",
    "txn date", "trans date",
  ]
  const DESC_KW = [
    // PT-BR
    "descricao", "descr", "historico", "hist",
    "memo", "observacao", "complemento", "detalhe", "nome",
    "estabelecimento", "favorecido", "beneficiario", "lojista",
    "informacao", "origem", "destino", "participante",
    "razao social", "empresa", "contraparte", "lancamento",
    // Nubank / bancos digitais
    "titulo", "titulo do lancamento", "identificacao", "identificador",
    "categoria", "subcategoria", "tipo de lancamento",
    // Outros bancos BR
    "docto", "documento", "numero do documento", "historico completo",
    "complemento do lancamento", "informacoes adicionais",
    // EN
    "description", "narrative", "details", "merchant", "payee", "reference",
    "particulars", "transaction description", "trans description",
  ]
  const AMOUNT_KW = [
    // PT-BR
    "valor", "quantia", "montante", "vlr", "preco", "custo",
    // EN
    "amount", "total", "value", "sum", "net amount", "transaction amount",
  ]
  // NOTE: "cr" and "dr" removed intentionally — too short, matches substrings like "descricao" (des-cr-icao)
  const CREDIT_KW = ["credito", "credit", "entrada", "receita", "deposito", "deposit", "creditos", "entradas"]
  const DEBIT_KW = ["debito", "debit", "saida", "despesa", "saque", "withdrawal", "debitos", "saidas"]

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

// Try to find the real header row by scanning up to 100 lines for known column keywords
function findHeaderRow(lines: string[], delimiter: string): number {
  for (let i = 0; i < Math.min(lines.length, 100); i++) {
    const cols = lines[i].split(delimiter).map(normalizeHeader)
    const hasDate = cols.some((c) =>
      ["data", "date", "lancamento", "pagamento", "dt", "transaction date", "posting date"].some((kw) => c.includes(kw))
    )
    const hasValue = cols.some((c) =>
      ["valor", "amount", "total", "credito", "debito", "credit", "debit", "vlr", "entrada", "saida", "value", "deposit", "withdrawal"].some((kw) => c.includes(kw))
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