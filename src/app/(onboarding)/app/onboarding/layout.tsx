import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export default async function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect("/login")
  }

  // Se já completou o onboarding, vai direto pro dashboard
  if (session.user.onboardingCompleted === true) {
    redirect("/app/dashboard")
  }

  return <>{children}</>
}
