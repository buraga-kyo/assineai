const fs = require('fs');
const forge = require('node-forge');

async function signPdfContent(base64Pdf, Certificado, Senha) {
  try {

    const { cert, key } = await loadCertificateAndKey(Certificado, Senha)
    console.log(base64Pdf)
    // Decodifica a string de base64 para obter o buffer do PDF
    const pdfBuffer = Buffer.from(base64Pdf, 'base64');

    // Converte o buffer do PDF em uma representação de conteúdo compatível com o forge
    const content = forge.util.createBuffer(pdfBuffer);

    // Crie uma instância CMS com o conteúdo e assine com o certificado
    const cms = forge.pkcs7.createSignedData();
    cms.content = new forge.util.ByteBuffer(content.bytes());
    cms.addCertificate(cert);
    cms.addSigner({
      key,
      certificate: cert,
      digestAlgorithm: forge.pki.oids.sha256,
    });
    cms.sign();

    // Obtenha o PDF assinado como um buffer
    const signedPdfBuffer = Buffer.from(cms.toAsn1(), 'binary');

    // Converta o PDF assinado para base64
    const signedPdfBase64 = signedPdfBuffer.toString('base64');

    return signedPdfBase64;

  } catch (error) {
    console.error("Ocorreu um erro ao assinar o PDF:", error.message);
    throw error;
  }
}

async function loadCertificateAndKey(certPath, certPassword) {
    try {
      const p12Data = fs.readFileSync(certPath);
      const p12Asn1 = forge.asn1.fromDer(p12Data.toString('binary'));
      const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, certPassword);
      const bags = p12.getBags({ bagType: forge.pki.oids.certBag });
      const certBag = bags[forge.pki.oids.certBag][0];
      const cert = certBag.cert;
      const keyBags = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag });
      const keyBag = keyBags[forge.pki.oids.pkcs8ShroudedKeyBag][0];
      const key = keyBag.key;
      return { cert, key };
    } catch (error) {
      console.error("Ocorreu um erro ao carregar o certificado e a chave privada:", error.message);
      throw error;
    }
}

// async function loadCertificateAndKey(certPath, certPassword) {
//     try {
//       const p12Data = fs.readFileSync(certPath);
//       const p12Asn1 = forge.asn1.fromDer(p12Data.toString('binary'));
//       const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, certPassword);
//       const bags = p12.getBags({ bagType: forge.pki.oids.certBag });
//       const cert = bags[forge.pki.oids.certBag][0].cert;
//       const key = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag })[forge.pki.oids.pkcs8ShroudedKeyBag][0].key;
//       return { cert, key };
//     } catch (error) {
//       console.error("Ocorreu um erro ao carregar o certificado e a chave privada:", error.message);
//       throw error;
//     }
//   }

module.exports = signPdfContent

// // Exemplo de uso:
// const pdfBuffer = Buffer.from(/* Seu buffer de PDF aqui */);
// const cert = /* Seu certificado aqui */;
// const key = /* Sua chave privada aqui */;

// signPdfContent(pdfBuffer, cert, key)
//   .then(signedPdfBase64 => {
//     console.log("PDF assinado em base64:", signedPdfBase64);
//   })
//   .catch(error => {
//     console.error("Ocorreu um erro:", error.message);
//   });


// const fs = require('fs');
// const forge = require('node-forge');
// const { promisify } = require('util');

// const readFileAsync = promisify(fs.readFile);
// const writeFileAsync = promisify(fs.writeFile);

// async function signPdf(inputFile, outputFile, certificatePath, certificatePassword) {
//   try {
//     // Carrega o certificado digital
//     const p12Data = await readFileAsync(certificatePath);
//     const p12Asn1 = forge.asn1.fromDer(p12Data.toString('binary'));
//     const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1);
//     const bags = p12.getBags({ bagType: forge.pki.oids.certBag });
//     const cert = bags[forge.pki.oids.certBag][0].cert;
//     const key = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag })[forge.pki.oids.pkcs8ShroudedKeyBag][0].key;

//     // Leitura do conteúdo do arquivo PDF original
//     const pdfContent = await readFileAsync(inputFile);

//     // Assina o conteúdo do PDF com o certificado digital
//     const signedPdfContent = await signPdfContent(pdfContent, cert, key);

//     // Salva o PDF assinado
//     await writeFileAsync(outputFile, signedPdfContent);

//     console.log("Certificado inserido com sucesso!");
//   } catch (error) {
//     console.error("Ocorreu um erro:", error.message);
//   }
// }

// async function signPdfContent(pdfContent, cert, key) {
//   const pdfBuffer = Buffer.from(pdfContent, 'binary');
//   const pdfBytes = new Uint8Array(pdfBuffer);

//   // Converte os bytes do PDF em uma representação de conteúdo compatível com o forge
//   const content = forge.util.createBuffer(pdfBytes);

//   // Crie uma instância CMS com o conteúdo e assine com o certificado
//   const cms = forge.pkcs7.createSignedData();
//   cms.content = new forge.util.ByteBuffer(content.bytes());
//   cms.addCertificate(cert);
//   cms.addSigner({
//     key,
//     certificate: cert,
//     digestAlgorithm: forge.pki.oids.sha256,
//   });
//   cms.sign();

//   // Obtenha o PDF assinado como um buffer
//   const signedPdfBuffer = Buffer.from(cms.toAsn1(), 'binary');
//   return signedPdfBuffer;
// }

// // Substitua com os caminhos e senhas apropriados
// const inputFile = 'input.pdf';
// const outputFile = 'output.pdf';
// const certificatePath = 'certificate.pfx';
// const certificatePassword = 'your_password_here';

// signPdf(inputFile, outputFile, certificatePath, certificatePassword);
