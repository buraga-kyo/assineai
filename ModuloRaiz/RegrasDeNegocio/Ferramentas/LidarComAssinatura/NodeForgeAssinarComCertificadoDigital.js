const fs = require('fs');
const pdfSigner = require('pdf-signer');
const { Buffer } = require('buffer');

// Função para assinar um PDF com certificado PFX e retornar o PDF assinado como base64
async function signPdfWithPfx(inputPdfBase64, pfxPath, pfxPassword) {
    try {
        // Decodificar o PDF de entrada para buffer
        const inputPdfBuffer = Buffer.from(inputPdfBase64, 'base64');

        // Ler o certificado PFX
        const pfxData = fs.readFileSync(pfxPath);

        // Assinar o PDF
        const signedPdfBuffer = await pdfSigner.sign({
            data: inputPdfBuffer,
            pfx: pfxData,
            password: pfxPassword,
            reason: 'Assinatura digital',
            location: 'Local',
            output: 'stream'
        });

        // Converter o PDF assinado para base64
        const signedPdfBase64 = signedPdfBuffer.toString('base64');

        return signedPdfBase64;
    } catch (error) {
        throw new Error('Erro ao assinar PDF: ' + error.message);
    }
}

module.exports = signPdfWithPfx

// const fs = require('fs');
// const { PDFSigner } = require('node-signpdf');
// const pdfParse = require('pdf-parse');

// // Função para converter Base64 para buffer
// function base64ToBuffer(base64String) {
//     return Buffer.from(base64String, 'base64');
// }

// // Função para converter buffer para Base64
// function bufferToBase64(buffer) {
//     return buffer.toString('base64');
// }

// // Função para assinar PDF
// async function signPDF(base64PDF, pfxPath, password) {
//     try {

//         // Lendo o arquivo PFX e convertendo para buffer
//         const pfxBuffer = fs.readFileSync(pfxPath);

//         // Convertendo PDF de Base64 para buffer
//         const pdfBuffer = base64ToBuffer(base64PDF);

//         // Configurando o assinador
//         const signer = new PDFSigner(pdfBuffer);

//         // Assinando o PDF
//         const signedBuffer = signer.sign({
//             // Passando o certificado PFX e a senha
//             pfx: pfxBuffer,
//             passphrase: password,
//         });

//         // Convertendo PDF assinado de buffer para Base64
//         const signedBase64 = bufferToBase64(signedBuffer);

//         return signedBase64;
//     } catch (error) {
//         throw new Error('Erro ao assinar o PDF: ' + error.message);
//     }
// }

// // Função para ler PDF e retornar Base64
// async function readPDFAndReturnBase64(filePath) {
//     try {
//         const dataBuffer = fs.readFileSync(filePath);
//         const pdfData = await pdfParse(dataBuffer);
//         return pdfData.text; // Retorna o PDF como Base64
//     } catch (error) {
//         throw new Error('Erro ao ler o PDF: ' + error.message);
//     }
// }

// module.exports = signPDF


// const fs = require('fs');
// const PDFSigner = require('pdf-signer');
// const pdfParse = require('pdf-parse');

// // Função para converter Base64 para buffer
// function base64ToBuffer(base64String) {
//     return Buffer.from(base64String, 'base64');
// }

// // Função para converter buffer para Base64
// function bufferToBase64(buffer) {
//     return buffer.toString('base64');
// }

// // Função para assinar PDF
// async function signPDF(base64PDF, pfxPath, password) {
//     try {
//         // Lendo o arquivo PFX e convertendo para buffer
//         const pfxBuffer = fs.readFileSync(pfxPath);        

//         // Convertendo PDF de Base64 para buffer
//         const pdfBuffer = base64ToBuffer(base64PDF);

//         // Configurando o assinador
//         const signer = new PDFSigner({
//             pfxBuffer: pfxBuffer,
//             passphrase: password
//         });

//         // Assinando o PDF
//         const signedBuffer = await signer.sign(pdfBuffer);

//         // Convertendo PDF assinado de buffer para Base64
//         const signedBase64 = bufferToBase64(signedBuffer);

//         return signedBase64;
//     } catch (error) {
//         throw new Error('Erro ao assinar o PDF: ' + error.message);
//     }
// }

// // Função para ler PDF e retornar Base64
// async function readPDFAndReturnBase64(filePath) {
//     try {
//         const dataBuffer = fs.readFileSync(filePath);
//         const pdfData = await pdfParse(dataBuffer);
//         return pdfData.text; // Retorna o PDF como Base64
//     } catch (error) {
//         throw new Error('Erro ao ler o PDF: ' + error.message);
//     }
// }

// module.exports = signPDF

// const fs = require('fs');
// const forge = require('node-forge');

// async function signPdfContent(base64Pdf, Certificado, Senha) {
//   try {

//     const { cert, key } = await loadCertificateAndKey(Certificado, Senha)
//     console.log(base64Pdf)
//     // Decodifica a string de base64 para obter o buffer do PDF
//     const pdfBuffer = Buffer.from(base64Pdf, 'base64');

//     // Converte o buffer do PDF em uma representação de conteúdo compatível com o forge
//     const content = forge.util.createBuffer(pdfBuffer);

//     // Crie uma instância CMS com o conteúdo e assine com o certificado
//     const cms = forge.pkcs7.createSignedData();
//     cms.content = new forge.util.ByteBuffer(content.bytes());
//     cms.addCertificate(cert);
//     cms.addSigner({
//       key,
//       certificate: cert,
//       digestAlgorithm: forge.pki.oids.sha256,
//     });
//     cms.sign();

//     // Obtenha o PDF assinado como um buffer
//     const signedPdfBuffer = Buffer.from(cms.toAsn1(), 'binary');

//     // Converta o PDF assinado para base64
//     const signedPdfBase64 = signedPdfBuffer.toString('base64');

//     return signedPdfBase64;

//   } catch (error) {
//     console.error("Ocorreu um erro ao assinar o PDF:", error.message);
//     throw error;
//   }
// }

// async function loadCertificateAndKey(certPath, certPassword) {
//     try {
//       const p12Data = fs.readFileSync(certPath);
//       const p12Asn1 = forge.asn1.fromDer(p12Data.toString('binary'));
//       const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, certPassword);
//       const bags = p12.getBags({ bagType: forge.pki.oids.certBag });
//       const certBag = bags[forge.pki.oids.certBag][0];
//       const cert = certBag.cert;
//       const keyBags = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag });
//       const keyBag = keyBags[forge.pki.oids.pkcs8ShroudedKeyBag][0];
//       const key = keyBag.key;
//       return { cert, key };
//     } catch (error) {
//       console.error("Ocorreu um erro ao carregar o certificado e a chave privada:", error.message);
//       throw error;
//     }
// }

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

// module.exports = signPdfContent

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
