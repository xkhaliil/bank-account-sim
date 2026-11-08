import { describe as describeTransaction, formatReport, type Transaction } from "bank/accounts"
import { openLedger } from "bank/ledger"

import { type BankOptions } from "./options.ts"

export default async function withdraw(
  id: string,
  amount: number,
  options: BankOptions,
): Promise<void> {
  const ledger = await openLedger(options.bank)
  const account = ledger.find(id)

  if (account === undefined) {
    throw new Error(`There is no account called "${id}"`)
  }

  const transaction: Transaction = { kind: "withdrawal", account: id, amount }

  ledger.record(transaction)

  console.log(`${describeTransaction(transaction)} (not saved)`)
  console.log()
  console.log(formatReport(account.report()))
}
