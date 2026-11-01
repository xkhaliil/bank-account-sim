import { select } from "@inquirer/prompts"

import { type BankOptions, findAccount, openBank } from "./open.ts"

export default async function report(id: string | undefined, options: BankOptions): Promise<void> {
  const { details, accounts } = await openBank(options.bank)

  const chosen =
    id ??
    (await select({
      message: "Which account?",
      choices: details.map((account) => ({
        name: `${account.id} (${account.owners.join(" and ")})`,
        value: account.id,
      })),
    }))

  console.log(findAccount(accounts, chosen).report())
}
