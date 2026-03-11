/* ─── Raw Transaction (as received from CSV/XLSX) ───────────────────────────── */
export interface RawTransaction {
  date: string
  description: string
  amount: string | number
  [key: string]: unknown
}

/* ─── Parsed Upload Result ──────────────────────────────────────────────────── */
export interface ParsedUpload {
  transactions: RawTransaction[]
  headers: string[]
  rowsCount: number
  periodStart?: Date
  periodEnd?: Date
  errors?: string[]
  warnings?: string[]
}

/* ─── Upload Column Mapping ─────────────────────────────────────────────────── */
export interface UploadMapping {
  /** Column name containing the date */
  dateColumn: string
  /** Column name containing the description/memo */
  descriptionColumn: string
  /** Column name containing the amount (can be signed or separate credit/debit) */
  amountColumn: string
  /** Column name for credit amounts (if split from debit) */
  creditColumn?: string
  /** Column name for debit amounts (if split from credit) */
  debitColumn?: string
  /** Column name for balance (optional) */
  balanceColumn?: string
  /** Column name for transaction type (optional) */
  typeColumn?: string
  /** Expected date format hint (e.g. "dd/MM/yyyy") */
  dateFormat?: string
}

/* ─── Upload State (UI state machine) ──────────────────────────────────────── */
export type UploadStatus =
  | "idle"
  | "uploading"
  | "parsing"
  | "mapping"
  | "validating"
  | "ready"
  | "error"

export interface UploadState {
  status: UploadStatus
  file?: File
  fileName?: string
  fileSize?: number
  parsed?: ParsedUpload
  mapping?: UploadMapping
  validationErrors?: ValidationError[]
  uploadProgress?: number
  uploadId?: string
}

/* ─── Validation Error ──────────────────────────────────────────────────────── */
export interface ValidationError {
  row?: number
  column?: string
  message: string
  severity: "error" | "warning"
  value?: unknown
}

/* ─── Supported File Formats ────────────────────────────────────────────────── */
export type SupportedFileFormat = "csv" | "xlsx" | "xls" | "ofx"

export interface FileFormatConfig {
  format: SupportedFileFormat
  label: string
  extensions: string[]
  mimeTypes: string[]
  maxSizeMB: number
}

export const SUPPORTED_FORMATS: FileFormatConfig[] = [
  {
    format: "csv",
    label: "CSV",
    extensions: [".csv"],
    mimeTypes: ["text/csv", "text/plain", "application/csv"],
    maxSizeMB: 10,
  },
  {
    format: "xlsx",
    label: "Excel (XLSX)",
    extensions: [".xlsx"],
    mimeTypes: [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ],
    maxSizeMB: 20,
  },
  {
    format: "xls",
    label: "Excel (XLS)",
    extensions: [".xls"],
    mimeTypes: ["application/vnd.ms-excel"],
    maxSizeMB: 20,
  },
]

/* ─── Bank Statement Formats (pre-configured mappings) ─────────────────────── */
export interface BankPreset {
  id: string
  name: string
  icon: string
  mapping: UploadMapping
  description: string
}

export const BANK_PRESETS: BankPreset[] = [
  {
    id: "itau_csv",
    name: "Itaú",
    icon: "🏦",
    description: "Extrato CSV exportado pelo app/internet banking Itaú",
    mapping: {
      dateColumn: "Data",
      descriptionColumn: "Histórico",
      amountColumn: "Valor",
      dateFormat: "dd/MM/yyyy",
    },
  },
  {
    id: "bradesco_csv",
    name: "Bradesco",
    icon: "🏦",
    description: "Extrato CSV exportado pelo Bradesco",
    mapping: {
      dateColumn: "Data",
      descriptionColumn: "Descrição",
      amountColumn: "Valor",
      dateFormat: "dd/MM/yyyy",
    },
  },
  {
    id: "nubank_csv",
    name: "Nubank",
    icon: "🟣",
    description: "Extrato CSV exportado pelo app Nubank",
    mapping: {
      dateColumn: "Data",
      descriptionColumn: "Descrição",
      amountColumn: "Valor",
      dateFormat: "yyyy-MM-dd",
    },
  },
  {
    id: "inter_csv",
    name: "Inter",
    icon: "🧡",
    description: "Extrato CSV exportado pelo banco Inter",
    mapping: {
      dateColumn: "Data Lançamento",
      descriptionColumn: "Histórico",
      amountColumn: "Valor",
      typeColumn: "Tipo Transação",
      dateFormat: "dd/MM/yyyy",
    },
  },
  {
    id: "santander_csv",
    name: "Santander",
    icon: "🔴",
    description: "Extrato CSV exportado pelo Santander",
    mapping: {
      dateColumn: "Data",
      descriptionColumn: "Descrição",
      amountColumn: "Valor",
      dateFormat: "dd/MM/yyyy",
    },
  },
  {
    id: "custom",
    name: "Personalizado",
    icon: "⚙️",
    description: "Configure manualmente o mapeamento das colunas",
    mapping: {
      dateColumn: "",
      descriptionColumn: "",
      amountColumn: "",
    },
  },
]
