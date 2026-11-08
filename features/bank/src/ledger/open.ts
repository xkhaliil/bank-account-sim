import loadBank from "../saved/index.ts"

import Ledger from "./ledger.ts"

export async function openLedger(name: string): Promise<Ledger> {
  const saved = await loadBank(name)

  return new Ledger(saved.accounts, saved.history)
}
