import { openLedger } from "bank/ledger"
import Fastify from "fastify"

import accounts from "./routes/accounts/index.ts"
import transactions from "./routes/transactions/index.ts"

const port = 3000
const fastify = Fastify()

try {
  const ledger = await openLedger("demo")

  await fastify.register(accounts, { ledger })
  await fastify.register(transactions, { ledger })
  await fastify.listen({ port })

  console.log(`The bank server is listening on http://localhost:${port}`)
} catch (error) {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
}
