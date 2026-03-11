"use client"

import type { ReactNode } from "react"
import type { Session } from "next-auth"
import { SessionProvider as NextAuthSessionProvider } from "next-auth/react"

interface Props {
  children: ReactNode
  session?: Session | null
}

export function SessionProvider({ children, session }: Props) {
  return (
    <NextAuthSessionProvider session={session} refetchInterval={60} refetchOnWindowFocus>
      {children}
    </NextAuthSessionProvider>
  )
}