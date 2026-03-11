"use client"

import { useState, useEffect, use } from "react"
import Image from "next/image"
import { Users, CheckCircle, XCircle, Loader2, Mail, LogIn } from "lucide-react"

type InviteInfo = {
  email: string
  organizationName: string
  invitedByName: string | null
}

type AcceptResult = {
  isNewUser: boolean
  email: string
}

export default function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params)

  const [info, setInfo] = useState<InviteInfo | null>(null)
  const [loadError, setLoadError] = useState("")
  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState(false)
  const [result, setResult] = useState<AcceptResult | null>(null)
  const [acceptError, setAcceptError] = useState("")

  useEffect(() => {
    fetch(`/api/app/team/accept/${token}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) setLoadError(d.error)
        else setInfo({ email: d.email, organizationName: d.organizationName, invitedByName: d.invitedByName })
      })
      .catch(() => setLoadError("Erro ao carregar convite"))
      .finally(() => setLoading(false))
  }, [token])

  const handleAccept = async () => {
    setAccepting(true)
    setAcceptError("")

    const res = await fetch(`/api/app/team/accept/${token}`, { method: "POST" })
    const data = await res.json()
    setAccepting(false)

    if (!res.ok) {
      setAcceptError(data.error ?? "Erro ao aceitar convite")
      return
    }

    setResult({ isNewUser: data.isNewUser, email: data.email })
  }

  return (
    <div className="min-h-screen bg-[#0F1117] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <Image src="/logo-icon.svg" alt="Lucro Oculto" width={36} height={36} />
          <span className="text-[#F4F4F5] font-bold text-xl">Lucro Oculto</span>
        </div>

        <div className="bg-[#1A1D27] border border-[#2A2D3A] rounded-2xl p-8 text-center">

          {/* Loading */}
          {loading ? (
            <div className="py-8">
              <Loader2 className="w-8 h-8 text-[#A855F7] animate-spin mx-auto" />
            </div>

          /* ── Error loading invite ─────────────────────────────────────── */
          ) : loadError ? (
            <>
              <div className="w-16 h-16 rounded-2xl bg-[#FF4D4F]/10 flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-8 h-8 text-[#FF4D4F]" />
              </div>
              <h1 className="text-xl font-bold text-[#F4F4F5] mb-2">Convite inválido</h1>
              <p className="text-[#8B8FA8] mb-6">{loadError}</p>
              <a href="/login" className="text-sm text-[#A855F7] hover:underline">
                Ir para o login
              </a>
            </>

          /* ── Success: new user created ──────────────────────────────────── */
          ) : result?.isNewUser ? (
            <>
              <div className="w-16 h-16 rounded-2xl bg-[#00D084]/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-[#00D084]" />
              </div>
              <h1 className="text-xl font-bold text-[#F4F4F5] mb-2">Convite aceito!</h1>
              <p className="text-[#8B8FA8] mb-5">
                Você agora faz parte da equipe de{" "}
                <strong className="text-[#A855F7]">{info?.organizationName}</strong>.
              </p>
              <div className="mb-6 p-4 bg-[#A855F7]/08 border border-[#A855F7]/20 rounded-xl text-left space-y-2">
                <div className="flex items-center gap-2 text-sm text-[#A855F7] font-medium">
                  <Mail className="w-4 h-4" />
                  Credenciais enviadas por email
                </div>
                <p className="text-xs text-[#8B8FA8]">
                  Verifique a caixa de entrada de{" "}
                  <strong className="text-[#F4F4F5]">{result.email}</strong>.
                  Você receberá seu email e senha temporária para acessar o sistema.
                </p>
              </div>
              <a
                href="/login"
                className="w-full inline-flex items-center justify-center gap-2 bg-[#A855F7] text-white font-semibold py-3 px-6 rounded-xl hover:bg-[#9333EA] transition-colors"
              >
                <LogIn className="w-4 h-4" />
                Ir para o login
              </a>
            </>

          /* ── Success: existing user added to org ────────────────────────── */
          ) : result && !result.isNewUser ? (
            <>
              <div className="w-16 h-16 rounded-2xl bg-[#00D084]/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-[#00D084]" />
              </div>
              <h1 className="text-xl font-bold text-[#F4F4F5] mb-2">Você entrou para a equipe!</h1>
              <p className="text-[#8B8FA8] mb-6">
                Você agora faz parte de{" "}
                <strong className="text-[#A855F7]">{info?.organizationName}</strong>.
                Acesse o sistema para começar.
              </p>
              <a
                href="/login"
                className="w-full inline-flex items-center justify-center gap-2 bg-[#A855F7] text-white font-semibold py-3 px-6 rounded-xl hover:bg-[#9333EA] transition-colors"
              >
                <LogIn className="w-4 h-4" />
                Ir para o login
              </a>
            </>

          /* ── Pending invite ─────────────────────────────────────────────── */
          ) : (
            <>
              <div className="w-16 h-16 rounded-2xl bg-[#A855F7]/15 flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-[#A855F7]" />
              </div>
              <h1 className="text-xl font-bold text-[#F4F4F5] mb-2">Convite para equipe</h1>

              {info && (
                <p className="text-[#8B8FA8] mb-1">
                  {info.invitedByName
                    ? <><strong className="text-[#F4F4F5]">{info.invitedByName}</strong> te convidou</>
                    : "Você foi convidado"
                  }
                  {" "}para colaborar em{" "}
                  <strong className="text-[#A855F7]">{info.organizationName}</strong>
                </p>
              )}
              {info && (
                <p className="text-xs text-[#4B4F6A] mb-6">
                  Convite enviado para:{" "}
                  <strong className="text-[#6B6F8A]">{info.email}</strong>
                </p>
              )}

              {acceptError && (
                <p className="mb-4 text-sm text-[#FF4D4F]">{acceptError}</p>
              )}

              <button
                onClick={handleAccept}
                disabled={accepting}
                className="w-full bg-[#A855F7] text-white font-semibold py-3 rounded-xl hover:bg-[#9333EA] disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                {accepting
                  ? <><Loader2 className="w-4 h-4 animate-spin" />Aceitando...</>
                  : <><CheckCircle className="w-4 h-4" />Aceitar convite</>
                }
              </button>

              <p className="mt-3 text-xs text-[#4B4F6A]">
                Ao aceitar, uma conta será criada com suas credenciais de acesso enviadas por email.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
