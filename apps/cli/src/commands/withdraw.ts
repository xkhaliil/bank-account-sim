import {
  type AccountReport,
  describe as describeTransaction,
  formatReport,
  type Transaction,
} from "bank/accounts"

import { call } from "./server.ts"

export default async function withdraw(id: string, amount: number): Promise<void> {
  const withdrawal: Transaction = { kind: "withdrawal", account: id, amount }

  const recordedResponse = await call("/transactions", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(withdrawal),
  })
  const recorded: Transaction = await recordedResponse.json()

  const accountResponse = await call(`/accounts/${encodeURIComponent(id)}`)
  const account: AccountReport = await accountResponse.json()

  console.log(describeTransaction(recorded))
  console.log()
  console.log(formatReport(account))
}
