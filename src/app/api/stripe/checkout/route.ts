import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { stripe } from "@/lib/stripe"
import { db } from "@/lib/db"
import { can } from "@/lib/roles"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || !session?.user?.organizationId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    if (!can(session.user.role, "finance:manage")) {
      return NextResponse.json({ error: "Apenas o proprietário pode gerenciar pagamentos" }, { status: 403 })
    }

    const body = await req.json().catch(() => ({})) as { plan?: string }
    const targetPlan = (body.plan === "premium" ? "premium" : "pro") as "pro" | "premium"

    const org = await db.organization.findUnique({
      where: { id: session.user.organizationId },
      select: { plan: true, name: true, trialEndsAt: true },
    })

    const currentPlan = org?.plan ?? "free"
    const isTrial = currentPlan === "pro" && org?.trialEndsAt !== null

    // Bloqueia se já está no plano alvo (e não é trial)
    if (currentPlan === targetPlan && !isTrial) {
      return NextResponse.json({ error: `Você já está no plano ${targetPlan === "pro" ? "Pro" : "Premium"}` }, { status: 400 })
    }

    // Bloqueia downgrade de Premium para Pro via checkout
    if (currentPlan === "premium" && targetPlan === "pro") {
      return NextResponse.json({ error: "Para mudar de plano, acesse o portal de cobrança Stripe." }, { status: 400 })
    }

    const priceId = targetPlan === "premium"
      ? process.env.STRIPE_PREMIUM_PRICE_ID
      : process.env.STRIPE_PRO_PRICE_ID

    if (!priceId || priceId === "price_placeholder") {
      return NextResponse.json({ error: "Stripe não configurado" }, { status: 503 })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ""

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      billing_address_collection: "required",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/app/settings?upgraded=true`,
      cancel_url: `${appUrl}/app/settings#upgrade`,
      metadata: {
        organizationId: session.user.organizationId,
        userId: session.user.id,
        plan: targetPlan,
      },
      customer_email: session.user.email ?? undefined,
      subscription_data: {
        metadata: {
          organizationId: session.user.organizationId,
          plan: targetPlan,
        },
      },
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch (error) {
    console.error("Stripe checkout error:", error)
    return NextResponse.json({ error: "Erro ao criar sessão de pagamento" }, { status: 500 })
  }
}
