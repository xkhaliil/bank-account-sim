import { type ErrorReply } from "bank/replies"
import { type FastifyInstance } from "fastify"

export default function replyWithErrors(fastify: FastifyInstance): void {
  fastify.setNotFoundHandler<{ Reply: ErrorReply }>((request, reply) => {
    reply.code(404).send({ error: `There is no route for ${request.method} ${request.url}` })
  })

  fastify.setErrorHandler<Error & { statusCode?: number }, { Reply: ErrorReply }>(
    (error, request, reply) => {
      const status = error.statusCode ?? 500

      if (status >= 500) {
        console.error(error)
      }

      reply
        .code(status)
        .send({ error: status >= 500 ? "Something went wrong on the bank server" : error.message })
    },
  )
}
