import {
  type AccountDetails,
  isAccountDetails,
  isTransaction,
  type Transaction,
} from "../accounts/index.ts"

export interface SavedBank {
  accounts: AccountDetails[]
  history: Transaction[]
  savedAt?: string
}

export function isSavedBank(value: unknown): value is SavedBank {
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
