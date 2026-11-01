import { readFile } from "node:fs/promises"
import path from "node:path"

import { isSavedBank, type SavedBank } from "./guards.ts"

export default async function loadBank(name: string): Promise<SavedBank> {
  const file = path.join(import.meta.dirname, `${name}.json`)

  let text: string

  try {
    text = await readFile(file, "utf8")
  } catch (error) {
    const missing = error instanceof Error && "code" in error && error.code === "ENOENT"

    throw new Error(
      missing
        ? `There is no saved bank called "${name}"`
        : `Could not read the saved bank "${name}"`,
      { cause: error },
    )
  }

  let value: unknown

  try {
    value = JSON.parse(text)
  } catch (error) {
    throw new Error(`The saved bank "${name}" is not valid JSON`, { cause: error })
  }

  if (!isSavedBank(value)) {
    throw new Error(`The saved bank "${name}" is missing a piece or has the wrong kind of piece`)
  }

  return value
}
