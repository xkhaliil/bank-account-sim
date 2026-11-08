import { select } from "@inquirer/prompts"
import { type AccountReport, formatReport } from "bank/accounts"

import { call } from "./server.ts"

interface ReportOptions {
  owner?: string
}

interface Summary {
  id: string
  owners: string[]
  isFrozen: boolean
}

async function ask(owner: string | undefined): Promise<string> {
  const response =
    owner === undefined
      ? await call("/accounts")
      : await call("/my-accounts", { headers: { "x-owner": owner } })
  const accounts: Summary[] = await response.json()

  if (accounts.length === 0) {
    throw new Error(owner === undefined ? "The bank has no accounts" : `${owner} has no accounts`)
  }

  return select({
    message: "Which account?",
    choices: accounts.map((account) => ({
      name: `${account.id} (${account.owners.join(" and ")})`,
      value: account.id,
    })),
  })
}

export default async function report(
  id: string | undefined,
  options: ReportOptions,
): Promise<void> {
  const chosen = id ?? (await ask(options.owner))
  const response = await call(`/accounts/${encodeURIComponent(chosen)}`)
  const account: AccountReport = await response.json()

  console.log(formatReport(account))
}
