import {
  type AccountReport,
  type AccountSummary,
  isTransaction,
  type Transaction,
} from "../accounts/index.ts"
import { isAccountReport, isAccountSummaryList, isErrorReply } from "../replies/index.ts"

const address = "http://localhost:3000"

async function request<Reply extends object = object>(
  path: string,
  isReply: (value: unknown) => value is Reply,
  init?: RequestInit,
): Promise<Reply> {
  let response: Response

  try {
    response = await fetch(`${address}${path}`, init)
  } catch {
    throw new Error(`Cannot reach the bank server at ${address}. Start it with "pnpm api".`)
  }

  const reply: unknown = await response.json().catch(() => undefined)

  if (!response.ok) {
    throw new Error(
      isErrorReply(reply) ? reply.error : `The bank server answered with status ${response.status}`,
    )
  }

  if (!isReply(reply)) {
    throw new Error(`The bank server sent a reply to ${path} that does not have the expected shape`)
  }

  return reply
}

export async function listAccounts(): Promise<AccountSummary[]> {
  return request<AccountSummary[]>("/accounts", isAccountSummaryList)
}

export async function listOwnerAccounts(owner: string): Promise<AccountSummary[]> {
  return request<AccountSummary[]>("/my-accounts", isAccountSummaryList, {
    headers: { "x-owner": owner },
  })
}

export async function getAccount(id: string): Promise<AccountReport> {
  return request<AccountReport>(`/accounts/${encodeURIComponent(id)}`, isAccountReport)
}

export async function recordTransaction(transaction: Transaction): Promise<Transaction> {
  return request<Transaction>("/transactions", isTransaction, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(transaction),
  })
}
