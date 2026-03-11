/**
 * Lucro Oculto — Seed do banco de dados
 *
 * Cria o usuário admin com plano "admin" e dados de amostra para testar todas as funcionalidades.
 *
 * Uso:
 *   npx prisma db seed
 *
 * Credenciais (configuráveis via .env):
 *   ADMIN_EMAIL    → padrão: admin@lucro-oculto.com
 *   ADMIN_PASSWORD → padrão: Admin@2025!
 */

import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"
import "dotenv/config"
import bcrypt from "bcryptjs"

const pool = new Pool({ connectionString: process.env.DATABASE_URL! })
const adapter = new PrismaPg(pool)
const db = new PrismaClient({ adapter })

// ─── Configuração ──────────────────────────────────────────────────────────────

const ADMIN_EMAIL    = process.env.ADMIN_EMAIL    ?? "admin@lucro-oculto.com"
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "Admin@2025!"
const ADMIN_NAME     = "Admin Sistema"
const ORG_NAME       = "Lucro Oculto (Demo)"
const ORG_SLUG       = "lucro-oculto-admin"

// ─── Dados de amostra ──────────────────────────────────────────────────────────

const SAMPLE_LEAKS = [
  {
    type: "leak", title: "Assinatura possivelmente subutilizada",
    description: '"Notion Pro" apareceu poucas vezes e pode não estar sendo usada.',
    impact: "high", amount: 420, category: "ferramentas_software",
    metadata: { type: "subscription" },
  },
  {
    type: "leak", title: "Ferramentas sobrepostas: email marketing",
    description: "Você paga por 3 ferramentas com funções similares de email marketing. Total: R$890/mês.",
    impact: "high", amount: 890, category: "ferramentas_software",
    metadata: { type: "overlap" },
  },
  {
    type: "leak", title: "Crescimento anormal em Marketing",
    description: "Gastos com Marketing cresceram 73% no segundo período da análise. Custo extra estimado: R$1.240/mês.",
    impact: "high", amount: 1240, category: "marketing",
    metadata: { type: "anomaly" },
  },
  {
    type: "leak", title: "Pagamento duplicado detectado",
    description: '"Aluguel Escritório" foi pago mais de uma vez no mesmo período. Valor duplicado: R$3.800.',
    impact: "high", amount: 3800, category: "operacional",
    metadata: { type: "duplicate" },
  },
  {
    type: "leak", title: "Concentração excessiva em Pessoal",
    description: "68% de todas as despesas estão concentradas em Pessoal. Alta dependência aumenta o risco financeiro.",
    impact: "medium", amount: 8900, category: "pessoal",
    metadata: { type: "concentration" },
  },
  {
    type: "leak", title: "Assinatura não utilizada: Adobe Creative Cloud",
    description: '"Adobe Creative Cloud" apareceu 1 vez em 3 meses — possivelmente inativa.',
    impact: "medium", amount: 310, category: "ferramentas_software",
    metadata: { type: "subscription" },
  },
]

const SAMPLE_OPPORTUNITIES = [
  {
    type: "opportunity", title: "Cancelar Notion Pro — migrar para plano Free",
    description: "O plano Free do Notion cobre o uso identificado. Cancelamento imediato gera economia certa.",
    impact: "high", amount: 420, category: "ferramentas_software",
    metadata: { action: "Acesse notion.so > Settings > Plans e faça downgrade para Free.", difficulty: "easy" },
  },
  {
    type: "opportunity", title: "Consolidar ferramentas de email marketing",
    description: "Unifique em uma só plataforma e elimine as demais. Economia estimada em 50% do gasto atual.",
    impact: "high", amount: 445, category: "ferramentas_software",
    metadata: { action: "Avalie qual ferramenta tem mais valor e cancele as demais em 30 dias.", difficulty: "medium" },
  },
  {
    type: "opportunity", title: "Renegociar contrato de Aluguel",
    description: "Com o mercado atual, há margem para redução de 15-20% no valor do aluguel.",
    impact: "high", amount: 760, category: "operacional",
    metadata: { action: "Agende reunião com o proprietário e apresente comparativos de mercado.", difficulty: "medium" },
  },
  {
    type: "opportunity", title: "Cancelar Adobe Creative Cloud",
    description: "Uso identificado em apenas 1 transação em 3 meses — retorno sobre investimento muito baixo.",
    impact: "medium", amount: 310, category: "ferramentas_software",
    metadata: { action: "Acesse account.adobe.com > Plans e cancele a assinatura.", difficulty: "easy" },
  },
  {
    type: "opportunity", title: "Negociar com principal fornecedor de Marketing",
    description: "Alta concentração de gastos justifica renegociação de condições com desconto de 10-15%.",
    impact: "medium", amount: 620, category: "marketing",
    metadata: { action: "Agende reunião de renegociação com dados de volume como argumento.", difficulty: "hard" },
  },
]

