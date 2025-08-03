const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
//const { SignPdf } = require('node-signpdf');
const { plainAddPlaceholder } = require('node-signpdf/dist/helpers');
const forge = require('node-forge');
const { execSync } = require('child_process');
const signpdf = require('@signpdf/signpdf');

const app = express();
const port = 3000;

const { PDFDocument } = require('pdf-lib');
const { SignPdf } = require('node-signpdf');
    // Caminho para o certificado (exemplo com PFX)


/** 
 * Exemplo simplificado para testar a assinatura digital de PDF
 */

const PdfSignatureService = require('./AssinarPDF');

async function main() {
  try {
    console.log('Iniciando processo de assinatura...');
    
    // Cria instância do serviço
    const signatureService = new PdfSignatureService();
    
    // Caminhos dos arquivos (ajuste para seus caminhos reais)
    const certificatePath = path.resolve('/home/bragaus/Documentos/AssineAi/ASSINATURA_BACKEND/ModuloDoServidor/Arquivos/Permanente/cert.pfx');
    const pdfPath = path.resolve('/home/bragaus/Downloads/documento.pdf');
    const outputPath = path.resolve(__dirname, 'documento_assinado.pdf');
    
    // Senha do certificado
    const certificatePassword = 'dwith2024';  // Substitua pela senha real
    
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



/*

class PDFSigner {
  constructor() {
    this.signPdf = new SignPdf();
  }

  async signPDF(pdfBuffer, certData, keyData, password) {
    // Carregar certificado e chave
    const { privateKey, certificate } = await this.loadCertificate(
      certData,
      keyData,
      password
    );

    // Criar assinatura CMS
    const signature = await this.createCMSSignature(pdfBuffer, privateKey, certificate);

    // Inserir assinatura no PDF
    return this.signPdf.sign(pdfBuffer, signature);
  }

  async loadCertificate(certData, keyData, password) {
    if (certData.includes('-----BEGIN PKCS7-----')) {
      return this.loadPEM(certData, keyData);
    } else {
      return this.loadPFX(certData, password);
    }
  }

  async loadPFX(pfxData, password) {
    const p12Asn1 = forge.asn1.fromDer(pfxData.toString('binary'), false);
    const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, password);

    // Extrair certificado e chave
    const certBag = p12.getBags({ bagType: forge.pki.oids.certBag })[forge.pki.oids.certBag][0];
    const keyBag = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag })[forge.pki.oids.pkcs8ShroudedKeyBag][0];

    return {
      certificate: forge.pki.certificateToPem(certBag.cert),
      privateKey: forge.pki.privateKeyToPem(keyBag.key)
    };
  }

  async createCMSSignature(content, privateKey, certificate) {
    const p7 = forge.pkcs7.createSignedData();
    p7.content = forge.util.createBuffer(content);
    p7.addCertificate(certificate);
    p7.addSigner({
      key: privateKey,
      certificate,
      digestAlgorithm: forge.pki.oids.sha256,
      authenticatedAttributes: [
        {
          type: forge.pki.oids.contentType,
          value: forge.pki.oids.data
        },
        {
          type: forge.pki.oids.messageDigest
        },
        {
          type: forge.pki.oids.signingTime,
          value: new Date()
        }
      ]
    });

    p7.sign();
    return forge.asn1.toDer(p7.toAsn1()).getBytes();
  }
}

const signer = new PDFSigner();

const pdfBuffer = fs.readFileSync('C:\\Users\\dwith\\Downloads\\teste.pdf');
const certBuffer = fs.readFileSync('C:\\Users\\dwith\\Downloads\\certificado.pfx');

signer.signPDF(pdfBuffer, certBuffer, null, 'dwith2024')
  .then((signedPdf) => {
    fs.writeFileSync('documento_assinado.pdf', signedPdf);
  });


// Configuração de armazenamento temporário para os arquivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// Middleware para parsing de JSON
app.use(express.json());

// Método alternativo para converter PFX para PEM usando OpenSSL
function convertPfxToPemWithOpenSSL(pfxPath, password) {
  try {
    // Criar diretório temporário para arquivos PEM
    const tempDir = path.join(__dirname, 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const certPath = path.join(tempDir, `cert-${Date.now()}.pem`);
    const keyPath = path.join(tempDir, `key-${Date.now()}.pem`);

    // Extrair certificado
    execSync(`openssl pkcs12 -in "${pfxPath}" -clcerts -nokeys -out "${certPath}" -password pass:"${password}"`);
    
    // Extrair chave privada
    execSync(`openssl pkcs12 -in "${pfxPath}" -nocerts -out "${keyPath}" -password pass:"${password}" -passout pass:"${password}"`);
    
    // Remover a senha da chave privada, se necessário
    const keyWithoutPass = path.join(tempDir, `key-nopass-${Date.now()}.pem`);
    execSync(`openssl rsa -in "${keyPath}" -out "${keyWithoutPass}" -passin pass:"${password}"`);
    
    // Ler os arquivos
    const cert = fs.readFileSync(certPath, 'utf-8');
    const key = fs.readFileSync(keyWithoutPass, 'utf-8');
    
    // Limpar arquivos temporários
    fs.unlinkSync(certPath);
    fs.unlinkSync(keyPath);
    fs.unlinkSync(keyWithoutPass);
    
    return { certificate: cert, privateKey: key };
  } catch (error) {
    console.error('Erro ao converter PFX usando OpenSSL:', error);
    throw new Error(`Falha ao converter PFX com OpenSSL: ${error.message}`);
  }
}

// Função para converter PFX para PEM usando node-forge
function convertPfxToPemWithForge(pfxBuffer, password) {
  try {
    const p12 = forge.pkcs12.pkcs12FromAsn1(
      forge.asn1.fromDer(forge.util.createBuffer(pfxBuffer)),
      password || ''
    );

    // Extrair certificados
    const certBags = p12.getBags({ bagType: forge.pki.oids.certBag })[forge.pki.oids.certBag];
    if (!certBags || certBags.length === 0) {
      throw new Error('Nenhum certificado encontrado no arquivo PFX');
    }
    const certificate = forge.pki.certificateToPem(certBags[0].cert);

    // Extrair chave privada
    const keyBags = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag })[forge.pki.oids.pkcs8ShroudedKeyBag] ||
                    p12.getBags({ bagType: forge.pki.oids.keyBag })[forge.pki.oids.keyBag];
    
    if (!keyBags || keyBags.length === 0) {
      throw new Error('Nenhuma chave privada encontrada no arquivo PFX');
    }
    
    const privateKey = forge.pki.privateKeyToPem(keyBags[0].key);

    return {
      certificate,
      privateKey
    };
  } catch (error) {
    console.error('Erro ao converter PFX usando node-forge:', error);
    throw new Error(`Falha ao extrair certificado com node-forge: ${error.message}`);
  }
}

// Rota para carregar PDF e certificado e realizar a assinatura
app.post('/sign', upload.fields([
  { name: 'pdf', maxCount: 1 },
  { name: 'certificate', maxCount: 1 }
]), async (req, res) => {
  // Variáveis para armazenar caminhos de arquivos temporários
  const tempFiles = [];
  
  try {
    // Verificar se os arquivos foram enviados
    if (!req.files.pdf || !req.files.certificate) {
      return res.status(400).json({ 
        success: false, 
        message: 'É necessário enviar um PDF e um certificado' 
      });
    }

    const pdfPath = req.files.pdf[0].path;
    tempFiles.push(pdfPath);
    
    const certPath = req.files.certificate[0].path;
    tempFiles.push(certPath);
    
    const password = req.body.password || '';
    const certificateType = path.extname(req.files.certificate[0].originalname).toLowerCase();

    // Processar o certificado
    let certificatePem;
    let privateKeyPem;

    try {
      if (certificateType === '.pfx' || certificateType === '.p12') {
        // Tentar primeiro com node-forge
        try {
          const pfxBuffer = fs.readFileSync(certPath);
          const result = convertPfxToPemWithForge(pfxBuffer, password);
          certificatePem = result.certificate;
          privateKeyPem = result.privateKey;
          console.log("Certificado convertido com sucesso usando node-forge");
        } catch (forgeError) {
          console.warn("Falha ao usar node-forge, tentando com OpenSSL:", forgeError.message);
          
          // Se falhar, tenta com OpenSSL
          const result = convertPfxToPemWithOpenSSL(certPath, password);
          certificatePem = result.certificate;
          privateKeyPem = result.privateKey;
          console.log("Certificado convertido com sucesso usando OpenSSL");
        }
      } else if (certificateType === '.pem') {
        // Ler diretamente o arquivo PEM
        const pemContent = fs.readFileSync(certPath, 'utf-8');
        
        // Extrair certificado e chave privada do PEM
        const certMatches = pemContent.match(/-+BEGIN CERTIFICATE-+[\s\S]*?-+END CERTIFICATE-+/g);
        const keyMatches = pemContent.match(/-+BEGIN PRIVATE KEY-+[\s\S]*?-+END PRIVATE KEY-+/g) || 
                          pemContent.match(/-+BEGIN RSA PRIVATE KEY-+[\s\S]*?-+END RSA PRIVATE KEY-+/g) ||
                          pemContent.match(/-+BEGIN ENCRYPTED PRIVATE KEY-+[\s\S]*?-+END ENCRYPTED PRIVATE KEY-+/g);
        
        if (!certMatches || !keyMatches) {
          return res.status(400).json({ 
            success: false, 
            message: 'O arquivo PEM deve conter tanto o certificado quanto a chave privada' 
          });
        }
        
        certificatePem = certMatches[0];
        privateKeyPem = keyMatches[0];

        // Se a chave for encriptada e tivermos uma senha, tentar desencriptar
        if (privateKeyPem.includes('ENCRYPTED') && password) {
          try {
            // Salvar a chave encriptada em um arquivo temporário
            const encKeyPath = path.join(__dirname, 'temp', `enc-key-${Date.now()}.pem`);
            fs.writeFileSync(encKeyPath, privateKeyPem);
            tempFiles.push(encKeyPath);
            
            // Desencriptar usando OpenSSL
            const decKeyPath = path.join(__dirname, 'temp', `dec-key-${Date.now()}.pem`);
            execSync(`openssl rsa -in "${encKeyPath}" -out "${decKeyPath}" -passin pass:"${password}"`);
            tempFiles.push(decKeyPath);
            
            // Ler a chave desencriptada
            privateKeyPem = fs.readFileSync(decKeyPath, 'utf-8');
          } catch (decryptError) {
            return res.status(400).json({
              success: false,
              message: 'Não foi possível desencriptar a chave privada com a senha fornecida',
              error: decryptError.message
            });
          }
        }
      } else {
        return res.status(400).json({ 
          success: false, 
          message: 'Formato de certificado não suportado. Use PFX ou PEM' 
        });
      }

      // Verificar se conseguimos extrair o certificado e a chave
      if (!certificatePem || !privateKeyPem) {
        throw new Error('Não foi possível extrair o certificado ou a chave privada');
      }
    } catch (certError) {
      return res.status(400).json({
        success: false,
        message: 'Erro ao processar o certificado',
        error: certError.message
      });
    }

    // Criar arquivo PEM temporário contendo certificado e chave
    const pemPath = path.join(__dirname, 'temp', `complete-${Date.now()}.pem`);
    if (!fs.existsSync(path.dirname(pemPath))) {
      fs.mkdirSync(path.dirname(pemPath), { recursive: true });
    }
    fs.writeFileSync(pemPath, certificatePem + '\n' + privateKeyPem);
    tempFiles.push(pemPath);

    // Ler o PDF
    let pdfBuffer = fs.readFileSync(pdfPath);

    try {
      // Adicionar placeholder para assinatura
      pdfBuffer = await plainAddPlaceholder({
        pdfBuffer,
        signatureLength: 8192,
        reason: req.body.reason || 'Assinatura Digital',
        location: req.body.location || 'Brasil',
        contactInfo: req.body.contactInfo || 'contato@empresa.com',
        name: req.body.name || 'Assinador',
      });

      // Assinar o PDF
      //const signer = new SignPdf();

      console.log(signpdf);
      const assinar = new signpdf.SignPdf();
      console.log(fs.readFileSync(pemPath))
      const signedPdf = assinar.sign(pdfBuffer, fs.readFileSync(pemPath));

      // Salvar o PDF assinado
      if (!fs.existsSync(path.join(__dirname, 'outputs'))) {
        fs.mkdirSync(path.join(__dirname, 'outputs'), { recursive: true });
      }
      const outputPath = path.join(__dirname, 'outputs', `signed-${Date.now()}.pdf`);
      fs.writeFileSync(outputPath, signedPdf);
      tempFiles.push(outputPath);

      // Retornar o PDF assinado
      res.download(outputPath, `documento-assinado.pdf`, (err) => {
        if (err) {
          console.error('Erro ao baixar o arquivo:', err);
        }
      });
    } catch (signError) {
      return res.status(500).json({
        success: false,
        message: 'Erro ao assinar o PDF',
        error: signError.message
      });
    }

  } catch (error) {
    console.error('Erro ao processar a assinatura:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao processar a assinatura', 
      error: error.message 
    });
  } finally {
    // Limpar todos os arquivos temporários
    tempFiles.forEach(file => {
      try {
        if (fs.existsSync(file)) {
          fs.unlinkSync(file);
        }
      } catch (e) {
        console.error(`Erro ao excluir arquivo temporário ${file}:`, e);
      }
    });
  }
});

// Rota para verificar PDF assinado
app.post('/verify', upload.single('pdf'), (req, res) => {
  const tempFiles = [];
  
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'É necessário enviar um PDF para verificação' 
      });
    }

    const pdfPath = req.file.path;
    tempFiles.push(pdfPath);
    
    // Verificar a assinatura do PDF
    try {
      const pdfBuffer = fs.readFileSync(pdfPath);
      // Use o método estático de verificação
      const signer = new SignPdf();
      
      // Se o PDF tiver uma assinatura, a extração não gerará erro
      // Esta é uma verificação básica de presença de assinatura
      const signatureHex = signer.extractSignature(pdfBuffer);
      
      res.json({
        success: true,
        message: 'PDF contém uma assinatura',
        isValid: true
      });
    } catch (error) {
      res.json({
        success: false,
        message: 'PDF não possui uma assinatura válida',
        error: error.message
      });
    }
  } catch (error) {
    console.error('Erro ao verificar o PDF:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao verificar o PDF', 
      error: error.message 
    });
  } finally {
    // Limpar todos os arquivos temporários
    tempFiles.forEach(file => {
      try {
        if (fs.existsSync(file)) {
          fs.unlinkSync(file);
        }
      } catch (e) {
        console.error(`Erro ao excluir arquivo temporário ${file}:`, e);
      }
    });
  }
});*/

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});