import { describe, money } from "./transactions.ts"
import { type AccountReport } from "./types.ts"

export function formatReport(report: AccountReport): string {
  const status = report.isFrozen ? ", frozen" : ""
  const lines = [
    `${report.id} (${report.owners.join(" and ")}${status})`,
    `  Balance:     ${money(report.balance)}`,
    `  Deposited:   ${money(report.totals.deposit)}`,
    `  Withdrawn:   ${money(report.totals.withdrawal)}`,
    `  Transferred: ${money(report.totals.transfer)}`,
    ...report.history.map((transaction) => `  - ${describe(transaction)}`),
  ]

  return lines.join("\n")
}
