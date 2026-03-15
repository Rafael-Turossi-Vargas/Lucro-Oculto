import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { rateLimit, getClientIp } from "@/lib/rate-limit"

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? ""

export async function GET(request: NextRequest) {
  // Rate limit: 10 attempts per IP per hour to prevent token enumeration
  const ip = getClientIp(request)
  const rl = await rateLimit(`verify-email:${ip}`, 10, 60 * 60 * 1000)
  if (!rl.success) {
    return NextResponse.redirect(`${APP_URL}/login?error=too_many_attempts`)
  }

  const token = request.nextUrl.searchParams.get("token")

  if (!token) {
    return NextResponse.redirect(`${APP_URL}/login?error=token_missing`)
  }

  try {
    // VerificationToken uses identifier=email and token=uuid
    const record = await db.verificationToken.findUnique({
      where: { token },
    })

    if (!record) {
      return NextResponse.redirect(`${APP_URL}/login?error=token_invalid`)
    }

    if (record.expires < new Date()) {
      // Clean up expired token
      await db.verificationToken.delete({ where: { token } }).catch(() => null)
      return NextResponse.redirect(`${APP_URL}/login?error=token_expired`)
    }

    // Mark user as verified
    await db.$transaction([
      db.user.update({
        where: { email: record.identifier },
        data: { emailVerified: new Date() },
      }),
      db.verificationToken.delete({ where: { token } }),
    ])

    return NextResponse.redirect(`${APP_URL}/login?verified=true`)
  } catch {
    return NextResponse.redirect(`${APP_URL}/login?error=verify_failed`)
  }
}
