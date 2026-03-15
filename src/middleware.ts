import { NextRequest, NextResponse } from "next/server"

export function middleware(request: NextRequest) {
  // Em desenvolvimento, pula CSP/nonce para evitar o hydration mismatch do React 18+.
  // O React remove intencionalmente o atributo nonce do DOM após hidratação (proteção contra
  // CSS attribute selector leaks), o que gera falso positivo de mismatch em dev.
  if (process.env.NODE_ENV === "development") {
    return NextResponse.next()
  }

  const nonce = Buffer.from(crypto.randomUUID()).toString("base64")

  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}'`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' data: https://fonts.gstatic.com",
    "img-src 'self' data: https:",
    "connect-src 'self' https:",
    "frame-ancestors 'none'",
  ].join("; ")

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set("x-nonce", nonce)
  requestHeaders.set("content-security-policy", csp)

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  })

  response.headers.set("content-security-policy", csp)

  return response
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon|.*\\.(?:png|jpg|svg|ico|webp|woff2?)).*)",
  ],
}
