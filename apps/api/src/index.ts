import cors from "@fastify/cors"
import { openLedger } from "bank/ledger"
import Fastify from "fastify"

import replyWithErrors from "./errors/index.ts"
import accounts from "./routes/accounts/index.ts"
import transactions from "./routes/transactions/index.ts"

const port = 3000
const fastify = Fastify()

try {
  const ledger = await openLedger("demo")

  replyWithErrors(fastify)

  await fastify.register(cors)
  await fastify.register(accounts, { ledger })
  await fastify.register(transactions, { ledger })
  await fastify.listen({ port })

  console.log(`The bank server is listening on http://localhost:${port}`)
} catch (error) {
  if (error instanceof Error && "code" in error && error.code === "EADDRINUSE") {
    console.error(`Port ${port} is already in use. Is the bank server already running?`)
  } else {
    console.error(error instanceof Error ? error.message : error)
  }

  process.exit(1)
}
