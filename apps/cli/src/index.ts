import { InvalidArgumentError, program } from "commander"

import { report, withdraw } from "./commands/index.ts"

function parseAmount(value: string): number {
  const amount = Number(value)

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new InvalidArgumentError("The amount must be a number above zero.")
  }

  return amount
}

program.name("bank").description("Simulate bank accounts from a saved bank file")

program
  .command("report")
  .description("Show the balance, totals and history of an account")
  .argument("[account]", "the account to show, asked for when left out")
  .option("-b, --bank <name>", "the saved bank to load", "demo")
  .action(report)

program
  .command("withdraw")
  .description("Try a withdrawal and show the account afterwards (nothing is saved)")
  .argument("<account>", "the account to take the money from")
  .argument("<amount>", "how much to take out", parseAmount)
  .option("-b, --bank <name>", "the saved bank to load", "demo")
  .action(withdraw)

try {
  await program.parseAsync()
} catch (error) {
  if (error instanceof Error && error.name === "ExitPromptError") {
    process.exitCode = 130
  } else {
    console.error(error instanceof Error ? error.message : error)
    process.exitCode = 1
  }
}
