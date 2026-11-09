import { type AccountReport, type AccountSummary } from "bank/accounts"
import type Ledger from "bank/ledger"
import { type ErrorReply } from "bank/replies"
import { type FastifyPluginAsync } from "fastify"

interface Options {
  ledger: Ledger
}

function summarize({ id, owners, isFrozen }: AccountReport): AccountSummary {
  return { id, owners, isFrozen }
}

const accounts: FastifyPluginAsync<Options> = async (fastify, { ledger }) => {
  fastify.get<{ Reply: { 200: AccountSummary[] } }>("/accounts", async () => {
    return ledger.list().map(summarize)
  })

  fastify.get<{ Params: { id: string }; Reply: { 200: AccountReport; 404: ErrorReply } }>(
    "/accounts/:id",
    async (request, reply) => {
      const account = ledger.find(request.params.id)

      if (account === undefined) {
        return reply.code(404).send({ error: `There is no account called "${request.params.id}"` })
      }

      return account.report()
    },
  )

  fastify.get<{
    Headers: { "x-owner"?: string }
    Reply: { 200: AccountSummary[]; 401: ErrorReply }
  }>("/my-accounts", async (request, reply) => {
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
