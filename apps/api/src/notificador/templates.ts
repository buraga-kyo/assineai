export type TemplateOutput = { assunto: string; texto: string; html: string }

export function convite(nomeRemetente: string, nomeDocumento: string, link: string): TemplateOutput {
  return {
    assunto: `Convite para assinar: ${nomeDocumento}`,
    texto: `Olá,\n\nVocê foi convidado por ${nomeRemetente} para assinar o documento "${nomeDocumento}".\n\nAcesse o link abaixo para assinar:\n${link}\n\nObrigado,\nEquipe AssineAi`,
    html: `<p>Olá,</p><p>Você foi convidado por <b>${nomeRemetente}</b> para assinar o documento <b>${nomeDocumento}</b>.</p><p><a href="${link}">Clique aqui para assinar</a></p><p>Obrigado,<br>Equipe AssineAi</p>`,
  }
}

export function codigo(nomeDocumento: string, otp: string): TemplateOutput {
  return {
    assunto: `Código de verificação para assinar: ${nomeDocumento}`,
    texto: `Olá,\n\nSeu código de verificação para assinar o documento "${nomeDocumento}" é:\n\n${otp}\n\nO código expira em breve.\n\nObrigado,\nEquipe AssineAi`,
    html: `<p>Olá,</p><p>Seu código de verificação para assinar o documento <b>${nomeDocumento}</b> é:</p><h2 style="letter-spacing: 4px;">${otp}</h2><p>O código expira em breve.</p><p>Obrigado,<br>Equipe AssineAi</p>`,
  }
}

export function confirmacao(nomeDocumento: string, link: string): TemplateOutput {
  return {
    assunto: `Documento finalizado: ${nomeDocumento}`,
    texto: `Olá,\n\nO documento "${nomeDocumento}" foi assinado por todos e está finalizado.\n\nAcesse o documento final no link abaixo:\n${link}\n\nObrigado,\nEquipe AssineAi`,
    html: `<p>Olá,</p><p>O documento <b>${nomeDocumento}</b> foi assinado por todos e está finalizado.</p><p><a href="${link}">Acessar documento final</a></p><p>Obrigado,<br>Equipe AssineAi</p>`,
  }
}

export function aviso(titulo: string, mensagem: string): TemplateOutput {
  return {
    assunto: titulo,
    texto: `Olá,\n\n${mensagem}\n\nObrigado,\nEquipe AssineAi`,
    html: `<p>Olá,</p><p>${mensagem}</p><p>Obrigado,<br>Equipe AssineAi</p>`,
  }
}

export function senha(link: string): TemplateOutput {
  return {
    assunto: `Recuperação de acesso`,
    texto: `Olá,\n\nRecebemos um pedido para recuperação de acesso.\n\nAcesse o link abaixo para definir sua nova senha:\n${link}\n\nObrigado,\nEquipe AssineAi`,
    html: `<p>Olá,</p><p>Recebemos um pedido para recuperação de acesso.</p><p><a href="${link}">Clique aqui para definir sua nova senha</a></p><p>Obrigado,<br>Equipe AssineAi</p>`,
  }
}