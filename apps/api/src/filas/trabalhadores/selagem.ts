import { criarFila, criarWorker, type ComoEmpresa } from '../config.js'
import { criarLogger } from '../../logger.js'
import { carregarConfigOuSair } from '../../config.js'
import { criarClienteS3 } from '../../storage/s3.js'
import { eq, and } from 'drizzle-orm'
import { envelopes, documentosEnvelope, signatariosEnvelope } from '../../banco/esquema/envelope.js'
import { evidencia } from '../../banco/esquema/evidencia.js'
import { criarSelador } from '@assineai/assinatura'
import { adicionarQrELinkDeVerificacao, carimbarDocumento, adicionarRelatorioAoPdf, type DadosCarimbo } from '../../servicos/pdf.js'
import { gerarQrEmMemoria } from '../../servicos/qr.js'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs'
import path from 'node:path'
import { createHash } from 'node:crypto'

const config = carregarConfigOuSair()
const log = criarLogger(config)

export const FILA_SELAGEM = 'selagem'
export const filaSelagem = criarFila(FILA_SELAGEM)

// Resolve o caminho do certificado de testes ou de um ambiente
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const certPfx = path.resolve(__dirname, '../../../../../../Arquivos/Permanente/cert-teste.pfx')
const certSenha = 'teste'
const jarPath = path.resolve(__dirname, '../../../../../../Arquivos/Permanente/JSignPdf.jar')

const temCertificado = fs.existsSync(certPfx) && fs.existsSync(jarPath)

export function criarWorkerSelagem(comoEmpresa: ComoEmpresa) {
  const armazenamento = criarClienteS3(config)
  const selador = criarSelador({ jar: jarPath })

  return criarWorker(
    FILA_SELAGEM,
    comoEmpresa,
    async (job, banco) => {
      const { envelopeId, empresaId } = job.data as { envelopeId: string; empresaId: string }
      log.info({ jobId: job.id, empresaId, envelopeId }, 'Processando selagem de PDF')

      const [env] = await banco.select().from(envelopes).where(and(eq(envelopes.id, envelopeId), eq(envelopes.empresaId, empresaId)))
      if (!env) throw new Error('Envelope não encontrado para selagem')

      const documentos = await banco.select().from(documentosEnvelope).where(eq(documentosEnvelope.envelopeId, envelopeId))
      const signatarios = await banco.select().from(signatariosEnvelope).where(eq(signatariosEnvelope.envelopeId, envelopeId))
      const evidencias = await banco.select().from(evidencia).where(eq(evidencia.envelopeId, envelopeId))

      // Filtra só assinaturas válidas
      const evsAssinatura = evidencias.filter(e => e.tipo === 'assinatura_concluida')

      const tsa = config.TSA_URL ? ({
        url: config.TSA_URL,
        ...(config.TSA_USUARIO ? { usuario: config.TSA_USUARIO } : {}),
        ...(config.TSA_SENHA ? { senha: config.TSA_SENHA } : {})
      }) : undefined

      for (const doc of documentos) {
        // 1. Baixa o PDF original
        log.info({ documentoId: doc.id }, 'Baixando documento do S3 para selar')
        let pdfBytes = await armazenamento.baixarArquivo(doc.caminhoStorage)

        // 2. Adiciona o QR Code de Verificação
        const qrBuffer = await gerarQrEmMemoria(env.codigoPublico || envelopeId)
        pdfBytes = Buffer.from(await adicionarQrELinkDeVerificacao(pdfBytes, env.codigoPublico || envelopeId, qrBuffer))

        // 3. Monta e insere os carimbos no PDF
        const carimbos: DadosCarimbo[] = []
        for (let i = 0; i < signatarios.length; i++) {
          const sig = signatarios[i]!
          const ev = evsAssinatura.find(e => e.signatarioId === sig.id)
          if (!ev) continue

          carimbos.push({
            pagina: 1, // Fixando carimbo na página 1 no MVP
            proporcaoX: 0.1,
            proporcaoY: 0.1 + (i * 0.1), // Espalhando verticalmente
            nome: sig.nome,
            canal: ev.userAgent || 'Desconhecido',
            dataHora: ev.criadoEm.toISOString(),
            codigo: env.codigoPublico || envelopeId,
            hashPedaço: ev.hashAtual || 'hash_seguro'
          })
        }
        
        if (carimbos.length > 0) {
          pdfBytes = Buffer.from(await carimbarDocumento(pdfBytes, carimbos))
        }

        // 3.5 Adiciona o Relatório de Assinatura no Final
        log.info('Anexando página de relatório com a cara da empresa')
        pdfBytes = Buffer.from(await adicionarRelatorioAoPdf(pdfBytes, env, signatarios, evidencias, null, qrBuffer))

        // 4. Sela com ICP/JSignPdf (Criptografia) se o ambiente tiver o jar e cert
        let pdfFinal = pdfBytes
        if (temCertificado) {
          log.info('Aplicando selo criptográfico com JSignPdf')
          const selo = await selador.selar({
            entrada: pdfBytes,
            certificado: { arquivo: certPfx, senha: certSenha },
            razao: 'Assinatura digital via AssineAi',
            local: 'AssineAi Cloud',
            contato: 'suporte@assine.ai',
            ...(tsa ? { tsa } : {})
          })
          pdfFinal = selo.saida
        } else {
          log.warn('Certificado de teste ou JSignPdf não encontrados, pulando selo criptográfico real')
        }

        // 5. Calcula o hash final e sobe para o S3
        const hashFinal = createHash('sha256').update(pdfFinal).digest('hex')
        const caminhoFinal = `empresa/${empresaId}/envelope/${envelopeId}/documento/${doc.id}/final.pdf`
        
        await armazenamento.enviarArquivo(caminhoFinal, pdfFinal, 'application/pdf')

        // 6. Atualiza registro do documento
        await banco.update(documentosEnvelope)
          .set({ hashFinal, caminhoStorage: caminhoFinal })
          .where(eq(documentosEnvelope.id, doc.id))
      }

      // 7. Marca envelope como assinado/concluido
      await banco.update(envelopes).set({ estado: 'assinado' }).where(eq(envelopes.id, envelopeId))
      
      log.info({ envelopeId }, 'Envelope selado com sucesso')
      const { filaNotificacoes } = await import('./notificacoes.js')
      await filaNotificacoes.add('aviso_dono', {
        empresaId,
        envelopeId,
        motivo: 'assinado'
      })
    },
    { concurrency: 1 } // Garantir que selagem seja sequencial (um por vez por causa de CPU/memória)
  )
}
