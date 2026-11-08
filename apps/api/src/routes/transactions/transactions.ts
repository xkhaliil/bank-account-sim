import { accountsIn, isTransaction } from "bank/accounts"
import type Ledger from "bank/ledger"
import { type FastifyPluginAsync } from "fastify"

interface Options {
  ledger: Ledger
}

const transactions: FastifyPluginAsync<Options> = async (fastify, { ledger }) => {
  fastify.post<{ Body: unknown }>("/transactions", async (request, reply) => {
    const transaction = request.body

    if (!isTransaction(transaction)) {
      return reply
        .code(400)
        .send({ error: "Send a deposit, withdrawal or transfer with an amount above zero" })
    }

    const unknown = accountsIn(transaction).find((id) => ledger.find(id) === undefined)

    if (unknown !== undefined) {
      return reply.code(400).send({ error: `There is no account called "${unknown}"` })
    }

    try {
      ledger.record(transaction)
    } catch (error) {
      return reply.code(409).send({ error: error instanceof Error ? error.message : String(error) })
    }

    return reply.code(201).send(transaction)
  })
}

export default transactions
