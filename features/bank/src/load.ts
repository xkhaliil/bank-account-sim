import { type AccountDetails, type Transaction } from "./types.ts"

export interface SavedBank {
  accounts: AccountDetails[]
  history: Transaction[]
  savedAt?: string
}

export function loadSavedBank(saved: string): SavedBank {
  let value: unknown

  try {
    value = JSON.parse(saved)
  } catch {
    throw new Error("The saved bank is not valid text")
  }

  if (!isSavedBank(value)) {
    throw new Error("The saved bank is missing a piece or has the wrong kind of piece")
  }

  return value
}

function isSavedBank(value: unknown): value is SavedBank {
  if (typeof value !== "object" || value === null) {
    return false
  }

  if (
    !("accounts" in value) ||
    !Array.isArray(value.accounts) ||
    !value.accounts.every(isAccountDetails)
  ) {
    return false
  }

  if (
    !("history" in value) ||
    !Array.isArray(value.history) ||
    !value.history.every(isTransaction)
  ) {
    return false
  }

  if ("savedAt" in value && typeof value.savedAt !== "string") {
    return false
  }

  return true
}

function isAccountDetails(value: unknown): value is AccountDetails {
  if (typeof value !== "object" || value === null) {
    return false
  }

  if (!("id" in value) || typeof value.id !== "string") {
    return false
  }

  if (
    !("owners" in value) ||
    !Array.isArray(value.owners) ||
    value.owners.length === 0 ||
    !value.owners.every((owner) => typeof owner === "string")
  ) {
    return false
  }

  if (
    !("openingBalance" in value) ||
    typeof value.openingBalance !== "number" ||
    value.openingBalance < 0
  ) {
    return false
  }

  if (!("isFrozen" in value) || typeof value.isFrozen !== "boolean") {
    return false
  }

  return true
}

function isTransaction(value: unknown): value is Transaction {
  if (typeof value !== "object" || value === null || !("kind" in value)) {
    return false
  }

  if (!("amount" in value) || typeof value.amount !== "number" || value.amount <= 0) {
    return false
  }

  if (value.kind === "deposit" || value.kind === "withdrawal") {
    return "account" in value && typeof value.account === "string"
  }

  if (value.kind === "transfer") {
    return (
      "from" in value &&
      typeof value.from === "string" &&
      "to" in value &&
      typeof value.to === "string"
    )
  }

  return false
}
