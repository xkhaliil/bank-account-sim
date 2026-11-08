const address = "http://localhost:3000"

interface ErrorReply {
  error?: string
}

export async function call(path: string, init?: RequestInit): Promise<Response> {
  let response: Response

  try {
    response = await fetch(`${address}${path}`, init)
  } catch {
    throw new Error(`Cannot reach the bank server at ${address}. Start it with "pnpm api".`)
  }

  if (!response.ok) {
    const reply: ErrorReply = await response.json().catch(() => ({}))

    throw new Error(reply.error ?? `The bank server answered with status ${response.status}`)
  }

  return response
}
