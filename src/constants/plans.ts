/* ─── Plan Definition ───────────────────────────────────────────────────────── */
export type PlanSlug = "free" | "pro" | "premium"

export interface PlanFeature {
  label: string
  included: boolean
  note?: string
}

export interface Plan {
  slug: PlanSlug
  name: string
  description: string
  price: number | null
  priceLabel: string
  billingLabel: string
  highlighted: boolean
  badge?: string
  limits: PlanLimits
  features: PlanFeature[]
  ctaLabel: string
}

export interface PlanLimits {
  /** Max analyses per month (null = unlimited) */
  analysesPerMonth: number | null
  /** Max CSV/XLSX rows per upload */
  maxRows: number
  /** Max companies/CNPJ tracked */
  maxCompanies: number
  /** Whether AI-powered insights are available */
  aiInsights: boolean
  /** Whether benchmark comparison is available */
  benchmarks: boolean
  /** Whether reports can be exported as PDF */
  pdfExport: boolean
  /** Data retention in months */
  dataRetentionMonths: number
  /** Whether email alerts are available */
  emailAlerts: boolean
  /** Whether API access is available */
  apiAccess: boolean
  /** Whether multi-user (team) is available */
  teamAccess: boolean
  /** Max team members (null = N/A) */
  maxTeamMembers: number | null
  /** Whether priority support is included */
  prioritySupport: boolean
  /** Whether white-label features are available */
  whiteLabel: boolean
}

/* ─── Plans ─────────────────────────────────────────────────────────────────── */
export const PLANS: Plan[] = [
  {
    slug: "free",
    name: "Gratuito",
    description: "Para quem quer experimentar e entender o potencial",
    price: 0,
    priceLabel: "R$ 0",
    billingLabel: "para sempre",
    highlighted: false,
    limits: {
      analysesPerMonth: 1,
      maxRows: 200,
      maxCompanies: 1,
      aiInsights: false,
      benchmarks: false,
      pdfExport: false,
      dataRetentionMonths: 1,
      emailAlerts: false,
      apiAccess: false,
      teamAccess: false,
      maxTeamMembers: null,
      prioritySupport: false,
      whiteLabel: false,
    },
    features: [
      { label: "1 análise por mês", included: true },
      { label: "Até 200 linhas por upload", included: true },
      { label: "Score financeiro básico", included: true },
      { label: "Detecção de vazamentos", included: true },
      { label: "1 empresa / CNPJ", included: true },
      { label: "Insights por IA", included: false },
      { label: "Benchmark por nicho", included: false },
      { label: "Exportação em PDF", included: false },
      { label: "Alertas por e-mail", included: false },
      { label: "Histórico acima de 30 dias", included: false },
      { label: "Suporte prioritário", included: false },
    ],
    ctaLabel: "Começar grátis",
  },
  {
    slug: "pro",
    name: "Pro",
    description: "Para gestores que levam as finanças a sério",
    price: 97,
    priceLabel: "R$ 97",
    billingLabel: "por mês",
    highlighted: true,
    badge: "Mais popular",
    limits: {
      analysesPerMonth: null,
      maxRows: 10_000,
      maxCompanies: 1,
      aiInsights: true,
      benchmarks: true,
      pdfExport: true,
      dataRetentionMonths: 12,
      emailAlerts: true,
      apiAccess: false,
      teamAccess: false,
      maxTeamMembers: null,
      prioritySupport: false,
      whiteLabel: false,
    },
    features: [
      { label: "Análises ilimitadas", included: true },
      { label: "Até 10.000 linhas por upload", included: true },
      { label: "Score financeiro avançado", included: true },
      { label: "Detecção de vazamentos", included: true },
      { label: "1 empresa / CNPJ", included: true },
      { label: "Insights por IA", included: true },
      { label: "Benchmark por nicho", included: true },
      { label: "Exportação em PDF", included: true },
      { label: "Alertas por e-mail", included: true },
      { label: "Histórico de 12 meses", included: true },
      { label: "Suporte prioritário", included: false },
    ],
    ctaLabel: "Assinar Pro",
  },
  {
    slug: "premium",
    name: "Premium",
    description: "Para empresas com múltiplos CNPJs ou times financeiros",
    price: 297,
    priceLabel: "R$ 297",
    billingLabel: "por mês",
    highlighted: false,
    badge: "Completo",
    limits: {
      analysesPerMonth: null,
      maxRows: 50_000,
      maxCompanies: 5,
      aiInsights: true,
      benchmarks: true,
      pdfExport: true,
      dataRetentionMonths: 36,
      emailAlerts: true,
      apiAccess: true,
      teamAccess: true,
      maxTeamMembers: 5,
      prioritySupport: true,
      whiteLabel: false,
    },
    features: [
      { label: "Análises ilimitadas", included: true },
      { label: "Até 50.000 linhas por upload", included: true },
      { label: "Score financeiro avançado", included: true },
      { label: "Detecção de vazamentos", included: true },
      {
        label: "Até 5 empresas / CNPJs",
        included: true,
        note: "Consolide múltiplos CNPJs",
      },
      { label: "Insights por IA", included: true },
      { label: "Benchmark por nicho", included: true },
      { label: "Exportação em PDF", included: true },
      { label: "Alertas por e-mail", included: true },
      { label: "Histórico de 36 meses", included: true },
      { label: "Acesso para equipe (5 usuários)", included: true },
      { label: "Acesso à API", included: true },
      { label: "Suporte prioritário", included: true },
    ],
    ctaLabel: "Assinar Premium",
  },
]

/* ─── Lookup Helpers ────────────────────────────────────────────────────────── */
export function getPlanBySlug(slug: string): Plan | undefined {
  return PLANS.find((p) => p.slug === slug)
}

export function getPlanLimits(plan: string): PlanLimits {
  const found = getPlanBySlug(plan)
  // Fallback to free plan limits if not found
  return found?.limits ?? PLANS[0].limits
}

export function getPlanName(slug: string): string {
  return getPlanBySlug(slug)?.name ?? slug
}

/**
 * Checks if a given plan allows a specific operation.
 */
export function canPerformAnalysis(
  plan: string,
  currentAnalysesThisMonth: number
): boolean {
  const limits = getPlanLimits(plan)
  if (limits.analysesPerMonth === null) return true
  return currentAnalysesThisMonth < limits.analysesPerMonth
}

export function canUploadRows(plan: string, rowCount: number): boolean {
  const limits = getPlanLimits(plan)
  return rowCount <= limits.maxRows
}

export function canAddCompany(plan: string, currentCompanyCount: number): boolean {
  const limits = getPlanLimits(plan)
  return currentCompanyCount < limits.maxCompanies
}

export function isFeatureAvailable(
  plan: string,
  feature: keyof PlanLimits
): boolean {
  const limits = getPlanLimits(plan)
  const value = limits[feature]
  if (typeof value === "boolean") return value
  if (typeof value === "number") return value > 0
  if (value === null) return false
  return Boolean(value)
}

/**
 * Returns the upgrade path suggestion for a given plan.
 */
export function getUpgradePlan(currentPlan: string): Plan | null {
  const current = getPlanBySlug(currentPlan)
  if (!current) return PLANS[1] // suggest Pro
  const idx = PLANS.findIndex((p) => p.slug === currentPlan)
  if (idx === -1 || idx === PLANS.length - 1) return null
  return PLANS[idx + 1]
}
