import { createHash } from 'node:crypto'
import { eq, desc } from 'drizzle-orm'
import { evidencia } from '../banco/esquema/evidencia.js'
import type { BancoDaEmpresa } from '../banco/conexao.js'

type DadosEvidencia = {
  empresaId: string
  envelopeId: string
  signatarioId?: string
  tipo: string
  ipServidor: string
  userAgent?: string
  mensagemId?: string
  canal?: string
  dadosDeclarados?: any
  horaProvedor?: Date
}

export async function registrarEvidencia(banco: BancoDaEmpresa, dados: DadosEvidencia) {
  // Pega a última evidência para o encadeamento
  const ultima = await banco.select({ hashAtual: evidencia.hashAtual })
    .from(evidencia)
    .where(eq(evidencia.envelopeId, dados.envelopeId))
    .orderBy(desc(evidencia.criadoEm))
    .limit(1)

  const hashAnterior = ultima.length > 0 ? ultima[0]!.hashAtual : null

  const payloadString = JSON.stringify({
    envelopeId: dados.envelopeId,
    signatarioId: dados.signatarioId,
    tipo: dados.tipo,
    ipServidor: dados.ipServidor,
    dadosDeclarados: dados.dadosDeclarados,
    hashAnterior
  })

  const hashAtual = createHash('sha256').update(payloadString).digest('hex')

  const [inserida] = await banco.insert(evidencia).values({
    ...dados,
    hashAnterior,
    hashAtual
  }).returning()

  return inserida
}

export async function verificarCadeia(banco: BancoDaEmpresa, envelopeId: string) {
  const todas = await banco.select()
    .from(evidencia)
    .where(eq(evidencia.envelopeId, envelopeId))
    .orderBy(evidencia.criadoEm) // Ordem cronológica
  
  let hashEsperadoAnterior: string | null = null

  for (const ev of todas) {
    if (ev.hashAnterior !== hashEsperadoAnterior) {
      return { integro: false, erro: `Quebra de cadeia na evidência ${ev.id}: hashAnterior não bate.` }
    }

    const payloadString: string = JSON.stringify({
      envelopeId: ev.envelopeId,
      signatarioId: ev.signatarioId,
      tipo: ev.tipo,
      ipServidor: ev.ipServidor,
      dadosDeclarados: ev.dadosDeclarados,
      hashAnterior: ev.hashAnterior
    })

    const hashCalculado: string = createHash('sha256').update(payloadString).digest('hex')

    if (hashCalculado !== ev.hashAtual) {
      return { integro: false, erro: `Adulteração na evidência ${ev.id}: hashAtual recalculado não bate.` }
    }

    hashEsperadoAnterior = ev.hashAtual
  }

  return { integro: true, erro: null }
}
