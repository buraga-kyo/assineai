import type { IRedator } from './interface.js'
import { RedatorNulo } from './nulo.js'
import { carregarConfigOuSair } from '../config.js'

export class FabricaDeRedator {
  static obterParaEmpresa(configEmpresa: any): IRedator {
    // A empresa precisa ativar a feature (opt-in)
    if (!configEmpresa?.copiloto_ativo) {
      throw new Error('A empresa não ativou o uso de copiloto/redator')
    }

    const env = carregarConfigOuSair()
    const driver = env.REDATOR_DRIVER || 'nulo'

    switch (driver) {
      case 'nulo':
        return new RedatorNulo()
      case 'openai':
      case 'anthropic':
      case 'local':
        // Na vida real a gente puxaria as classes certinhas implementadas (usando SDKs),
        // mas pro MVP o driver nulo já atende o requisito de ter a casca pra testes
        // e abstrai a complexidade do framework.
        return new RedatorNulo() 
      default:
        throw new Error(`Driver de redator ${driver} não suportado`)
    }
  }
}
