import { accounts } from "./data.ts"
import { type Transaction } from "bank"

const history: Transaction[] = [
  { kind: "deposit", account: "CHK-001", amount: 250 },
  { kind: "withdrawal", account: "CHK-001", amount: 40 },
  { kind: "transfer", from: "CHK-001", to: "SAV-002", amount: 100 },
]

export const savedBank = JSON.stringify({
  accounts,
  history,
  savedAt: new Date(),
})

interface TestSave {
  label: string
  text: string
}

export const testSaves: TestSave[] = [
  {
    label: "Good save without the optional savedAt",
    text: JSON.stringify({ accounts, history }),
  },
  {
    label: "Not JSON at all",
    text: "accounts: CHK-001, SAV-002",
  },
  {
    label: "No history",
    text: JSON.stringify({ accounts }),
  },
  {
    label: "Owners is text instead of a list",
    text: JSON.stringify({
      accounts: [{ id: "NEW-004", owners: "Lina", openingBalance: 0, isFrozen: false }],
      history: [],
    }),
  },
  {
    label: "Opening balance is text",
    text: JSON.stringify({
      accounts: [{ id: "NEW-004", owners: ["Lina"], openingBalance: "50", isFrozen: false }],
      history: [],
    }),
  },
  {
    label: "Unknown transaction kind",
    text: JSON.stringify({
      accounts,
      history: [{ kind: "refund", account: "CHK-001", amount: 5 }],
    }),
  },
  {
    label: "Negative amount",
    text: JSON.stringify({
      accounts,
      history: [{ kind: "withdrawal", account: "CHK-001", amount: -5 }],
    }),
  },
  {
    label: "Transfer with no receiver",
    text: JSON.stringify({
      accounts,
      history: [{ kind: "transfer", from: "CHK-001", amount: 5 }],
    }),
  },
  {
    label: "savedAt is a number",
    text: JSON.stringify({ accounts, history, savedAt: 1761760000 }),
  },
]
