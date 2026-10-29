import { describe, money } from "./transactions.ts"
import { type AccountDetails, type Transaction, type TransactionKind } from "./types.ts"

export class Account {
  public readonly id: string
  private owners: string[]
  private frozen: boolean
  private balance: number
  private history: Transaction[] = []
  private totals: Record<TransactionKind, number> = {
    deposit: 0,
    withdrawal: 0,
    transfer: 0,
  }

  constructor(details: AccountDetails) {
    this.id = details.id
    this.owners = details.owners
    this.frozen = details.isFrozen
    this.balance = details.openingBalance
  }

  public deposit(amount: number): void {
    this.check(amount)

    this.balance += amount
    this.remember({ kind: "deposit", account: this.id, amount })
  }

  public withdraw(amount: number): void {
    this.check(amount)
    this.checkFunds(amount)

    this.balance -= amount
    this.remember({ kind: "withdrawal", account: this.id, amount })
  }

  public transfer(amount: number, to: Account): void {
    if (to === this) {
      throw new Error(`${this.id} cannot transfer to itself`)
    }

    this.check(amount)
    this.checkFunds(amount)
    to.check(amount)

    const transfer: Transaction = { kind: "transfer", from: this.id, to: to.id, amount }

    this.balance -= amount
    to.balance += amount
    this.remember(transfer)
    to.remember(transfer)
  }

  public report(): string {
    const status = this.frozen ? ", frozen" : ""
    const lines = [
      `${this.id} (${this.owners.join(" and ")}${status})`,
      `  Balance:     ${money(this.balance)}`,
      `  Deposited:   ${money(this.totals.deposit)}`,
      `  Withdrawn:   ${money(this.totals.withdrawal)}`,
      `  Transferred: ${money(this.totals.transfer)}`,
      ...this.history.map((transaction) => `  - ${describe(transaction)}`),
    ]

    return lines.join("\n")
  }

  private check(amount: number): void {
    if (this.frozen) {
      throw new Error(`${this.id} is frozen`)
    }

    if (amount <= 0) {
      throw new Error(`The amount must be more than zero, got ${amount}`)
    }
  }

  private checkFunds(amount: number): void {
    if (amount > this.balance) {
      throw new Error(
        `${this.id} only has ${money(this.balance)}, taking ${money(amount)} would make it negative`,
      )
    }
  }

  private remember(transaction: Transaction): void {
    this.history.push(transaction)
    this.totals[transaction.kind] += transaction.amount
  }
}
