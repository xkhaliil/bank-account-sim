import Account, {
  type AccountDetails,
  type AccountReport,
  type Transaction,
} from "../accounts/index.ts"

export default class Ledger {
  private accounts: Account[]

  constructor(details: AccountDetails[], history: Transaction[]) {
    this.accounts = details.map((account) => new Account(account))

    for (const transaction of history) {
      this.record(transaction)
    }
  }

  public list(): AccountReport[] {
    return this.accounts.map((account) => account.report())
  }

  public find(id: string): Account | undefined {
    return this.accounts.find((account) => account.id === id)
  }

  public record(transaction: Transaction): void {
    if (transaction.kind === "deposit") {
      this.get(transaction.account).deposit(transaction.amount)
      return
    }

    if (transaction.kind === "withdrawal") {
      this.get(transaction.account).withdraw(transaction.amount)
      return
    }

    if (transaction.kind === "transfer") {
      const to = this.get(transaction.to)

      this.get(transaction.from).transfer(transaction.amount, to)
      return
    }

    throw new Error("Unknown kind.")
  }

  private get(id: string): Account {
    const account = this.find(id)

    if (account === undefined) {
      throw new Error(`There is no account called "${id}"`)
    }

    return account
  }
}
