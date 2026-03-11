import { Navbar } from "@/components/landing/Navbar"
import { Hero } from "@/components/landing/Hero"
import { NichesBar } from "@/components/landing/NichesBar"
import { ProblemSection } from "@/components/landing/ProblemSection"
import { HowItWorks } from "@/components/landing/HowItWorks"
import { FeaturesSection } from "@/components/landing/FeaturesSection"
import { TestimonialsSection } from "@/components/landing/TestimonialsSection"
import { PricingSection } from "@/components/landing/PricingSection"
import { SecuritySection } from "@/components/landing/SecuritySection"
import { FAQSection } from "@/components/landing/FAQSection"
import { CTASection } from "@/components/landing/CTASection"
import { Footer } from "@/components/landing/Footer"

export default function LandingPage() {
  return (
    <main style={{ background: "#0F1117" }}>
      <Navbar />
      <Hero />
      <NichesBar />
      <ProblemSection />
      <HowItWorks />
      <FeaturesSection />
      <TestimonialsSection />
      <PricingSection />
      <SecuritySection />
      <FAQSection />
      <CTASection />
      <Footer />
    </main>
  )
}
