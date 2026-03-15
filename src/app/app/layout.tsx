import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Sidebar } from "@/components/layout/Sidebar"
import { SessionProvider } from "@/components/layout/SessionProvider"
import { ToastProvider } from "@/components/ui/toast-provider"
import { TrialBanner } from "@/components/ui/trial-banner"
import { NpsModal } from "@/components/ui/nps-modal"
import { Breadcrumb } from "@/components/ui/breadcrumb"
import { ErrorBoundary } from "@/components/ui/error-boundary"

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect("/login")
  }

  // Redireciona para onboarding se ainda não completou
  if (session.user.onboardingCompleted === false) {
    redirect("/app/onboarding")
  }

  return (
    <SessionProvider session={session}>
      <ToastProvider>
        <div className="flex h-screen overflow-hidden" style={{ background: "var(--bg-page)" }}>
          <Sidebar />
          <main className="flex-1 overflow-y-auto pt-[52px] lg:pt-0">
            <TrialBanner />
            <div className="px-6 pt-6">
              <Breadcrumb />
            </div>
            <ErrorBoundary>{children}</ErrorBoundary>
            <NpsModal />
          </main>
        </div>
      </ToastProvider>
    </SessionProvider>
  )
}
