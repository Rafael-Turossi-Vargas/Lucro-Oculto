"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, ShieldCheck, CreditCard, Clock, Lock, Zap } from "lucide-react"

const trust = [
  { icon: ShieldCheck, text: "Dados criptografados" },
  { icon: CreditCard, text: "Sem cartão de crédito" },
  { icon: Clock, text: "Resultado em 1 minuto" },
  { icon: Lock, text: "Conformidade LGPD" },
]

const stats = [
  { value: "R$ 2,8M+", label: "em desperdício identificado" },
  { value: "1.240+", label: "empresas analisadas" },
  { value: "34pts", label: "melhora média no score" },
]

export function CTASection() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    router.push(`/register?email=${encodeURIComponent(email)}`)
  }

  return 
}
