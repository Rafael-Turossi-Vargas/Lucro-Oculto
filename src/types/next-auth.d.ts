import "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      organizationId: string
      role: string
      plan: string
      onboardingCompleted: boolean
      trialEndsAt: string | null
      organizationName: string
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId?: string
    organizationId?: string
    organizationName?: string
    role?: string
    plan?: string
    onboardingCompleted?: boolean
    trialEndsAt?: string | null
    planRefreshedAt?: number
    roleRefreshedAt?: number
  }
}
