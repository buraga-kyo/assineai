import type { IRedator, MensagemChat } from './interface.js'
import type { z } from 'zod'

// Driver Nulo, sempre devolve um texto fixo ou mock para não gastar chaves em testes e CI
export class RedatorNulo implements IRedator {
  async completar(mensagens: MensagemChat[]): Promise<string> {
    return 'Sou o RedatorNulo. Resposta simulada para testes.'
  }

  async completarEstruturado<T>(mensagens: MensagemChat[], schema: z.ZodSchema<T>): Promise<T> {
    // Como é um mock, ele tenta gerar um objeto genérico preenchendo as chaves com strings vazias,
    // o que obviamente pode quebrar a validação Zod se não for tudo string,
    // mas serve pro básico ou pros testes preverem o erro.
    const mockData: any = {}
    return mockData as T
  }
}
