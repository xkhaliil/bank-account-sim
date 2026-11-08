import { type AccountReport } from "bank/accounts"
import type Ledger from "bank/ledger"
import { type FastifyPluginAsync } from "fastify"

interface Options {
  ledger: Ledger
}

interface Summary {
  id: string
  owners: string[]
  isFrozen: boolean
}

function summarize({ id, owners, isFrozen }: AccountReport): Summary {
  return { id, owners, isFrozen }
}

const accounts: FastifyPluginAsync<Options> = async (fastify, { ledger }) => {
  fastify.get("/accounts", async () => {
    return ledger.list().map(summarize)
  })

  fastify.get<{ Params: { id: string } }>("/accounts/:id", async (request, reply) => {
    const account = ledger.find(request.params.id)

    if (account === undefined) {
      return reply.code(404).send({ error: `There is no account called "${request.params.id}"` })
    }

    return account.report()
  })

  fastify.get<{ Headers: { "x-owner"?: string } }>("/my-accounts", async (request, reply) => {
    const owner = request.headers["x-owner"]

    if (!owner) {
      return reply.code(401).send({ error: "Say who you are with the x-owner header" })
    }

    return ledger
      .list()
      .filter((account) => account.owners.includes(owner))
      .map(summarize)
  })
}

export default accounts
