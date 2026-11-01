import { isSavedBank, type SavedBank } from "./guards.ts"

export default function loadSavedBank(saved: string): SavedBank {
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
