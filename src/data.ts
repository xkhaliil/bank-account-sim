import { type AccountDetails } from "./lib/types.ts"

export const accounts: AccountDetails[] = [
  { id: "CHK-001", owners: ["Amira"], openingBalance: 100, isFrozen: false },
  { id: "SAV-002", owners: ["Amira", "Youssef"], openingBalance: 500, isFrozen: false },
  { id: "OLD-003", owners: ["Sami"], openingBalance: 20, isFrozen: true },
]
