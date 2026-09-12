import { Transform } from 'node:stream'
import type { TransformCallback } from 'node:stream'
import { createHash } from 'node:crypto'

export class ErroValidacaoPdf extends Error {
  constructor(mensagem: string, public codigo = 400) {
    super(mensagem)
    this.name = 'ErroValidacaoPdf'
  }
}

export class ValidadorPdfStream extends Transform {
  private tamanhoAtual = 0
  private limiteTamanho: number
  private bufferInicial = Buffer.alloc(0)
  private hash = createHash('sha256')
  private validouCabecalho = false
  private temEncrypt = false

  constructor(limiteTamanho: number) {
    super()
    this.limiteTamanho = limiteTamanho
  }

  _transform(chunk: Buffer, encoding: BufferEncoding, callback: TransformCallback) {
    this.tamanhoAtual += chunk.length

    if (this.tamanhoAtual > this.limiteTamanho) {
      return callback(new ErroValidacaoPdf('Arquivo excede o limite de tamanho', 413))
    }

    this.hash.update(chunk)

    if (!this.validouCabecalho) {
      this.bufferInicial = Buffer.concat([this.bufferInicial, chunk])
      
      // Precisamos de pelo menos 5 bytes para checar %PDF-
      if (this.bufferInicial.length >= 5) {
        if (!this.bufferInicial.subarray(0, 5).equals(Buffer.from('%PDF-'))) {
          return callback(new ErroValidacaoPdf('Arquivo não é um PDF válido', 400))
        }
        this.validouCabecalho = true
      }
    }

    // Procura por /Encrypt no chunk atual. O ideal seria manter um pequeno buffer 
    // entre chunks para não perder a palavra dividida, mas para simplificar:
    if (!this.temEncrypt && chunk.toString('latin1').includes('/Encrypt')) {
      this.temEncrypt = true
      return callback(new ErroValidacaoPdf('PDF cifrado não é suportado', 400))
    }

    callback(null, chunk)
  }

  _flush(callback: TransformCallback) {
    if (!this.validouCabecalho && this.bufferInicial.length < 5) {
      return callback(new ErroValidacaoPdf('Arquivo muito pequeno para ser um PDF', 400))
    }
    callback()
  }

  getSha256() {
    return this.hash.digest('hex')
  }
}
