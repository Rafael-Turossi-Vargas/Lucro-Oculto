import { Navbar } from "@/components/landing/Navbar"
import { Hero } from "@/components/landing/Hero"
import { NichesBar } from "@/components/landing/NichesBar"
import { ProblemSection } from "@/components/landing/ProblemSection"
import { HowItWorks } from "@/components/landing/HowItWorks"
import { FeaturesSection } from "@/components/landing/FeaturesSection"
import { PricingSection } from "@/components/landing/PricingSection"
import { SecuritySection } from "@/components/landing/SecuritySection"
import { FAQSection } from "@/components/landing/FAQSection"
import { Footer } from "@/components/landing/Footer"

export default function LandingPage() {
  return (
    <main style={{ background: "var(--bg-page)" }}>
      <Navbar />
      <Hero />
      <NichesBar />
      <ProblemSection />
      <HowItWorks />
      <FeaturesSection />
      <PricingSection />
      <SecuritySection />
      <FAQSection />
      <Footer />
    </main>
  )
}
