import { z } from 'zod'

export type PapelMensagem = 'sistema' | 'assistente' | 'usuario'

export interface MensagemChat {
  papel: PapelMensagem
  texto: string
}

export interface IRedator {
  completar(mensagens: MensagemChat[]): Promise<string>
  completarEstruturado<T>(mensagens: MensagemChat[], schema: z.ZodSchema<T>): Promise<T>
}
