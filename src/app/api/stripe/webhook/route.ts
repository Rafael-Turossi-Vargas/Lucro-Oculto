import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { stripe } from "@/lib/stripe"
import { db } from "@/lib/db"

export const runtime = "nodejs"

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get("stripe-signature")

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    return NextResponse.json(
      { error: "Webhook secret não configurado" },
      { status: 500 }
    )
  }

  if (!sig) {
    return NextResponse.json(
      { error: "Stripe signature ausente" },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (error) {
    console.error("Webhook signature verification failed:", error)
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    )
  }

  try {
    // Save event BEFORE processing for idempotency — if this throws a unique violation
    // the event was already processed on a previous delivery, so return early.
    try {
      await db.stripeEvent.create({ data: { id: event.id, type: event.type } })
    } catch {
      // Unique constraint violation = duplicate event
      return NextResponse.json({ received: true, duplicate: true })
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        const organizationId = session.metadata?.organizationId
        const newPlan = session.metadata?.plan === "premium" ? "premium" : "pro"

        if (!organizationId) break

        await db.organization.update({
          where: { id: organizationId },
          data: {
            plan: newPlan,
            trialEndsAt: null,
            stripeCustomerId:
              typeof session.customer === "string" ? session.customer : null,
            stripeSubscriptionId:
              typeof session.subscription === "string"
                ? session.subscription
                : null,
          },
        })
        break
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription
        const organizationId = subscription.metadata?.organizationId
        const subPlan =
          subscription.metadata?.plan === "premium" ? "premium" : "pro"

        if (!organizationId) break

        if (
          subscription.status === "active" ||
          subscription.status === "trialing"
        ) {
          await db.organization.update({
            where: { id: organizationId },
            data: {
              plan: subPlan,
              trialEndsAt: null,
            },
          })
        } else if (
          subscription.status === "canceled" ||
          subscription.status === "unpaid"
        ) {
          await db.organization.update({
            where: { id: organizationId },
            data: {
              plan: "free",
              trialEndsAt: null,
            },
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
          data: {
            plan: "free",
            trialEndsAt: null,
          },
        })
        break
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice
        const customerId =
          typeof invoice.customer === "string" ? invoice.customer : null

        if (!customerId) break

        await db.organization.updateMany({
          where: { stripeCustomerId: customerId },
          data: {
            plan: "free",
            trialEndsAt: null,
          },
        })
        break
      }

      default:
        break
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook handler error:", error)
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    )
  }
}