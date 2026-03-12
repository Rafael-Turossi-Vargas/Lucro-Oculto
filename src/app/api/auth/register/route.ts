import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { randomUUID } from "crypto"
import { z } from "zod"
import { db } from "@/lib/db"

type TxClient = Parameters<Parameters<typeof db.$transaction>[0]>[0]
import { sendWelcomeEmail, sendEmailVerificationEmail } from "@/lib/email/templates"
import { rateLimit } from "@/lib/rate-limit"
import { stripe } from "@/lib/stripe"

const schema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "Senha deve ter pelo menos 8 caracteres"),
  organizationName: z.string().min(2, "Nome da empresa obrigatório"),
  cnpj: z.string().length(14, "CNPJ inválido").refine((v) => /^\d+$/.test(v), "CNPJ deve conter apenas números"),
  plan: z.enum(["free", "pro", "premium"]).optional().default("free"),
})

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}

async function generateUniqueSlug(base: string): Promise<string> {
  const baseSlug = slugify(base) || "empresa"
  const MAX_ATTEMPTS = 100

  for (let attempt = 0; attempt <= MAX_ATTEMPTS; attempt++) {
    const suffix = attempt === 0 ? "" : `-${attempt}`
    const candidate = `${baseSlug}${suffix}`

    const existing = await db.organization.findUnique({ where: { slug: candidate } })
    if (!existing) return candidate
  }

  // Fallback: append random suffix to guarantee uniqueness
  return `${baseSlug}-${Date.now()}`
}

async function verifyCnpj(cnpj: string): Promise<boolean> {
  try {
    const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`, {
      signal: AbortSignal.timeout(8000),
    })
    // Se a API não respondeu, deixa passar (já foi validado no client)
    if (!res.ok) return true
    const data = await res.json() as { situacao_cadastral?: number | string; descricao_situacao_cadastral?: string }
    const descricao = (data.descricao_situacao_cadastral ?? "").toUpperCase()
    // Só bloqueia se confirmarmos explicitamente que está INATIVA/BAIXADA/SUSPENSA
    const inativo = ["INAPTA", "BAIXADA", "SUSPENSA", "NULA"].some(s => descricao.includes(s))
    return !inativo
  } catch {
    return true
  }
}

export async function POST(request: NextRequest) {
  try {
    // Rate limit: 5 cadastros por IP por hora
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
    const rl = rateLimit(`register:${ip}`, 5, 60 * 60 * 1000)
    if (!rl.success) {
      return NextResponse.json(
        { error: "Muitas tentativas. Tente novamente mais tarde." },
        { status: 429 }
      )
    }

    const body: unknown = await request.json()
    const result = schema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message ?? "Dados inválidos" },
        { status: 400 }
      )
    }

    const { name, email, password, organizationName, cnpj, plan } = result.data
    const normalizedEmail = email.toLowerCase().trim()

    // Verifica CNPJ na Receita Federal via BrasilAPI
    const cnpjValid = await verifyCnpj(cnpj)
    if (!cnpjValid) {
      return NextResponse.json(
        { error: "CNPJ não encontrado ou inativo na Receita Federal." },
        { status: 400 }
      )
    }

    // Verifica duplicidade de CNPJ
    const existingOrg = await db.organization.findUnique({ where: { cnpj } })
    if (existingOrg) {
      return NextResponse.json(
        { error: "Este CNPJ já possui uma conta cadastrada." },
        { status: 409 }
      )
    }

    const existingUser = await db.user.findUnique({
      where: { email: normalizedEmail },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Este email já está cadastrado" },
        { status: 409 }
      )
    }

    // Block self-registration if there's a pending invite for this email
    // Invited users must access the system via the invite link only
    const pendingInvite = await db.invite.findFirst({
      where: {
        email: normalizedEmail,
        acceptedAt: null,
        expiresAt: { gt: new Date() },
      },
    })
    if (pendingInvite) {
      return NextResponse.json(
        { error: "Este email recebeu um convite de acesso. Verifique sua caixa de entrada e use o link do convite para acessar o sistema." },
        { status: 403 }
      )
    }

    const passwordHash = await bcrypt.hash(password, 12)
    const slug = await generateUniqueSlug(organizationName)

    // Contas sempre criadas como free — upgrade via Stripe
    const { organization } = await db.$transaction(async (tx: TxClient) => {
      const user = await tx.user.create({
        data: {
          name,
          email: normalizedEmail,
          passwordHash,
        },
      })

      const organization = await tx.organization.create({
        data: {
          name: organizationName,
          slug,
          cnpj,
          plan: "free",
          trialEndsAt: null,
        },
      })

      await tx.membership.create({
        data: {
          userId: user.id,
          organizationId: organization.id,
          role: "owner",
        },
      })

      await tx.onboardingProfile.create({
        data: {
          organizationId: organization.id,
          financialTools: [],
          mainPainPoints: [],
          completed: false,
        },
      })

      return { organization }
    })

    // Cria token de verificação de email (expira em 24h)
    const verificationToken = randomUUID()
    await db.verificationToken.create({
      data: {
        identifier: normalizedEmail,
        token: verificationToken,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    })

    // Envia email de verificação (fire-and-forget)
    sendEmailVerificationEmail(normalizedEmail, name, verificationToken).catch(err =>
      console.error("Failed to send verification email:", err)
    )

    // Envia email de boas-vindas (fire-and-forget)
    sendWelcomeEmail(normalizedEmail, name).catch(err =>
      console.error("Failed to send welcome email:", err)
    )

    // Se escolheu Pro ou Premium: cria sessão Stripe com trial de 7 dias
    if (plan === "pro" || plan === "premium") {
      const priceId = plan === "premium"
        ? process.env.STRIPE_PREMIUM_PRICE_ID
        : process.env.STRIPE_PRO_PRICE_ID
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ""
      const isPlaceholder = !priceId || priceId === "price_placeholder" || priceId === "price_premium_placeholder"

      if (!isPlaceholder && appUrl) {
        try {
          const checkoutSession = await stripe.checkout.sessions.create({
            mode: "subscription",
            payment_method_types: ["card"],
            line_items: [{ price: priceId, quantity: 1 }],
            subscription_data: {
              trial_period_days: 7,
              metadata: { organizationId: organization.id, plan },
            },
            metadata: { organizationId: organization.id, plan },
            customer_email: normalizedEmail,
            success_url: `${appUrl}/login?registered=true&trial=${plan}`,
            cancel_url: `${appUrl}/register?plan=free`,
          })

          return NextResponse.json(
            { message: "Conta criada com sucesso", checkoutUrl: checkoutSession.url, requiresEmailVerification: true },
            { status: 201 }
          )
        } catch (stripeErr) {
          console.error("Stripe trial checkout error:", stripeErr)
          // Se Stripe falhar, cria conta free normalmente
        }
      }
    }

    return NextResponse.json(
      { message: "Conta criada com sucesso", requiresEmailVerification: true },
      { status: 201 }
    )
  } catch (error) {
    console.error("Register error:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
