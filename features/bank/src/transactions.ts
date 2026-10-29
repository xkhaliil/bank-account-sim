import { type Transaction } from "./types.ts"

export function money(amount: number): string {
  return `$${amount.toFixed(2)}`
}

export function describe(transaction: Transaction): string {
  if (transaction.kind === "deposit") {
    return `Deposit of ${money(transaction.amount)} into ${transaction.account}`
  }

  if (transaction.kind === "withdrawal") {
    return `Withdrawal of ${money(transaction.amount)} from ${transaction.account}`
  }

  if (transaction.kind === "transfer") {
    return `Transfer of ${money(transaction.amount)} from ${transaction.from} to ${transaction.to}`
  }

  throw new Error("Unknown kind.")
}
