import type { ICanal } from './interface.js'
import { cifrar, decifrar } from './criptografia.js'
import type { TipoCanal } from '../banco/esquema/canais.js'
import { CanalTelegram } from './telegram.js'
import { CanalEvolution } from './evolution.js'
import { CanalWhatsAppMeta } from './meta.js'
import { CanalSlack } from './slack.js'

// Registro de drivers de canal disponíveis
const registroCanais: Map<TipoCanal, ICanal> = new Map()

export function registrarCanal(tipo: TipoCanal, implementacao: ICanal) {
  registroCanais.set(tipo, implementacao)
}

registrarCanal('telegram', new CanalTelegram())
registrarCanal('whatsapp_evolution', new CanalEvolution())
registrarCanal('whatsapp_meta', new CanalWhatsAppMeta())
registrarCanal('slack', new CanalSlack())

export class FabricaDeCanais {
  static obter(tipo: TipoCanal): ICanal {
    const impl = registroCanais.get(tipo)
    if (!impl) {
      throw new Error(`Canal do tipo ${tipo} não suportado/registrado`)
    }
    return impl
  }

  static cifrarCredenciais(credenciaisAbertas: any): string {
    return cifrar(JSON.stringify(credenciaisAbertas))
  }

  static decifrarCredenciais(credenciaisCifradas: string): any {
    const textoEmClaro = decifrar(credenciaisCifradas)
    return JSON.parse(textoEmClaro)
  }
}
