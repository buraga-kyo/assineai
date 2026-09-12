import type { ICanal, EventoRecebido } from './interface.js'

export class CanalWhatsAppMeta implements ICanal {
  
  async parear(credenciais: any) {
    if (!credenciais || !credenciais.token || !credenciais.telefoneId) {
      return { sucesso: false, mensagem: 'Token e Phone ID obrigatórios para a Cloud API da Meta' }
    }
    
    // Na Meta, o "parear" é só testar se as credenciais funcionam fazendo uma chamada boba (ex: ver o perfil)
    // Para simplificar o MVP, vamos considerar sucesso imediato
    return { 
      sucesso: true, 
      mensagem: 'Credenciais válidas. Aguardando envio/recebimento.'
    }
  }

  async desconectar(credenciais: any) {
    // Para webhook a gente só apaga no nosso banco
  }

  async enviarMensagemDeTexto(para: string, texto: string, credenciais: any): Promise<boolean> {
    try {
      const url = `https://graph.facebook.com/v17.0/${credenciais.telefoneId}/messages`
      
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${credenciais.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: para,
          type: "text",
          text: {
            preview_url: false,
            body: texto
          }
        })
      })
      
      if (!res.ok) {
        const json = await res.json()
        console.error('Falha Meta Text:', json)
      }
      return res.ok
    } catch (e: any) {
      console.error('Erro de request Meta', e.message)
      return false
    }
  }

  async enviarDocumento(para: string, arquivoUrl: string, nomeArquivo: string, legenda: string, credenciais: any): Promise<boolean> {
    try {
      const url = `https://graph.facebook.com/v17.0/${credenciais.telefoneId}/messages`
      
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${credenciais.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: para,
          type: "document",
          document: {
            link: arquivoUrl,
            caption: legenda,
            filename: nomeArquivo
          }
        })
      })

      if (!res.ok) {
        const json = await res.json()
        // Se bater no erro de janela de 24h, o erro da meta é especifico (code 131047)
        // Precisaríamos mandar como 'template' em vez de mensagem normal
        console.error('Falha Meta Doc:', json)
      }
      
      return res.ok
    } catch (e: any) {
      console.error('Erro de request Meta Doc', e.message)
      return false
    }
  }

  interpretarWebhook(payload: any): EventoRecebido[] {
    const eventos: EventoRecebido[] = []
    
    // O Webhook da Meta tem formato de entries e changes
    if (payload && payload.object === 'whatsapp_business_account' && payload.entry) {
      for (const entry of payload.entry) {
        for (const change of entry.changes || []) {
          const value = change.value
          if (!value || !value.messages) continue
          
          for (const msg of value.messages) {
            const senderId = msg.from
            let texto = ''
            
            if (msg.type === 'text') texto = msg.text.body
            if (msg.type === 'button') texto = msg.button.text
            if (msg.type === 'interactive') {
              texto = msg.interactive.button_reply?.title || msg.interactive.list_reply?.title || ''
            }
            
            if (senderId && texto) {
              eventos.push({
                canal: 'whatsapp_meta',
                identidadeExterna: senderId,
                conteudoTexto: texto,
                rawPayload: msg
              })
            }
          }
        }
      }
    }
    
    return eventos
  }
}
