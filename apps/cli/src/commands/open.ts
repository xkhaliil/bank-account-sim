import Account, { type AccountDetails, type Transaction } from "bank/accounts"
import loadBank from "bank/saved"

export interface BankOptions {
  bank: string
}

interface OpenBank {
  details: AccountDetails[]
  accounts: Account[]
}

export async function openBank(name: string): Promise<OpenBank> {
  const saved = await loadBank(name)
  const accounts = saved.accounts.map((details) => new Account(details))

  for (const transaction of saved.history) {
    replay(accounts, transaction)
  }

  return { details: saved.accounts, accounts }
}

export function findAccount(accounts: Account[], id: string): Account {
  const account = accounts.find((account) => account.id === id)

  if (account === undefined) {
    throw new Error(`There is no account called "${id}"`)
  }

  return account
}

export function replay(accounts: Account[], transaction: Transaction): void {
  if (transaction.kind === "deposit") {
    findAccount(accounts, transaction.account).deposit(transaction.amount)
    return
  }

  if (transaction.kind === "withdrawal") {
    findAccount(accounts, transaction.account).withdraw(transaction.amount)
    return
  }

  if (transaction.kind === "transfer") {
    const to = findAccount(accounts, transaction.to)

    findAccount(accounts, transaction.from).transfer(transaction.amount, to)
    return
  }

  throw new Error("Unknown kind.")
}
