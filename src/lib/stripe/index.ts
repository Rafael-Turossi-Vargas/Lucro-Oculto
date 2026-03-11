import Stripe from "stripe"

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY não está definida")
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2026-02-25.clover",
})

export const PLANS = {
  free: {
    name: "Grátis",
    price: 0,
    analysesPerMonth: 1,
    maxTransactions: 200,
  },
  pro: {
    name: "Pro",
    price: 97,
    priceId: process.env.STRIPE_PRO_PRICE_ID ?? "",
    analysesPerMonth: Infinity,
    maxTransactions: 10000,
  },
} as const
