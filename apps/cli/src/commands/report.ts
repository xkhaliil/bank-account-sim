import { select } from "@inquirer/prompts"
import { formatReport } from "bank/accounts"
import { openLedger } from "bank/ledger"

import { type BankOptions } from "./options.ts"

export default async function report(id: string | undefined, options: BankOptions): Promise<void> {
  const ledger = await openLedger(options.bank)

  const chosen =
    id ??
    (await select({
      message: "Which account?",
      choices: ledger.list().map((account) => ({
        name: `${account.id} (${account.owners.join(" and ")})`,
        value: account.id,
      })),
    }))

  const account = ledger.find(chosen)

  if (account === undefined) {
    throw new Error(`There is no account called "${chosen}"`)
  }

  console.log(formatReport(account.report()))
}
