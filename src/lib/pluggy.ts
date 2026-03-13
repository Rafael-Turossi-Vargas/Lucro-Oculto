import { PluggyClient } from "pluggy-sdk"

export function createPluggyClient() {
  const clientId = process.env.PLUGGY_CLIENT_ID
  const clientSecret = process.env.PLUGGY_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new Error("PLUGGY_CLIENT_ID and PLUGGY_CLIENT_SECRET env vars are required")
  }

  return new PluggyClient({ clientId, clientSecret })
}

/**
 * Creates a Pluggy Connect Token.
 * clientUserId is passed as `options.clientUserId` to track which org connected.
 */
export async function createConnectToken(clientUserId?: string): Promise<string> {
  const pluggy = createPluggyClient()
  // signature: createConnectToken(itemId?: string, options?: ConnectTokenOptions)
  const result = await pluggy.createConnectToken(undefined, clientUserId ? { clientUserId } : undefined)
  return result.accessToken
}

export async function getPluggyItem(itemId: string) {
  const pluggy = createPluggyClient()
  return pluggy.fetchItem(itemId)
}

export async function deletePluggyItem(itemId: string) {
  const pluggy = createPluggyClient()
  return pluggy.deleteItem(itemId)
}
