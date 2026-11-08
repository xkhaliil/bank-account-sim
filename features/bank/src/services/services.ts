import { type AccountReport, type AccountSummary, type Transaction } from "../accounts/index.ts"

const address = "http://localhost:3000"

interface ErrorReply {
  error?: string
}

async function request<Reply extends object = object>(
  path: string,
  init?: RequestInit,
): Promise<Reply> {
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

  const reply: Reply = await response.json()

  return reply
}

export async function listAccounts(): Promise<AccountSummary[]> {
  return request<AccountSummary[]>("/accounts")
}

export async function listOwnerAccounts(owner: string): Promise<AccountSummary[]> {
  return request<AccountSummary[]>("/my-accounts", { headers: { "x-owner": owner } })
}

export async function getAccount(id: string): Promise<AccountReport> {
  return request<AccountReport>(`/accounts/${encodeURIComponent(id)}`)
}

export async function recordTransaction(transaction: Transaction): Promise<Transaction> {
  return request<Transaction>("/transactions", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(transaction),
  })
}
