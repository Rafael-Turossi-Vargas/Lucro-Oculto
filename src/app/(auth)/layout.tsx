import Link from "next/link"
import Image from "next/image"
import { ArrowLeft } from "lucide-react"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#0F1117" }}
    >
      {/* Back to home */}
      <div className="p-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm transition-colors hover:opacity-80"
          style={{ color: "#8B8FA8" }}
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar ao início
        </Link>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Link href="/" className="inline-flex hover:opacity-85 transition-opacity">
              <Image src="/logo.svg" alt="Lucro Oculto" width={172} height={44} priority />
            </Link>
          </div>

          {children}
        </div>
      </div>
    </div>
  )
}