const SAMPLE_ALERTS = [
  {
    type: "duplicate_payment", severity: "critical",
    title: "Pagamento duplicado confirmado",
    message: 'Detectamos pagamentos iguais de R$3.800 para "Aluguel Escritório" em datas próximas (dias 3 e 5). Verifique se foi pago em dobro e solicite estorno imediato.',
    amount: 3800,
  },
  {
    type: "cash_pressure", severity: "critical",
    title: "Risco de pressão no caixa",
    message: "Com base no padrão atual de receitas e despesas, seu caixa pode entrar em pressão em aproximadamente 45 dias. Revise as despesas imediatamente.",
    amount: 12400,
  },
  {
    type: "cost_spike", severity: "warning",
    title: "Custo com Marketing cresceu 73%",
    message: "Seus gastos com Marketing aumentaram 73% em relação ao período anterior. Isso representa um custo extra de R$1.240/mês. Verifique se há retorno mensurável.",
    amount: 1240,
  },
  {
    type: "subscription_overlap", severity: "warning",
    title: "Ferramentas com funções sobrepostas detectadas",
    message: 'Você paga por 3 ferramentas de "email marketing" simultaneamente. Isso gera R$890/mês de custo desnecessário. Consolide em uma só.',
    amount: 890,
  },
  {
    type: "vendor_concentration", severity: "warning",
    title: 'Alta dependência do fornecedor "Google Ads"',
    message: "42% das suas despesas de marketing vão para um único fornecedor. Isso representa risco de concentração e oportunidade de negociação.",
    amount: 6200,
  },
]

const SAMPLE_RECOMMENDATIONS = [
  {
    title: "Estornar pagamento duplicado do Aluguel",
    description: "Confirmar a duplicata de pagamento do aluguel do escritório e solicitar estorno imediato.",
    rationale: "R$3.800 pagos a mais podem ser recuperados imediatamente com uma solicitação bancária simples.",
    impact: "high", urgency: "immediate", difficulty: "easy",
    savingsEstimate: 3800, category: "financeiro", priority: 1,
  },
  {
    title: "Cancelar assinaturas subutilizadas (Notion + Adobe)",
    description: "Cancelar Notion Pro e Adobe Creative Cloud que apresentam uso mínimo ou inexistente.",
    rationale: "Economia certa de R$730/mês sem impacto operacional identificado.",
    impact: "high", urgency: "immediate", difficulty: "easy",
    savingsEstimate: 730, category: "ferramentas_software", priority: 2,
  },
  {
    title: "Consolidar ferramentas de email marketing",
    description: "Escolher uma única plataforma de email marketing e cancelar as outras duas.",
    rationale: "Três ferramentas com a mesma função geram desperdício de R$890/mês.",
    impact: "high", urgency: "soon", difficulty: "medium",
    savingsEstimate: 445, category: "ferramentas_software", priority: 3,
  },
  {
    title: "Renegociar aluguel do escritório",
    description: "Agendar reunião com o proprietário para renegociar o contrato com base em comparativos de mercado.",
    rationale: "Mercado atual favorece redução de 15-20% para contratos longos. Potencial de R$570-760/mês.",
    impact: "high", urgency: "soon", difficulty: "medium",
    savingsEstimate: 665, category: "operacional", priority: 4,
  },
  {
    title: "Revisar e otimizar investimento em Marketing",
    description: "Auditar o retorno dos canais de marketing e eliminar os de baixo desempenho.",
    rationale: "Crescimento de 73% no custo de marketing sem crescimento equivalente em receita é sinal de ineficiência.",
    impact: "high", urgency: "soon", difficulty: "hard",
    savingsEstimate: 1240, category: "marketing", priority: 5,
  },
  {
    title: "Diversificar fornecedores de marketing digital",
    description: "Reduzir dependência do Google Ads testando canais alternativos com orçamento controlado.",
    rationale: "Alta concentração em um único canal aumenta risco e reduz poder de negociação.",
    impact: "medium", urgency: "monitor", difficulty: "hard",
    savingsEstimate: 620, category: "marketing", priority: 6,
  },
]

