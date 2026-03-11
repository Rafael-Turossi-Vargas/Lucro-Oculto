/* ─── Niche Definition ──────────────────────────────────────────────────────── */
export interface NicheBenchmarks {
  /** Software/tools as % of revenue */
  softwarePercent: { min: number; max: number }
  /** Marketing as % of revenue */
  marketingPercent: { min: number; max: number }
  /** Payroll as % of revenue */
  payrollPercent: { min: number; max: number }
  /** Operating costs as % of revenue */
  operatingPercent: { min: number; max: number }
  /** Average number of active SaaS subscriptions */
  avgSubscriptions: { min: number; max: number }
  /** Expected gross margin % */
  grossMargin: { min: number; max: number }
}

export interface Niche {
  slug: string
  name: string
  icon: string
  description: string
  commonCategories: string[]
  benchmarks: NicheBenchmarks
  tips: string[]
}

/* ─── Niches ────────────────────────────────────────────────────────────────── */
export const NICHES: Niche[] = [
  {
    slug: "agency",
    name: "Agência Digital / Criativa",
    icon: "🎨",
    description:
      "Agências de marketing, publicidade, design, desenvolvimento e comunicação",
    commonCategories: [
      "ferramentas_software",
      "marketing",
      "pessoal",
      "administrativo",
      "instalacoes",
    ],
    benchmarks: {
      softwarePercent: { min: 5, max: 12 },
      marketingPercent: { min: 3, max: 8 },
      payrollPercent: { min: 45, max: 65 },
      operatingPercent: { min: 5, max: 15 },
      avgSubscriptions: { min: 8, max: 25 },
      grossMargin: { min: 35, max: 60 },
    },
    tips: [
      "Ferramentas de design e desenvolvimento tendem a se multiplicar — audite licenças a cada trimestre",
      "Verifique se todos os assinantes de cada ferramenta SaaS realmente precisam do acesso",
      "Consolide ferramentas de comunicação (Slack, Teams, Discord) em uma única plataforma",
      "Negocie contratos anuais com desconto para ferramentas essenciais",
    ],
  },
  {
    slug: "academy",
    name: "Infoprodutos / EAD",
    icon: "🎓",
    description:
      "Cursos online, mentorias, comunidades de aprendizado, criadores de conteúdo",
    commonCategories: [
      "ferramentas_software",
      "marketing",
      "financeiro",
      "pessoal",
      "administrativo",
    ],
    benchmarks: {
      softwarePercent: { min: 8, max: 18 },
      marketingPercent: { min: 20, max: 40 },
      payrollPercent: { min: 15, max: 35 },
      operatingPercent: { min: 3, max: 8 },
      avgSubscriptions: { min: 6, max: 18 },
      grossMargin: { min: 50, max: 85 },
    },
    tips: [
      "Custo de aquisição de aluno (CAC) deve ser recuperado em até 3 meses",
      "Plataformas EAD cobram percentual sobre vendas — compare taxas com plataformas próprias",
      "Ferramentas de automação de marketing duplicam com frequência — audite fluxos inativos",
      "Taxas de gateway de pagamento impactam muito em alto volume — negocie taxas",
    ],
  },
  {
    slug: "clinic",
    name: "Clínica / Saúde",
    icon: "🏥",
    description:
      "Clínicas médicas, odontológicas, psicológicas, estéticas e de bem-estar",
    commonCategories: [
      "instalacoes",
      "pessoal",
      "operacional",
      "ferramentas_software",
      "impostos",
    ],
    benchmarks: {
      softwarePercent: { min: 2, max: 6 },
      marketingPercent: { min: 5, max: 12 },
      payrollPercent: { min: 35, max: 55 },
      operatingPercent: { min: 10, max: 20 },
      avgSubscriptions: { min: 3, max: 10 },
      grossMargin: { min: 30, max: 55 },
    },
    tips: [
      "Softwares de gestão clínica (PEP, agendamento) podem ser unificados em uma única solução",
      "Materiais e insumos: compare fornecedores a cada 6 meses — preços variam muito",
      "Aluguel de equipamentos vs compra: reavalie quando o contrato estiver próximo do vencimento",
      "Fidelização reduz CAC — invista em ferramentas de relacionamento com pacientes",
    ],
  },
  {
    slug: "restaurant",
    name: "Restaurante / Food Service",
    icon: "🍽️",
    description:
      "Restaurantes, lanchonetes, bares, cafeterias, delivery e food trucks",
    commonCategories: [
      "fornecedores",
      "pessoal",
      "instalacoes",
      "operacional",
      "logistica",
    ],
    benchmarks: {
      softwarePercent: { min: 1, max: 4 },
      marketingPercent: { min: 3, max: 8 },
      payrollPercent: { min: 25, max: 40 },
      operatingPercent: { min: 28, max: 40 },
      avgSubscriptions: { min: 2, max: 8 },
      grossMargin: { min: 60, max: 75 },
    },
    tips: [
      "CMV (Custo de Mercadoria Vendida) ideal: 28–35% do faturamento — compare mensalmente",
      "Desperdício de alimentos pode representar 5–10% do faturamento — monitore fichas técnicas",
      "Taxas de apps de delivery (iFood, Rappi) impactam muito a margem — calcule custo real por pedido",
      "Energia elétrica é um dos maiores custos fixos — verifique desperdícios em equipamentos antigos",
    ],
  },
  {
    slug: "ecommerce",
    name: "E-commerce / Varejo Online",
    icon: "🛒",
    description:
      "Lojas virtuais, marketplaces, dropshipping e varejo omnichannel",
    commonCategories: [
      "marketing",
      "logistica",
      "ferramentas_software",
      "financeiro",
      "fornecedores",
    ],
    benchmarks: {
      softwarePercent: { min: 3, max: 8 },
      marketingPercent: { min: 15, max: 35 },
      payrollPercent: { min: 10, max: 25 },
      operatingPercent: { min: 5, max: 15 },
      avgSubscriptions: { min: 5, max: 15 },
      grossMargin: { min: 30, max: 60 },
    },
    tips: [
      "ROAS (Retorno sobre Gasto com Anúncios) deve ser monitorado por canal — corte canais abaixo de 2x",
      "Taxas de marketplace podem chegar a 20% por venda — calcule margem real por canal",
      "Frete é fator decisivo na conversão — negocie tabelas com múltiplas transportadoras",
      "Chargeback e fraudes em pagamentos online: monitore taxa e revise mecanismos de prevenção",
    ],
  },
  {
    slug: "other",
    name: "Outros Negócios",
    icon: "🏪",
    description:
      "Outros tipos de PME: consultoria, serviços B2B, comércio local e indústria",
    commonCategories: [
      "pessoal",
      "operacional",
      "administrativo",
      "ferramentas_software",
      "impostos",
    ],
    benchmarks: {
      softwarePercent: { min: 2, max: 8 },
      marketingPercent: { min: 5, max: 15 },
      payrollPercent: { min: 30, max: 50 },
      operatingPercent: { min: 10, max: 25 },
      avgSubscriptions: { min: 3, max: 12 },
      grossMargin: { min: 25, max: 55 },
    },
    tips: [
      "Revise contratos de prestação de serviços recorrentes anualmente",
      "Compare custos fixos versus receita — idealmente fixos não devem ultrapassar 30% do faturamento",
      "Identifique os 3 maiores fornecedores e negocie descontos por volume ou pagamento antecipado",
      "Automatize tarefas repetitivas para reduzir custo de mão de obra",
    ],
  },
]

/* ─── Lookup Helpers ────────────────────────────────────────────────────────── */
export function getNicheBySlug(slug: string): Niche | undefined {
  return NICHES.find((n) => n.slug === slug)
}

export function getNicheName(slug: string): string {
  return getNicheBySlug(slug)?.name ?? slug
}

export function getNicheIcon(slug: string): string {
  return getNicheBySlug(slug)?.icon ?? "🏪"
}

export function getNicheSelectOptions(): { value: string; label: string }[] {
  return NICHES.map((n) => ({
    value: n.slug,
    label: `${n.icon} ${n.name}`,
  }))
}

/**
 * Returns benchmark data for a specific metric in a niche.
 */
export function getNicheBenchmark(
  nicheSlug: string,
  metric: keyof NicheBenchmarks
): { min: number; max: number } | undefined {
  return getNicheBySlug(nicheSlug)?.benchmarks[metric]
}
