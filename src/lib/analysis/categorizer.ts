const CATEGORY_RULES: { slug: string; keywords: string[] }[] = [
  {
    slug: "ferramentas_software",
    keywords: [
      "slack",
      "notion",
      "figma",
      "trello",
      "asana",
      "monday",
      "clickup",
      "zoom",
      "google workspace",
      "microsoft 365",
      "adobe",
      "canva",
      "dropbox",
      "hubspot",
      "pipedrive",
      "salesforce",
      "github",
      "vercel",
      "aws",
      "azure",
      "digitalocean",
      "shopify",
      "hotmart",
      "hotjar",
      "intercom",
      "typeform",
      "airtable",
      "zapier",
      "make",
      "n8n",
      "activecampaign",
      "mailchimp",
      "rdstation",
      "semrush",
      "ahrefs",
      "meta ads",
      "google ads",
      "linkedin ads",
      "software",
      "saas",
      "app ",
      "plataforma",
      "licença",
      "assinatura",
    ],
  },
  {
    slug: "marketing",
    keywords: [
      "marketing",
      "publicidade",
      "anuncio",
      "anúncio",
      "meta ",
      "facebook ads",
      "google ads",
      "instagram",
      "tiktok",
      "influencer",
      "agencia de marketing",
      "agência de marketing",
      "seo",
      "copywriting",
      "branding",
      "criativo",
      "design",
      "identidade visual",
    ],
  },
  {
    slug: "pessoal",
    keywords: [
      "folha",
      "salario",
      "salário",
      "funcionario",
      "funcionário",
      "holerite",
      "rescisao",
      "rescisão",
      "fgts",
      "inss",
      "sindicato",
      "vale transporte",
      "vale refeição",
      "refeicao",
      "plano de saude",
      "saúde",
      "previdencia",
      "previdência",
      "rh ",
      "recursos humanos",
      "pj ",
      "freelancer",
      "terceiro",
      "terceirizado",
    ],
  },
  {
    slug: "operacional",
    keywords: [
      "aluguel",
      "condominio",
      "condomínio",
      "energia",
      "agua",
      "água",
      "internet",
      "telefone",
      "manutencao",
      "manutenção",
      "limpeza",
      "seguranca",
      "segurança",
      "vigilancia",
      "vigilância",
      "material de escritorio",
      "escritório",
      "copa",
      "papel",
      "impressora",
      "combustivel",
      "combustível",
    ],
  },
  {
    slug: "fornecedores",
    keywords: [
      "fornecedor",
      "supplier",
      "compra",
      "produto",
      "estoque",
      "insumo",
      "materia prima",
      "matéria prima",
    ],
  },
  {
    slug: "financeiro",
    keywords: [
      "tarifa",
      "taxa",
      "juros",
      "iof",
      "emprestimo",
      "empréstimo",
      "financiamento",
      "cartao",
      "cartão",
      "anuidade",
      "banco",
      "ted",
      "pix ",
      "transferencia",
      "transferência",
      "tarifa bancaria",
      "tarifa bancária",
      "cobrança",
      "multa",
    ],
  },
  {
    slug: "impostos",
    keywords: [
      "imposto",
      "tributo",
      "simples nacional",
      "das ",
      "iss",
      "icms",
      "pis",
      "cofins",
      "irpj",
      "csll",
      "receita federal",
      "sefaz",
      "prefeitura",
      "darf",
      "gps",
      "guia",
    ],
  },
  {
    slug: "administrativo",
    keywords: [
      "contabil",
      "contábil",
      "contador",
      "contabilidade",
      "juridico",
      "jurídico",
      "advogado",
      "advocacia",
      "consultoria",
      "seguro",
      "cartorio",
      "cartório",
      "despesa administrativa",
    ],
  },
  {
    slug: "logistica",
    keywords: [
      "frete",
      "entrega",
      "correio",
      "logistica",
      "logística",
      "transportadora",
      "motoboy",
      "courrier",
      "sedex",
      "pac ",
    ],
  },
]

const SAAS_TOOLS: Record<string, string> = {
  slack: "communication",
  zoom: "communication",
  teams: "communication",
  discord: "communication",
  meet: "communication",
  notion: "project_management",
  trello: "project_management",
  asana: "project_management",
  monday: "project_management",
  clickup: "project_management",
  jira: "project_management",
  figma: "design",
  canva: "design",
  adobe: "design",
  illustrator: "design",
  photoshop: "design",
  dropbox: "storage",
  drive: "storage",
  onedrive: "storage",
  box: "storage",
  hubspot: "crm",
  pipedrive: "crm",
  salesforce: "crm",
  rdstation: "crm",
  mailchimp: "email_marketing",
  activecampaign: "email_marketing",
  sendgrid: "email_marketing",
  github: "development",
  gitlab: "development",
  vercel: "development",
  aws: "development",
  azure: "development",
  digitalocean: "development",
  heroku: "development",
  semrush: "seo",
  ahrefs: "seo",
  moz: "seo",
}

export function categorizeTransaction(description: string): string {
  const lower = description.toLowerCase()

  for (const rule of CATEGORY_RULES) {
    if (rule.keywords.some((keyword) => lower.includes(keyword))) {
      return rule.slug
    }
  }

  return "outros"
}

export function extractVendor(description: string): string {
  const vendor = description
    .replace(
      /^(pagamento|compra|transf|ted|pix|recebimento|debito|credito|boleto)\s*/i,
      ""
    )
    .replace(
      /\s*(s\.?a\.?|ltda\.?|eireli|me|epp|\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}).*$/i,
      ""
    )
    .replace(/\s+\d{2}\/\d{2}.*$/, "")
    .trim()

  return vendor
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ")
    .substring(0, 50)
}

export function getSaasCategory(description: string): string | null {
  const lower = description.toLowerCase()

  for (const [keyword, category] of Object.entries(SAAS_TOOLS)) {
    if (lower.includes(keyword)) return category
  }

  return null
}

export function detectRecurrence(
  transactions: Array<{
    id: string
    date: string
    description: string
    amount: number
  }>
): Array<{ id: string; isRecurring: boolean; recurrenceType?: string }> {
  const result: Array<{
    id: string
    isRecurring: boolean
    recurrenceType?: string
  }> = []

  const groups = new Map<string, typeof transactions>()

  for (const transaction of transactions) {
    const key = transaction.description
      .toLowerCase()
      .replace(/\s+\d{2}\/\d{2}|\d{4}/g, "")
      .trim()

    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)?.push(transaction)
  }

  const recurringIds = new Set<string>()

  for (const [, group] of groups) {
    if (group.length >= 2) {
      const amounts = group.map((transaction) => Math.abs(transaction.amount))
      const average =
        amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length

      const allSimilar = amounts.every(
        (amount) => Math.abs(amount - average) / average < 0.1
      )

      if (allSimilar) {
        group.forEach((transaction) => recurringIds.add(transaction.id))
      }
    }
  }

  for (const transaction of transactions) {
    result.push({
      id: transaction.id,
      isRecurring: recurringIds.has(transaction.id),
      recurrenceType: recurringIds.has(transaction.id) ? "monthly" : undefined,
    })
  }

  return result
}