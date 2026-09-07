// Formato unico de erro da api: { erro: { codigo, mensagem, detalhes? } }.
// O cliente nunca ve stack nem mensagem interna; o log do servidor fica com o
// erro completo.
import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify'
import { hasZodFastifySchemaValidationErrors } from 'fastify-type-provider-zod'

export type CorpoDeErro = {
  erro: { codigo: string; mensagem: string; detalhes?: unknown }
}

// Erro previsto pela propria api: sobe com o status, o codigo e a mensagem
// que o cliente vai ver.
export class ErroDaApi extends Error {
  constructor(
    readonly status: number,
    readonly codigo: string,
    mensagem: string,
    readonly detalhes?: unknown,
  ) {
    super(mensagem)
    this.name = 'ErroDaApi'
  }
}

export function responderNaoEncontrado(_request: FastifyRequest, reply: FastifyReply) {
  return reply
    .code(404)
    .send({ erro: { codigo: 'nao_encontrado', mensagem: 'rota nao encontrada' } })
}
