import { describe as describeTransaction, type Transaction } from "bank/accounts"

import { type BankOptions, findAccount, openBank, replay } from "./open.ts"

export default async function withdraw(
  id: string,
  amount: number,
  options: BankOptions,
): Promise<void> {
  const { accounts } = await openBank(options.bank)
  const transaction: Transaction = { kind: "withdrawal", account: id, amount }

  replay(accounts, transaction)

  console.log(`${describeTransaction(transaction)} (not saved)`)
  console.log()
  console.log(findAccount(accounts, id).report())
}
