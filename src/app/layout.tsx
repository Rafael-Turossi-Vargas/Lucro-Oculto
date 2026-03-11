import type { Metadata, Viewport } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import "./globals.css"
import { CookieConsent } from "@/components/ui/cookie-consent"

/* ─── Fonts ─────────────────────────────────────────────────────────────────── */
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
  preload: true,
})

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  preload: false,
})

/* ─── Metadata ───────────────────────────────────────────────────────────────── */
export const metadata: Metadata = {
  title: {
    default: "Lucro Oculto — Auditor Financeiro para PMEs",
    template: "%s | Lucro Oculto",
  },
  description:
    "Descubra onde sua empresa está perdendo dinheiro. Analise despesas, assinaturas e padrões financeiros para encontrar vazamentos financeiros e aumentar o lucro.",
  keywords: [
    "auditor financeiro",
    "PME",
    "gestão financeira",
    "redução de custos",
    "análise de despesas",
    "assinaturas",
    "vazamentos financeiros",
    "lucro",
    "fluxo de caixa",
  ],
  authors: [{ name: "Lucro Oculto" }],
  creator: "Lucro Oculto",
  publisher: "Lucro Oculto",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "https://lucrooculto.com.br"
  ),
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "/",
    siteName: "Lucro Oculto",
    title: "Lucro Oculto — Auditor Financeiro Inteligente para PMEs",
    description:
      "Descubra onde sua empresa está perdendo dinheiro. Analise despesas, assinaturas e padrões financeiros para encontrar vazamentos financeiros e aumentar o lucro.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Lucro Oculto — Auditor Financeiro para PMEs",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Lucro Oculto — Auditor Financeiro Inteligente para PMEs",
    description:
      "Descubra onde sua empresa está perdendo dinheiro. Analise despesas, assinaturas e padrões financeiros.",
    images: ["/og-image.png"],
    creator: "@lucrooculto",
    site: "@lucrooculto",
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    shortcut: "/favicon.svg",
  },
  category: "finance",
}

export const viewport: Viewport = {
  themeColor: [{ color: "#0F1117" }],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  colorScheme: "dark",
}

/* ─── Root Layout ────────────────────────────────────────────────────────────── */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}
        style={{
          fontFamily: "var(--font-inter), system-ui, -apple-system, sans-serif",
          backgroundColor: "#0F1117",
          color: "#F4F4F5",
          minHeight: "100dvh",
        }}
      >
        {children}
        <CookieConsent />
      </body>
    </html>
  )
}
