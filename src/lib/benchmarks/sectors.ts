// Benchmarks de eficiência financeira por setor (dados baseados em médias de mercado BR)
// Percentuais em relação à receita bruta

export type SectorBenchmark = {
  sector: string
  label: string
  averageScore: number
  payroll: number        // % receita
  rent: number           // % receita
  marketing: number      // % receita
  utilities: number      // % receita
  software: number       // % receita
  grossMargin: number    // % receita
  netMargin: number      // % receita
}

export const SECTOR_BENCHMARKS: Record<string, SectorBenchmark> = {
  varejo: {
    sector: "varejo",
    label: "Varejo",
    averageScore: 58,
    payroll: 18,
    rent: 8,
    marketing: 5,
    utilities: 3,
    software: 2,
    grossMargin: 35,
    netMargin: 8,
  },
  servicos: {
    sector: "servicos",
    label: "Serviços",
    averageScore: 65,
    payroll: 35,
    rent: 5,
    marketing: 8,
    utilities: 2,
    software: 4,
    grossMargin: 55,
    netMargin: 15,
  },
  restaurante: {
    sector: "restaurante",
    label: "Alimentação & Restaurante",
    averageScore: 52,
    payroll: 28,
    rent: 10,
    marketing: 3,
    utilities: 6,
    software: 1,
    grossMargin: 30,
    netMargin: 6,
  },
  saude: {
    sector: "saude",
    label: "Saúde & Clínicas",
    averageScore: 61,
    payroll: 40,
    rent: 7,
    marketing: 5,
    utilities: 3,
    software: 3,
    grossMargin: 50,
    netMargin: 12,
  },
  tecnologia: {
    sector: "tecnologia",
    label: "Tecnologia & Software",
    averageScore: 72,
    payroll: 50,
    rent: 3,
    marketing: 12,
    utilities: 1,
    software: 8,
    grossMargin: 70,
    netMargin: 20,
  },
  educacao: {
    sector: "educacao",
    label: "Educação & Cursos",
    averageScore: 68,
    payroll: 30,
    rent: 6,
    marketing: 15,
    utilities: 2,
    software: 5,
    grossMargin: 60,
    netMargin: 18,
  },
  construcao: {
    sector: "construcao",
    label: "Construção Civil",
    averageScore: 55,
    payroll: 25,
    rent: 4,
    marketing: 3,
    utilities: 4,
    software: 1,
    grossMargin: 28,
    netMargin: 7,
  },
  industria: {
    sector: "industria",
    label: "Indústria & Manufatura",
    averageScore: 60,
    payroll: 22,
    rent: 5,
    marketing: 4,
    utilities: 8,
    software: 2,
    grossMargin: 32,
    netMargin: 9,
  },
  logistica: {
    sector: "logistica",
    label: "Logística & Transporte",
    averageScore: 57,
    payroll: 30,
    rent: 3,
    marketing: 2,
    utilities: 10,
    software: 2,
    grossMargin: 25,
    netMargin: 6,
  },
  ecommerce: {
    sector: "ecommerce",
    label: "E-commerce",
    averageScore: 62,
    payroll: 12,
    rent: 2,
    marketing: 18,
    utilities: 2,
    software: 6,
    grossMargin: 40,
    netMargin: 10,
  },
}

export const DEFAULT_BENCHMARK = SECTOR_BENCHMARKS.servicos

export function getBenchmarkBySector(niche: string | null | undefined): SectorBenchmark {
  if (!niche) return DEFAULT_BENCHMARK
  const key = niche.toLowerCase().replace(/\s+/g, "")
  // Try exact match first
  if (SECTOR_BENCHMARKS[key]) return SECTOR_BENCHMARKS[key]
  // Try partial match
  const found = Object.values(SECTOR_BENCHMARKS).find(b =>
    key.includes(b.sector) || b.sector.includes(key) || b.label.toLowerCase().includes(key)
  )
  return found ?? DEFAULT_BENCHMARK
}

export function compareToBenchmark(
  value: number,
  benchmark: number,
  inverted = false // true = lower is better (e.g., expenses)
): { status: "above" | "at" | "below"; diff: number } {
  const diff = value - benchmark
  const threshold = benchmark * 0.1 // 10% tolerance
  if (Math.abs(diff) <= threshold) return { status: "at", diff }
  if (inverted) {
    return diff > 0 ? { status: "above", diff } : { status: "below", diff }
  }
  return diff > 0 ? { status: "above", diff } : { status: "below", diff }
}
