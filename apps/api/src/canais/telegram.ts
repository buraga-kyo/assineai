import { Bot } from 'grammy'
import type { ICanal, EventoRecebido } from './interface.js'
import { carregarConfigOuSair } from '../config.js'

export class CanalTelegram implements ICanal {
  
  private obterToken(credenciais: any): string {
    if (credenciais && credenciais.token) return credenciais.token
    
    // Fallback pro bot padrao da plataforma se a empresa nao tem o dela
    const config = carregarConfigOuSair()
    if (!config.TELEGRAM_BOT_TOKEN_PLATAFORMA) {
      throw new Error('Telegram não configurado na plataforma')
    }
    return config.TELEGRAM_BOT_TOKEN_PLATAFORMA
  }

  async parear(credenciais: any) {
    if (!credenciais || !credenciais.token) {
      return { sucesso: false, mensagem: 'Token do bot obrigatório' }
    }
    
    try {
      const bot = new Bot(credenciais.token)
      const me = await bot.api.getMe()
      return { 
        sucesso: true, 
        mensagem: `Conectado ao bot @${me.username}`
      }
    } catch (e: any) {
      return { sucesso: false, mensagem: `Falha ao conectar no Telegram: ${e.message}` }
    }
  }

  async desconectar(credenciais: any) {
    // Para webhook a gente só apaga no nosso banco, a menos que quisesse dar deleteWebhook lá no Telegram
  }

  async enviarMensagemDeTexto(para: string, texto: string, credenciais: any): Promise<boolean> {
    try {
      const bot = new Bot(this.obterToken(credenciais))
      await bot.api.sendMessage(para, texto)
      return true
    } catch (e: any) {
      console.error('Erro ao enviar mensagem Telegram', e.message)
      return false
    }
  }

  async enviarDocumento(para: string, arquivoUrl: string, nomeArquivo: string, legenda: string, credenciais: any): Promise<boolean> {
    try {
      const bot = new Bot(this.obterToken(credenciais))
      // O telegram aceita URLs públicas direto, mas num fluxo fechado teríamos que baixar e mandar um readStream
      await bot.api.sendDocument(para, arquivoUrl, {
        caption: legenda
      })
      return true
    } catch (e: any) {
      console.error('Erro ao enviar documento Telegram', e.message)
      return false
    }
  }

  interpretarWebhook(payload: any): EventoRecebido[] {
    const eventos: EventoRecebido[] = []
    
    // Webhook padrão do Telegram
    if (payload && payload.message) {
      const msg = payload.message
      const texto = msg.text || ''
      const senderId = msg.from?.id?.toString()
      
      if (senderId) {
        eventos.push({
          canal: 'telegram',
          identidadeExterna: senderId,
          conteudoTexto: texto,
          rawPayload: payload
        })
      }
    }
    
    return eventos
  }
}
