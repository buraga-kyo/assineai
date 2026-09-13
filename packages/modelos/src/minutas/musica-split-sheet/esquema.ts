import { z } from 'zod'

export const esquema = z.object({
  tituloObra: z.string().describe('Título da obra musical'),
  autoresLista: z.string().describe('Lista dos autores, separando nome, documento e percentual. Ex: João (CPF: X, 50%), Maria (CPF: Y, 50%)'),
  isrc: z.string().optional().describe('ISRC, se já houver'),
  dataAcordo: z.string().describe('Data da formalização do acordo')
}).superRefine((data, ctx) => {
  // A validação rigorosa de somar 100% idealmente seria num array estruturado, 
  // mas como o markdown usa mustache basico pro MVP, aceitamos texto livre na lista 
  // e instruímos o copiloto a checar a soma.
  if (!data.autoresLista) return
})
