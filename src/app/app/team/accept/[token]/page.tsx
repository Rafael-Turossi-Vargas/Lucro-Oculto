import { redirect } from "next/navigation"

// Redirect to the standalone invite page (outside app layout)
export default async function AcceptInviteRedirect({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  redirect(`/invite/${token}`)
}
