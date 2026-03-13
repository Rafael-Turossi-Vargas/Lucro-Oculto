import React from "react"

interface LogoProps {
  size?: number
}

/* eslint-disable @next/next/no-img-element */
function BankImage({ src, name, size = 28 }: { src: string; name: string; size?: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={`${name} logo`}
      width={size}
      height={size}
      style={{ width: size, height: size, borderRadius: 8, objectFit: "cover", display: "block" }}
    />
  )
}

export function NubankLogo({ size = 28 }: LogoProps) {
  return <BankImage src="/banks/nubank.png" name="Nubank" size={size} />
}

export function ItauLogo({ size = 28 }: LogoProps) {
  return <BankImage src="/banks/itau.png" name="Itaú" size={size} />
}

export function BradescoLogo({ size = 28 }: LogoProps) {
  return <BankImage src="/banks/bradesco.png" name="Bradesco" size={size} />
}

export function SantanderLogo({ size = 28 }: LogoProps) {
  return <BankImage src="/banks/santander.png" name="Santander" size={size} />
}

export function BancoDoBrasilLogo({ size = 28 }: LogoProps) {
  return <BankImage src="/banks/bb.png" name="Banco do Brasil" size={size} />
}

export function CaixaLogo({ size = 28 }: LogoProps) {
  return <BankImage src="/banks/caixa.png" name="Caixa Econômica" size={size} />
}

export function InterLogo({ size = 28 }: LogoProps) {
  return <BankImage src="/banks/inter.png" name="Inter" size={size} />
}

export function C6BankLogo({ size = 28 }: LogoProps) {
  return <BankImage src="/banks/c6bank.png" name="C6 Bank" size={size} />
}

export const BANK_LOGOS: Record<string, React.ComponentType<{ size?: number }>> = {
  "Nubank": NubankLogo,
  "Itaú": ItauLogo,
  "Bradesco": BradescoLogo,
  "Santander": SantanderLogo,
  "Banco do Brasil": BancoDoBrasilLogo,
  "Caixa Econômica": CaixaLogo,
  "Inter": InterLogo,
  "C6 Bank": C6BankLogo,
}
