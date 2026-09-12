export interface EventoRecebido {
  canal: string
  identidadeExterna: string // Ex: telefone, user ID do telegram
  conteudoTexto?: string
  conteudoMidiaUrl?: string
  rawPayload: any
}

export interface CanalPareavel {
  parear(credenciais: any): Promise<{ qrCode?: string, sucesso: boolean, mensagem: string }>
  desconectar(credenciais: any): Promise<void>
}

export interface ICanal extends CanalPareavel {
  enviarMensagemDeTexto(para: string, texto: string, credenciais: any): Promise<boolean>
  enviarDocumento(para: string, arquivoUrl: string, nomeArquivo: string, legenda: string, credenciais: any): Promise<boolean>
  interpretarWebhook(payload: any): EventoRecebido[]
}
