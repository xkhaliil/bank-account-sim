import { describe as describeTransaction, formatReport } from "bank/accounts"
import { getAccount, recordTransaction } from "bank/services"

export default async function withdraw(id: string, amount: number): Promise<void> {
  const recorded = await recordTransaction({ kind: "withdrawal", account: id, amount })

  console.log(describeTransaction(recorded))
  console.log()
  console.log(formatReport(await getAccount(id)))
}
