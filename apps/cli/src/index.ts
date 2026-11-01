import Account, { describe as describeTransaction, type Transaction } from "bank/accounts"
import loadBank, { type SavedBank } from "bank/saved"

let bank: SavedBank

try {
  bank = await loadBank("demo")
} catch (error) {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
}

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
  const status = details.isFrozen ? " (frozen)" : ""

  console.log(`  ${details.id} belongs to ${owners}${status}`)
}
console.log()

console.log("Saved history")
for (const transaction of bank.history) {
  replay(transaction)
  console.log(`  ${describeTransaction(transaction)}`)
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
