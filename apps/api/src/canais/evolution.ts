import type { ICanal, EventoRecebido } from './interface.js'
import { carregarConfigOuSair } from '../config.js'

export class CanalEvolution implements ICanal {
  private get baseUrl() {
    return carregarConfigOuSair().EVOLUTION_URL
  }

  private get apiKey() {
    return carregarConfigOuSair().EVOLUTION_CHAVE_GLOBAL
  }

  // Header padrão pra conversar com a Evolution API
  private get headers() {
    return {
      'apikey': this.apiKey,
      'Content-Type': 'application/json'
    }
  }

  async parear(credenciais: any) {
    if (!credenciais || !credenciais.nomeInstancia) {
      return { sucesso: false, mensagem: 'Nome da instância obrigatório' }
    }
    
    try {
      const nome = credenciais.nomeInstancia
      // 1. Tenta criar a instância
      const resCriar = await fetch(`${this.baseUrl}/instance/create`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          instanceName: nome,
          token: nome,
          qrcode: true,
          integration: "WHATSAPP-BAILEYS"
        })
      })

      if (!resCriar.ok) {
        const err = await resCriar.json()
        if (!err.message?.includes('already exists')) {
          throw new Error(err.message || 'Erro ao criar instância')
        }
      }

      // 2. Tenta conectar para pegar o base64 do QR Code
      const resConectar = await fetch(`${this.baseUrl}/instance/connect/${nome}`, {
        method: 'GET',
        headers: this.headers
      })

      const conexao = await resConectar.json()
      if (conexao.base64) {
        return { 
          sucesso: true, 
          mensagem: 'Escaneie o QR Code no WhatsApp',
          qrCode: conexao.base64
        }
      }

      // Se já estava conectado
      return { sucesso: true, mensagem: 'Instância já pareada!' }

    } catch (e: any) {
      return { sucesso: false, mensagem: `Falha na Evolution: ${e.message}` }
    }
  }

  async desconectar(credenciais: any) {
    if (!credenciais?.nomeInstancia) return
    
    try {
      await fetch(`${this.baseUrl}/instance/logout/${credenciais.nomeInstancia}`, {
        method: 'DELETE',
        headers: this.headers
      })
      await fetch(`${this.baseUrl}/instance/delete/${credenciais.nomeInstancia}`, {
        method: 'DELETE',
        headers: this.headers
      })
    } catch (e: any) {
      console.error('Falha ao desconectar instância Evolution', e.message)
    }
  }

  async enviarMensagemDeTexto(para: string, texto: string, credenciais: any): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/message/sendText/${credenciais.nomeInstancia}`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          number: para,
          text: texto
        })
      })
      return res.ok
    } catch (e: any) {
      console.error('Erro ao enviar txt via Evolution', e.message)
      return false
    }
  }

  async enviarDocumento(para: string, arquivoUrl: string, nomeArquivo: string, legenda: string, credenciais: any): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/message/sendMedia/${credenciais.nomeInstancia}`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          number: para,
          mediatype: 'document',
          mimetype: 'application/pdf',
          caption: legenda,
          media: arquivoUrl, // Pode ser base64 ou URL pública
          fileName: nomeArquivo
        })
      })
      return res.ok
    } catch (e: any) {
      console.error('Erro ao enviar pdf via Evolution', e.message)
      return false
    }
  }

  interpretarWebhook(payload: any): EventoRecebido[] {
    const eventos: EventoRecebido[] = []
    
    // O Webhook da Evolution (evento messages.upsert)
    if (payload && payload.event === 'messages.upsert' && payload.data) {
      const msg = payload.data.message
      // Ignora msg enviada pelo proprio bot ou msg de sistema
      if (msg && !payload.data.key.fromMe) {
        let texto = ''
        if (msg.conversation) texto = msg.conversation
        else if (msg.extendedTextMessage?.text) texto = msg.extendedTextMessage.text

        const senderId = payload.data.key.remoteJid?.split('@')[0]
        
        if (senderId && texto) {
          eventos.push({
            canal: 'whatsapp_evolution',
            identidadeExterna: senderId,
            conteudoTexto: texto,
            rawPayload: payload
          })
        }
      }
    }
    
    return eventos
  }
}
