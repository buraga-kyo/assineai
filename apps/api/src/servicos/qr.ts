import QRCode from 'qrcode'

export async function gerarQrEmMemoria(codigoPublico: string): Promise<Buffer> {
  const appUrl = process.env.URL_APP || 'http://localhost:5173'
  const link = `${appUrl}/v/${codigoPublico}`
  
  // O qrcode.toBuffer retorna um PNG por padrão
  return await QRCode.toBuffer(link, {
    errorCorrectionLevel: 'M',
    margin: 1,
    width: 200
  })
}
