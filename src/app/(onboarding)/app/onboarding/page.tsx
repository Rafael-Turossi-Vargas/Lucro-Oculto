import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard"

export default function OnboardingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12" style={{ background: "var(--bg-page)" }}>
      <div className="w-full max-w-xl mb-8 text-center">
        <h1 className="text-3xl font-black mb-2" style={{ color: "var(--text-primary)" }}>
          Vamos personalizar sua análise
        </h1>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Algumas perguntas rápidas para calibrar os benchmarks do seu segmento.
        </p>
      </div>
      <div className="w-full max-w-xl">
        <OnboardingWizard />
      </div>
    </div>
  )
}
