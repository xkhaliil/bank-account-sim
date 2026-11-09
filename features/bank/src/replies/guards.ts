import { type AccountReport, type AccountSummary, isTransaction } from "../accounts/index.ts"

import { type ErrorReply } from "./types.ts"

export function isErrorReply(value: unknown): value is ErrorReply {
  return (
    typeof value === "object" &&
    value !== null &&
    "error" in value &&
    typeof value.error === "string"
  )
}

export function isAccountSummaryList(value: unknown): value is AccountSummary[] {
  return Array.isArray(value) && value.every(isAccountSummary)
}

export function isAccountReport(value: unknown): value is AccountReport {
  if (!isAccountSummary(value)) {
    return false
  }

  if (!("balance" in value) || typeof value.balance !== "number") {
    return false
  }

  if (!("totals" in value) || !isTotals(value.totals)) {
    return false
  }

  if (
    !("history" in value) ||
    !Array.isArray(value.history) ||
    !value.history.every(isTransaction)
  ) {
    return false
  }

  return true
}

function isAccountSummary(value: unknown): value is AccountSummary {
  if (typeof value !== "object" || value === null) {
    return false
  }

  if (!("id" in value) || typeof value.id !== "string") {
    return false
  }

  if (
    !("owners" in value) ||
    !Array.isArray(value.owners) ||
    !value.owners.every((owner) => typeof owner === "string")
  ) {
    return false
  }

  if (!("isFrozen" in value) || typeof value.isFrozen !== "boolean") {
    return false
  }

  return true
}

function isTotals(value: unknown): value is AccountReport["totals"] {
  if (typeof value !== "object" || value === null) {
    return false
  }

  return (
    "deposit" in value &&
    typeof value.deposit === "number" &&
    "withdrawal" in value &&
    typeof value.withdrawal === "number" &&
    "transfer" in value &&
    typeof value.transfer === "number"
  )
}
