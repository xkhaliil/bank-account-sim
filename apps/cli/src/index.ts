import { Account, describe, loadSavedBank, money, type Transaction } from "bank"

import { savedBank, testSaves } from "./saved.ts"

const bank = loadSavedBank(savedBank)
const accounts = bank.accounts.map((details) => new Account(details))

function find(id: string): Account {
  const account = accounts.find((account) => account.id === id)

  if (account === undefined) {
    throw new Error(`There is no account ${id}`)
  }

  return account
}

function replay(transaction: Transaction): void {
  if (transaction.kind === "deposit") {
    find(transaction.account).deposit(transaction.amount)
    return
  }

  if (transaction.kind === "withdrawal") {
    find(transaction.account).withdraw(transaction.amount)
    return
  }

  if (transaction.kind === "transfer") {
    find(transaction.from).transfer(transaction.amount, find(transaction.to))
    return
  }

  throw new Error("Unknown kind.")
}

function attempt(label: string, action: () => void): void {
  try {
    action()
    console.log(`  ${label}: ok`)
  } catch (error) {
    if (error instanceof Error) {
      console.log(`  ${label}: ${error.message}`)
    }
  }
}

console.log(`Bank saved at ${bank.savedAt ?? "an unknown time"}`)
console.log()

console.log("Accounts")
for (const details of bank.accounts) {
  const owners = details.owners.join(" and ")

  console.log(`  ${details.id} belongs to ${owners}, opened with ${money(details.openingBalance)}`)
}
console.log()

console.log("Saved history")
for (const transaction of bank.history) {
  replay(transaction)
  console.log(`  ${describe(transaction)}`)
}
console.log()

console.log("New transactions")
attempt("Withdraw 1000 from CHK-001", () => find("CHK-001").withdraw(1000))
attempt("Deposit 5 into OLD-003", () => find("OLD-003").deposit(5))
attempt("Deposit -20 into CHK-001", () => find("CHK-001").deposit(-20))
attempt("Transfer 75 from SAV-002 to CHK-001", () => find("SAV-002").transfer(75, find("CHK-001")))
console.log()

for (const account of accounts) {
  console.log(account.report())
  console.log()
}

console.log("Other saves")
for (const save of testSaves) {
  attempt(save.label, () => loadSavedBank(save.text))
}
