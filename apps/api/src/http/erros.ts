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

const CODIGO_POR_STATUS: Record<number, string> = {
  400: 'requisicao_invalida',
  401: 'nao_autenticado',
  403: 'sem_permissao',
  404: 'nao_encontrado',
  413: 'corpo_grande_demais',
  415: 'tipo_nao_aceito',
  429: 'muitas_requisicoes',
}

function statusDoErro(erro: unknown): number {
  const status = (erro as Partial<FastifyError> | null)?.statusCode
  return typeof status === 'number' && status >= 400 && status <= 599 ? status : 500
}

export function tratarErro(erro: unknown, request: FastifyRequest, reply: FastifyReply) {
  if (hasZodFastifySchemaValidationErrors(erro)) {
    const detalhes = erro.validation.map((falha) => ({
      campo: `${erro.validationContext ?? ''}${falha.instancePath}`,
      mensagem: falha.message,
    }))
    const mensagem = 'os dados enviados nao passaram na validacao'
    return reply.code(400).send({ erro: { codigo: 'dados_invalidos', mensagem, detalhes } })
  }
  if (erro instanceof ErroDaApi) {
    const { codigo, message: mensagem, detalhes } = erro
    return reply.code(erro.status).send({ erro: { codigo, mensagem, detalhes } })
  }
  const status = statusDoErro(erro)
  if (status < 500) {
    const codigo = CODIGO_POR_STATUS[status] ?? `erro_${status}`
    // so a mensagem do proprio fastify (json quebrado, corpo grande demais, tipo
    // nao aceito) e segura de repassar; qualquer outro 4xx fala pelo codigo
    const doFastify =
      erro instanceof Error && (erro as Partial<FastifyError>).code?.startsWith('FST_')
    const mensagem = doFastify ? erro.message : codigo.replaceAll('_', ' ')
    return reply.code(status).send({ erro: { codigo, mensagem } })
  }
  request.log.error({ err: erro }, 'erro interno')
  return reply.code(500).send({ erro: { codigo: 'erro_interno', mensagem: 'erro interno' } })
}
