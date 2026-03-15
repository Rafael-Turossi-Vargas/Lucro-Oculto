import type { AuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { db } from "./db"
import { rateLimit } from "./rate-limit"
import { logAudit } from "./audit"

// Valida NEXTAUTH_SECRET em produção para evitar uso de segredos fracos
if (process.env.NODE_ENV === "production") {
  const secret = process.env.NEXTAUTH_SECRET ?? ""
  const FORBIDDEN = [
    "dev-secret",
    "change-in-production",
    "dev-secret-change-in-production-32chars", // valor padrão exato do .env de desenvolvimento
    "secret",
    "changeme",
  ]
  if (secret.length < 32 || FORBIDDEN.some((f) => secret.toLowerCase().includes(f))) {
    throw new Error("[auth] NEXTAUTH_SECRET inválido para produção. Gere um com: openssl rand -base64 32")
  }
}

export const authOptions: AuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const emailKey = credentials.email.toLowerCase().trim()

        // Rate limit: 5 tentativas por email a cada 15 minutos (brute force protection)
        const rl = await rateLimit(`login:${emailKey}`, 5, 15 * 60 * 1000)
        if (!rl.success) {
          void logAudit({ action: "login.blocked", status: "failure", metadata: { email: emailKey } })
          throw new Error("TOO_MANY_ATTEMPTS")
        }

        let user
        try {
          user = await db.user.findUnique({
            where: { email: emailKey },
            select: {
              id: true,
              email: true,
              name: true,
              passwordHash: true,
              emailVerified: true,
            },
          })
        } catch (e) {
          console.error("[auth] DB error finding user:", e)
          return null
        }

        if (process.env.NODE_ENV === "development") {
          console.log("[auth] user found:", !!user, "has hash:", !!user?.passwordHash)
        }

        if (!user || !user.passwordHash) {
          void logAudit({ action: "login.failure", status: "failure", metadata: { email: emailKey, reason: "user_not_found" } })
          return null
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        )

        if (process.env.NODE_ENV === "development") {
          console.log("[auth] password valid:", isValid, "emailVerified:", !!user.emailVerified)
        }

        if (!isValid) {
          void logAudit({ action: "login.failure", status: "failure", userId: user.id, metadata: { reason: "wrong_password" } })
          return null
        }

        // Bloqueia login se email ainda não foi verificado.
        // Usuários antigos (sem token pendente) são liberados automaticamente.
        if (!user.emailVerified) {
          // Only block if there's a still-valid (non-expired) token
          const pendingToken = await db.verificationToken.findFirst({
            where: { identifier: user.email, expires: { gt: new Date() } },
          })
          if (pendingToken) {
            void logAudit({ action: "login.blocked", status: "failure", userId: user.id, metadata: { reason: "email_not_verified" } })
            throw new Error("EMAIL_NOT_VERIFIED")
          }
          // Token expired or doesn't exist — mark as verified automatically
          await db.user.update({ where: { id: user.id }, data: { emailVerified: new Date() } })
        }

        void logAudit({ action: "login.success", status: "success", userId: user.id })

        return {
          id: user.id,
          email: user.email,
          name: user.name ?? "",
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session: sessionUpdate }) {
      // Handle session.update() calls (e.g. org switch)
      if (trigger === "update" && sessionUpdate?.organizationId) {
        const membership = await db.membership.findFirst({
          where: { userId: token.userId as string, organizationId: sessionUpdate.organizationId },
          include: { organization: true },
        })
        if (membership) {
          // Persist preference
          await db.user.update({
            where: { id: token.userId as string },
            data: { preferredOrganizationId: sessionUpdate.organizationId },
          })
          token.organizationId = membership.organizationId
          token.organizationName = membership.organization.name
          token.role = membership.role
          token.plan = membership.organization.plan
          token.trialEndsAt = membership.organization.trialEndsAt?.toISOString() ?? null
          const onboarding = await db.onboardingProfile.findUnique({
            where: { organizationId: membership.organizationId },
            select: { completed: true },
          })
          token.onboardingCompleted = onboarding?.completed ?? false
          token.planRefreshedAt = Date.now()
        }
        return token
      }

      if (user) {
        token.userId = user.id

        // Check user's preferred org
        const dbUser = await db.user.findUnique({
          where: { id: user.id },
          select: { preferredOrganizationId: true },
        })

        const preferredOrgId = dbUser?.preferredOrganizationId

        const membership = await db.membership.findFirst({
          where: preferredOrgId
            ? { userId: user.id, organizationId: preferredOrgId }
            : { userId: user.id },
          include: { organization: true },
          orderBy: { createdAt: "asc" },
        }) ?? await db.membership.findFirst({
          where: { userId: user.id },
          include: { organization: true },
          orderBy: { createdAt: "asc" },
        })

        if (membership) {
          token.organizationId = membership.organizationId
          token.organizationName = membership.organization.name
          token.role = membership.role
          token.plan = membership.organization.plan
          token.trialEndsAt = membership.organization.trialEndsAt?.toISOString() ?? null

          const onboarding = await db.onboardingProfile.findUnique({
            where: { organizationId: membership.organizationId },
            select: { completed: true },
          })

          token.onboardingCompleted = onboarding?.completed ?? false
        }
      } else if (token.organizationId) {
        // Re-busca onboarding enquanto não concluído
        if (token.onboardingCompleted === false) {
          const onboarding = await db.onboardingProfile.findUnique({
            where: { organizationId: token.organizationId as string },
            select: { completed: true },
          })
          token.onboardingCompleted = onboarding?.completed ?? false
        }

        // Re-busca role a cada 5 minutos — reduz carga no DB sem sacrificar responsividade
        const lastRoleRefresh = token.roleRefreshedAt as number | undefined
        const fiveMin = 5 * 60 * 1000
        if (!lastRoleRefresh || Date.now() - lastRoleRefresh > fiveMin) {
          const membership = await db.membership.findUnique({
            where: {
              userId_organizationId: {
                userId: token.userId as string,
                organizationId: token.organizationId as string,
              },
            },
            select: { role: true },
          })
          if (membership) {
            token.role = membership.role
          }
          token.roleRefreshedAt = Date.now()
        }

        // Re-busca plano do banco a cada 5 minutos para refletir upgrades via Stripe
        const lastRefresh = token.planRefreshedAt as number | undefined
        if (!lastRefresh || Date.now() - lastRefresh > fiveMin) {
          const org = await db.organization.findUnique({
            where: { id: token.organizationId as string },
            select: { plan: true, trialEndsAt: true },
          })
          if (org) {
            // Expira trial automaticamente
            if (org.plan === "pro" && org.trialEndsAt && org.trialEndsAt < new Date()) {
              await db.organization.update({
                where: { id: token.organizationId as string },
                data: { plan: "free", trialEndsAt: null },
              })
              token.plan = "free"
              token.trialEndsAt = null
            } else {
              token.plan = org.plan
              token.trialEndsAt = org.trialEndsAt?.toISOString() ?? null
            }
          }
          token.planRefreshedAt = Date.now()
        }
      }

      return token
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.userId as string
        session.user.organizationId = token.organizationId as string
        session.user.organizationName = (token.organizationName as string) ?? ""
        session.user.role = token.role as string
        session.user.plan = token.plan as string
        session.user.onboardingCompleted = token.onboardingCompleted as boolean
        session.user.trialEndsAt = (token.trialEndsAt as string | null) ?? null
      }

      return session
    },
  },
}