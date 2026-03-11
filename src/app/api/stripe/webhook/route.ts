import { NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { db } from "@/lib/db"
import Stripe from "stripe"

export const config = { api: { bodyParser: false } }

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get("stripe-signature")

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    return NextResponse.json({ error: "Webhook secret não configurado" }, { status: 500 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig!, webhookSecret)
  } catch (err) {
    console.error("Webhook signature verification failed:", err)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  try {
    // Idempotency: ignora eventos já processados
    const existing = await db.stripeEvent.findUnique({ where: { id: event.id } })
    if (existing) {
      return NextResponse.json({ received: true, duplicate: true })
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        const organizationId = session.metadata?.organizationId
        // Plano vem do metadata; fallback para "pro" por compatibilidade
        const newPlan = (session.metadata?.plan === "premium" ? "premium" : "pro")
        if (!organizationId) break

        await db.organization.update({
          where: { id: organizationId },
          data: {
            plan: newPlan,
            trialEndsAt: null,
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: session.subscription as string,
          },
        })
        break
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription
        const organizationId = subscription.metadata?.organizationId
        const subPlan = (subscription.metadata?.plan === "premium" ? "premium" : "pro")
        if (!organizationId) break

        if (subscription.status === "active" || subscription.status === "trialing") {
          await db.organization.update({
            where: { id: organizationId },
            data: { plan: subPlan, trialEndsAt: null },
          })
        } else if (subscription.status === "canceled" || subscription.status === "unpaid") {
          await db.organization.update({
            where: { id: organizationId },
            data: { plan: "free", trialEndsAt: null },
          })
        }
        break
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription
        const organizationId = subscription.metadata?.organizationId
        if (!organizationId) break

        await db.organization.update({
          where: { id: organizationId },
          data: { plan: "free", trialEndsAt: null },
        })
        break
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string
        if (!customerId) break

        await db.organization.updateMany({
          where: { stripeCustomerId: customerId },
          data: { plan: "free", trialEndsAt: null },
        })
        break
      }
    }

    // Marca evento como processado
    await db.stripeEvent.create({ data: { id: event.id, type: event.type } })

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook handler error:", error)
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 })
  }
}
