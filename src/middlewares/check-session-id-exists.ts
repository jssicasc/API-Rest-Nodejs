import { FastifyReply, FastifyRequest } from 'fastify'

export async function checkSessionIdExists(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const sessionId = request.cookies.sessionId

  if (!sessionId) {
    return reply.status(401).send({
      error: 'Unauthorized.',
    })

    // em caso de sucesso nem é necessário fzr o return pq o comportamento padrão de middleware já entende q se não retornou erro então foi sucesso, iai a execução da aplicação continuará normalmente
  }
}
