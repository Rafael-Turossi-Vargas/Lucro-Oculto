"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { can, type Permission } from "@/lib/roles"

type Props = {
  permission: Permission
  children: React.ReactNode
  /** Where to redirect if access denied. Defaults to /app/dashboard */
  redirectTo?: string
}

/**
 * Wraps a page/section and redirects the user if they lack the required permission.
 * Usage: wrap the page content with <AccessGuard permission="upload:create">
 */
export function AccessGuard({ permission, children, redirectTo = "/app/dashboard" }: Props) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const role = session?.user?.role ?? ""

  useEffect(() => {
    if (status === "loading") return
    if (!can(role, permission)) {
      router.replace(redirectTo)
    }
  }, [status, role, permission, router, redirectTo])

  if (status === "loading") return null
  if (!can(role, permission)) return null

  return <>{children}</>
}
