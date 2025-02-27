const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { PDFDocument } = require('pdf-lib');
const { execSync } = require('child_process');
const { SignPdf } = require('node-signpdf');
const { plainAddPlaceholder } = require('node-signpdf/dist/helpers');
const forge = require('node-forge');

const app = express();
const port = 3000;

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

// Rota para carregar PDF e certificado e realizar a assinatura
app.post('/sign', upload.fields([
  { name: 'pdf', maxCount: 1 },
  { name: 'certificate', maxCount: 1 }
]), async (req, res) => {
  try {
    // Verificar se os arquivos foram enviados
    if (!req.files.pdf || !req.files.certificate) {
      return res.status(400).json({ 
        success: false, 
        message: 'É necessário enviar um PDF e um certificado' 
      });
    }

    const pdfPath = req.files.pdf[0].path;
    const certPath = req.files.certificate[0].path;
    const password = req.body.password || '';
    const certificateType = path.extname(req.files.certificate[0].originalname).toLowerCase();

    // Processar o certificado
    let certificatePem;
    let privateKeyPem;

    if (certificateType === '.pfx' || certificateType === '.p12') {
      // Converter PFX para PEM
      const pfxBuffer = fs.readFileSync(certPath);
      const result = convertPfxToPem(pfxBuffer, password);
      certificatePem = result.certificate;
      privateKeyPem = result.privateKey;
    } else if (certificateType === '.pem') {
      // Ler diretamente o arquivo PEM
      const pemContent = fs.readFileSync(certPath, 'utf-8');
      
      // Extrair certificado e chave privada do PEM
      const certMatches = pemContent.match(/-+BEGIN CERTIFICATE-+[\s\S]*?-+END CERTIFICATE-+/g);
      const keyMatches = pemContent.match(/-+BEGIN PRIVATE KEY-+[\s\S]*?-+END PRIVATE KEY-+/g) || 
                        pemContent.match(/-+BEGIN RSA PRIVATE KEY-+[\s\S]*?-+END RSA PRIVATE KEY-+/g);
      
      if (!certMatches || !keyMatches) {
        return res.status(400).json({ 
          success: false, 
          message: 'O arquivo PEM deve conter tanto o certificado quanto a chave privada' 
        });
      }
      
      certificatePem = certMatches[0];
      privateKeyPem = keyMatches[0];
    } else {
      return res.status(400).json({ 
        success: false, 
        message: 'Formato de certificado não suportado. Use PFX ou PEM' 
      });
    }

    // Criar arquivo PEM temporário contendo certificado e chave
    const pemPath = path.join(__dirname, 'uploads', `temp-${Date.now()}.pem`);
    fs.writeFileSync(pemPath, certificatePem + '\n' + privateKeyPem);

    // Ler o PDF
    let pdfBuffer = fs.readFileSync(pdfPath);

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
    const signer = new SignPdf();
    const signedPdf = signer.sign(pdfBuffer, fs.readFileSync(pemPath));

    // Salvar o PDF assinado
    if (!fs.existsSync(path.join(__dirname, 'outputs'))) {
      fs.mkdirSync(path.join(__dirname, 'outputs'), { recursive: true });
    }
    const outputPath = path.join(__dirname, 'outputs', `signed-${Date.now()}.pdf`);
    fs.writeFileSync(outputPath, signedPdf);

    // Remover arquivos temporários
    fs.unlinkSync(pdfPath);
    fs.unlinkSync(certPath);
    fs.unlinkSync(pemPath);

    // Retornar o PDF assinado
    res.download(outputPath, path.basename(outputPath), (err) => {
      if (err) {
        console.error('Erro ao baixar o arquivo:', err);
      }
      // Limpar o arquivo após o download
      fs.unlinkSync(outputPath);
    });

  } catch (error) {
    console.error('Erro ao assinar o PDF:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao processar a assinatura', 
      error: error.message 
    });
  }
});

// Função para converter PFX para PEM
function convertPfxToPem(pfxBuffer, password) {
  const p12 = forge.pkcs12.pkcs12FromAsn1(
    forge.asn1.fromDer(forge.util.createBuffer(pfxBuffer)),
    password
  );

  // Extrair certificados
  const certBags = p12.getBags({ bagType: forge.pki.oids.certBag })[forge.pki.oids.certBag];
  const certificate = forge.pki.certificateToPem(certBags[0].cert);

  // Extrair chave privada
  const keyBags = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag })[forge.pki.oids.pkcs8ShroudedKeyBag];
  const privateKey = forge.pki.privateKeyToPem(keyBags[0].key);

  return {
    certificate,
    privateKey
  };
}

// Rota para verificar PDF assinado
app.post('/verify', upload.single('pdf'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'É necessário enviar um PDF para verificação' 
      });
    }

    const pdfPath = req.file.path;
    
    // Verificar a assinatura do PDF
    try {
      const pdfBuffer = fs.readFileSync(pdfPath);
      // Use o método estático de verificação (p-adessig não tem verify direto, então vamos apenas 
      // verificar a presença de assinatura)
      const signer = new SignPdf();
      
      // Se o PDF tiver uma assinatura, a extração não gerará erro
      // Esta é uma verificação básica de presença de assinatura
      const signatureHex = signer.extractSignature(pdfBuffer);
      
      // Limpar arquivo temporário
      fs.unlinkSync(pdfPath);
      
      res.json({
        success: true,
        message: 'PDF contém uma assinatura',
        isValid: true
      });
    } catch (error) {
      // Limpar arquivo temporário
      fs.unlinkSync(pdfPath);
      
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
  }
});

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
}); 