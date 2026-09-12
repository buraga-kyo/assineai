import type { ICanal, EventoRecebido } from './interface.js'
import { carregarConfigOuSair } from '../config.js'
import { createHmac } from 'node:crypto'

export class CanalSlack implements ICanal {
  
  async parear(credenciais: any) {
    if (!credenciais || !credenciais.botToken) {
      return { sucesso: false, mensagem: 'Bot Token do Slack obrigatório' }
    }
    
    try {
      const res = await fetch('https://slack.com/api/auth.test', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${credenciais.botToken}`
        }
      })
      const auth = await res.json()
      if (auth.ok) {
        return { 
          sucesso: true, 
          mensagem: `Conectado ao workspace ${auth.team} como ${auth.user}`
        }
      } else {
        return { sucesso: false, mensagem: `Falha no Slack: ${auth.error}` }
      }
    } catch (e: any) {
      return { sucesso: false, mensagem: `Falha ao conectar no Slack: ${e.message}` }
    }
  }

  async desconectar(credenciais: any) {
    // Apenas apaga do nosso banco
  }

  async enviarMensagemDeTexto(para: string, texto: string, credenciais: any): Promise<boolean> {
    try {
      const res = await fetch('https://slack.com/api/chat.postMessage', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${credenciais.botToken}`,
          'Content-Type': 'application/json; charset=utf-8'
        },
        body: JSON.stringify({
          channel: para,
          text: texto
        })
      })
      
      const json = await res.json()
      if (!json.ok) console.error('Slack erro texto:', json.error)
      return json.ok
    } catch (e: any) {
      console.error('Erro de request Slack', e.message)
      return false
    }
  }

  async enviarDocumento(para: string, arquivoUrl: string, nomeArquivo: string, legenda: string, credenciais: any): Promise<boolean> {
    try {
      // Como o Slack pede upload multipart ou baixar antes de enviar, no MVP vamos tentar enviar a URL pro arquivo
      // Para enviar como attachment de verdade precisaríamos baixar o PDF ou mandar o stream pro files.uploadV2
      // Pro MVP: Manda como attachment com title_link
      const res = await fetch('https://slack.com/api/chat.postMessage', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${credenciais.botToken}`,
          'Content-Type': 'application/json; charset=utf-8'
        },
        body: JSON.stringify({
          channel: para,
          text: legenda,
          attachments: [
            {
              fallback: nomeArquivo,
              title: nomeArquivo,
              title_link: arquivoUrl,
              text: 'Clique para abrir o documento'
            }
          ]
        })
      })

      const json = await res.json()
      if (!json.ok) console.error('Slack erro doc:', json.error)
      return json.ok
    } catch (e: any) {
      console.error('Erro de request Slack doc', e.message)
      return false
    }
  }

  interpretarWebhook(payload: any): EventoRecebido[] {
    const eventos: EventoRecebido[] = []
    
    // Slack envia url_verification na hora de configurar o Event Subscriptions
    if (payload && payload.type === 'url_verification') {
      // Isso na verdade deveria ser respondido direto pela rota, mas o nosso modelo foca nos eventos
      return eventos
    }

    if (payload && payload.type === 'event_callback' && payload.event) {
      const ev = payload.event
      // Filtra pra aceitar msg do usuario (ignorar msg do proprio bot)
      if (ev.type === 'message' && !ev.bot_id) {
        const senderId = ev.user
        const texto = ev.text || ''
        
        if (senderId && texto) {
          eventos.push({
            canal: 'slack',
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
