import { NextResponse } from "next/server"
import { randomBytes } from "crypto"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { z } from "zod"
import { can } from "@/lib/roles"
import { logAudit } from "@/lib/audit"

const MAX_ORGS = 3
const COOLDOWN_HOURS = 72

// GET /api/app/organizations — List active orgs the user belongs to
export async function GET() {
  try {
  const session = await getServerSession(authOptions)
  if (!session?.user?.organizationId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const userId = session.user.id

  const [memberships, dbUser] = await Promise.all([
    db.membership.findMany({
      where: {
        userId,
        organization: { deletedAt: null },
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
            plan: true,
            cnpj: true,
            niche: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    }),
    db.user.findUnique({
      where: { id: userId },
      select: { orgCooldownUntil: true },
    }),
  ])

  const currentOrgId = (session.user as { organizationId?: string }).organizationId
  const cooldownUntil = dbUser?.orgCooldownUntil ?? null
  const cooldownActive = cooldownUntil ? cooldownUntil > new Date() : false

  return NextResponse.json({
    memberships,
    currentOrgId,
    maxOrgs: MAX_ORGS,
    cooldownUntil: cooldownActive ? cooldownUntil?.toISOString() : null,
    cooldownHours: COOLDOWN_HOURS,
  })
  } catch (err) {
    console.error("[GET /api/app/organizations]", err)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

// POST /api/app/organizations — Create a new company (Premium only, max 3)
export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.organizationId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const userId = session.user.id
  const plan = session.user.plan
  const currentOrgId = session.user.organizationId

  if (plan !== "premium" && plan !== "admin") {
    return NextResponse.json({ error: "Plano Premium necessário" }, { status: 403 })
  }

  if (!can(session.user.role, "companies:manage")) {
    return NextResponse.json({ error: "Apenas o proprietário pode criar empresas" }, { status: 403 })
  }

  const dbUser = await db.user.findUnique({
    where: { id: userId },
    select: { orgCooldownUntil: true },
  })

  // Bloqueia criação se cooldown ativo
  if (dbUser?.orgCooldownUntil && dbUser.orgCooldownUntil > new Date()) {
    const msLeft = dbUser.orgCooldownUntil.getTime() - Date.now()
    const hoursLeft = Math.ceil(msLeft / (1000 * 60 * 60))
    return NextResponse.json({
      error: `Você excluiu uma empresa estando no limite. Aguarde ${hoursLeft}h para cadastrar uma nova.`,
      cooldownUntil: dbUser.orgCooldownUntil.toISOString(),
    }, { status: 429 })
  }

  // Conta orgs ativas que o usuário é dono
  const ownedActiveCount = await db.membership.count({
    where: {
      userId,
      role: "owner",
      organization: { deletedAt: null },
    },
  })
  if (ownedActiveCount >= MAX_ORGS) {
    return NextResponse.json({ error: `Limite de ${MAX_ORGS} empresas atingido` }, { status: 400 })
  }

  const body = await req.json().catch(() => ({}))
  const parsed = z.object({
    name: z.string().min(2).max(100),
    cnpj: z.string().optional(),
    niche: z.string().optional(),
  }).safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos", details: parsed.error.flatten() }, { status: 400 })
  }

  const { name, cnpj, niche } = parsed.data

  // Herda plano da org atual
  const currentOrg = await db.organization.findUnique({
    where: { id: currentOrgId },
    select: { plan: true },
  })

  // Gera slug único: tenta slug limpo primeiro, se colidir adiciona sufixo aleatório (max 2 queries)
  const baseSlug = (name.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "")) || "empresa"
  let slug = baseSlug
  const slugExists = await db.organization.findUnique({ where: { slug } })
  if (slugExists) {
    slug = `${baseSlug}-${randomBytes(3).toString("hex")}` // ex: minha-empresa-a3f2c1
  }

  const newOrg = await db.organization.create({
    data: {
      name,
      slug,
      cnpj: cnpj || null,
      niche: niche || null,
      plan: currentOrg?.plan ?? "premium",
      memberships: {
        create: { userId, role: "owner" },
      },
    },
  })

  void logAudit({ action: "org.created", status: "success", userId, organizationId: newOrg.id, metadata: { name: newOrg.name } })

  return NextResponse.json({ success: true, organization: newOrg })
}
