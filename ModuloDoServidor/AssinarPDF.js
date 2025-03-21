/**
 * Exemplo simplificado para testar a assinatura digital de PDF
 */

const fs = require('fs');
const path = require('path');
const PdfSignatureService = require('./PdfSignatureService');

async function main() {
  try {
    console.log('Iniciando processo de assinatura...');
    
    // Cria instância do serviço
    const signatureService = new PdfSignatureService();
    
    // Caminhos dos arquivos (ajuste para seus caminhos reais)
    const certificatePath = path.resolve(__dirname, 'certificado.pfx');
    const pdfPath = path.resolve(__dirname, 'documento.pdf');
    const outputPath = path.resolve(__dirname, 'documento_assinado.pdf');
    
    // Senha do certificado
    const certificatePassword = 'senha_do_certificado';  // Substitua pela senha real
    
    console.log('Lendo certificado e PDF...');
    
    // Lê explicitamente o certificado como Buffer
    const certificateBuffer = fs.readFileSync(certificatePath);
    console.log('Certificado carregado:', Buffer.isBuffer(certificateBuffer), certificateBuffer.length);
    
    // Configurações básicas
    const signOptions = {
      title: 'Documento Assinado',
      // Desabilitado para simplificar os testes iniciais
      addVisibleSignature: false
    };
    
    console.log('Assinando documento...');
    
    // Assina o PDF, passando o certificado como Buffer
    const signedPdf = await signatureService.signPdf(
      pdfPath,
      certificateBuffer,  // Certificado como Buffer
      certificatePassword,
      'pfx',
      signOptions
    );
    
    console.log('Salvando documento assinado...');
    fs.writeFileSync(outputPath, signedPdf);
    console.log(`Documento assinado salvo em: ${outputPath}`);
    
  } catch (error) {
    console.error('Erro durante o processo de assinatura:', error);
  }
}

main();