export interface AccountDetails {
  id: string
  owners: string[]
  openingBalance: number
  isFrozen: boolean
}

export type TransactionKind = "deposit" | "withdrawal" | "transfer"

interface BaseTransaction {
  amount: number
}

interface Deposit extends BaseTransaction {
  kind: "deposit"
  account: string
}

interface Withdrawal extends BaseTransaction {
  kind: "withdrawal"
  account: string
}

interface Transfer extends BaseTransaction {
  kind: "transfer"
  from: string
  to: string
}

export type Transaction = Deposit | Withdrawal | Transfer
