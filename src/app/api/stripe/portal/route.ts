import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { stripe } from "@/lib/stripe"
import { db } from "@/lib/db"
import { can } from "@/lib/roles"

export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    if (!can(session.user.role, "finance:manage")) {
      return NextResponse.json({ error: "Apenas o proprietário pode gerenciar a assinatura" }, { status: 403 })
    }

    const org = await db.organization.findUnique({
      where: { id: session.user.organizationId },
      select: { stripeCustomerId: true },
    })

    if (!org?.stripeCustomerId) {
      return NextResponse.json({ error: "Nenhuma assinatura Stripe encontrada" }, { status: 404 })
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: org.stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXTAUTH_URL}/app/settings?tab=plan`,
    })

    return NextResponse.json({ url: portalSession.url })
  } catch (err) {
    console.error("Stripe portal error:", err)
    return NextResponse.json({ error: "Erro ao criar sessão do portal" }, { status: 500 })
  }
}
