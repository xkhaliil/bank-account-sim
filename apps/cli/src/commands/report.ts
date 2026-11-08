import { select } from "@inquirer/prompts"
import { formatReport } from "bank/accounts"
import { getAccount, listAccounts, listOwnerAccounts } from "bank/services"

interface ReportOptions {
  owner?: string
}

async function ask(owner: string | undefined): Promise<string> {
  const accounts = owner === undefined ? await listAccounts() : await listOwnerAccounts(owner)

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

  console.log(formatReport(await getAccount(chosen)))
}