// ─── Execução ──────────────────────────────────────────────────────────────────

async function main() {
  console.log("🌱 Iniciando seed do banco de dados...\n")

  // 1. Criar ou atualizar usuário admin
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12)

  const user = await db.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: { name: ADMIN_NAME, passwordHash },
    create: { email: ADMIN_EMAIL, name: ADMIN_NAME, passwordHash },
  })

  console.log(`✅ Usuário admin: ${user.email}`)

  // 2. Criar ou atualizar organização admin
  const org = await db.organization.upsert({
    where: { slug: ORG_SLUG },
    update: { name: ORG_NAME, plan: "admin", niche: "Tecnologia / SaaS" },
    create: {
      name: ORG_NAME,
      slug: ORG_SLUG,
      plan: "admin",
      niche: "Tecnologia / SaaS",
      monthlyRevenue: 85000,
      employeeCount: 12,
    },
  })

  console.log(`✅ Organização: ${org.name} (plano: ${org.plan})`)

  // 3. Garantir membership
  await db.membership.upsert({
    where: { userId_organizationId: { userId: user.id, organizationId: org.id } },
    update: {},
    create: { userId: user.id, organizationId: org.id, role: "owner" },
  })

  console.log("✅ Membership: owner")

  // 4. Marcar onboarding como concluído
  await db.onboardingProfile.upsert({
    where: { organizationId: org.id },
    update: { completed: true, completedAt: new Date() },
    create: {
      organizationId: org.id,
      businessType: "company",
      niche: "Tecnologia / SaaS",
      monthlyRevenueRange: "50000-100000",
      employeeCountRange: "10-20",
      financialTools: ["planilha", "sistema_proprio"],
      mainPainPoints: ["despesas_descontroladas", "falta_visibilidade"],
      primaryGoal: "reduzir_custos",
      currentControl: "parcial",
      completed: true,
      completedAt: new Date(),
    },
  })

  console.log("✅ Onboarding: concluído")

  // 5. Criar upload e análise de amostra (se ainda não existir)
  const existingAnalysis = await db.analysis.findFirst({
    where: { organizationId: org.id, status: "done" },
  })

  if (!existingAnalysis) {
    const periodStart = new Date("2025-10-01")
    const periodEnd   = new Date("2025-12-31")

    const upload = await db.upload.create({
      data: {
        organizationId: org.id,
        userId: user.id,
        fileName: "extrato-demo-q4-2025.csv",
        fileUrl: "local://demo",
        fileSize: 48200,
        fileType: "csv",
        status: "done",
        rowsCount: 312,
        periodStart,
        periodEnd,
      },
    })

    const analysis = await db.analysis.create({
      data: {
        organizationId: org.id,
        uploadId: upload.id,
        status: "done",
        periodStart,
        periodEnd,
        totalIncome:   112500,
        totalExpenses:  89340,
        netResult:      23160,
        score:              58,
        savingsMin:       3420,
        savingsMax:       8200,
        completedAt: new Date(),
        summary: {
          categoryBreakdown: [
            { category: "pessoal",              amount: 48000, percentage: 54 },
            { category: "marketing",             amount: 16900, percentage: 19 },
            { category: "operacional",           amount: 10200, percentage: 11 },
            { category: "ferramentas_software",  amount:  8340, percentage:  9 },
            { category: "financeiro",            amount:  3900, percentage:  4 },
            { category: "outros",                amount:  2000, percentage:  3 },
          ],
          topVendors: [
            { vendor: "Google Ads",           amount: 6200, count: 3 },
            { vendor: "Aluguel Escritório",    amount: 3800, count: 2 },
            { vendor: "AWS",                   amount: 2800, count: 12 },
            { vendor: "Folha de Pagamento",    amount: 48000, count: 1 },
            { vendor: "Meta Ads",              amount: 4100, count: 3 },
          ],
          monthlyTrend: [
            { month: "Out/25", income: 36200, expenses: 28400 },
            { month: "Nov/25", income: 38100, expenses: 30600 },
            { month: "Dez/25", income: 38200, expenses: 30340 },
          ],
        },
      },
    })

    // Criar insights (leaks + opportunities)
    await db.insight.createMany({
      data: SAMPLE_LEAKS.map((l) => ({
        analysisId: analysis.id,
        type:        l.type,
        category:    l.category,
        title:       l.title,
        description: l.description,
        impact:      l.impact,
        amount:      l.amount,
        metadata:    l.metadata,
      })),
    })

    await db.insight.createMany({
      data: SAMPLE_OPPORTUNITIES.map((o) => ({
        analysisId:  analysis.id,
        type:        o.type,
        category:    o.category,
        title:       o.title,
        description: o.description,
        impact:      o.impact,
        amount:      o.amount,
        metadata:    o.metadata,
      })),
    })

    // Criar alertas
    await db.alert.createMany({
      data: SAMPLE_ALERTS.map((a) => ({
        organizationId: org.id,
        analysisId:     analysis.id,
        type:           a.type,
        severity:       a.severity,
        title:          a.title,
        message:        a.message,
        amount:         a.amount,
      })),
    })

    // Criar recomendações
    await db.recommendation.createMany({
      data: SAMPLE_RECOMMENDATIONS.map((r) => ({
        organizationId:  org.id,
        analysisId:      analysis.id,
        title:           r.title,
        description:     r.description,
        rationale:       r.rationale,
        impact:          r.impact,
        urgency:         r.urgency,
        difficulty:      r.difficulty,
        savingsEstimate: r.savingsEstimate,
        category:        r.category,
        priority:        r.priority,
      })),
    })

    // Criar score snapshot
    await db.scoreSnapshot.create({
      data: {
        organizationId: org.id,
        analysisId: analysis.id,
        score: 58,
        subscores: {
          cashFlow:      72,
          subscriptions: 38,
          concentration: 55,
          duplicates:    40,
          anomalies:     65,
        },
      },
    })

    console.log(`✅ Análise demo criada (score: 58 | ${SAMPLE_LEAKS.length} leaks | ${SAMPLE_OPPORTUNITIES.length} oportunidades | ${SAMPLE_ALERTS.length} alertas | ${SAMPLE_RECOMMENDATIONS.length} ações)`)
  } else {
    console.log("ℹ️  Análise demo já existe — pulando criação")
  }

  // ─── Resumo ─────────────────────────────────────────────────────────────────

  console.log("\n" + "─".repeat(50))
  console.log("🎉 Seed concluído com sucesso!\n")
  console.log("  📧 Email   :", ADMIN_EMAIL)
  console.log("  🔑 Senha   :", ADMIN_PASSWORD)
  console.log("  🏷️  Plano   : admin (sem limites)")
  console.log("  🏢 Org     :", ORG_NAME)
  console.log("\n  ⚠️  Troque a senha em produção via Settings > Segurança")
  console.log("─".repeat(50) + "\n")
}

main()
  .catch((e) => {
    console.error("❌ Erro no seed:", e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
