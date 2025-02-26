// const cmd = require('node-cmd');
// const { spawn } = require('child_process');
const fs = require('fs');
const forge = require('node-forge');
const { PDFDocument, rgb } = require('pdf-lib');

module.exports = (NomeDoArquivo, pdfBuffer) => {

    return new Promise(async (resolve, reject) => {

        const pemContent = fs.readFileSync(process.env.BaseDir+'\\Arquivos\\Permanente\\certificate.pem', 'utf8');
        const pemDecoded = forge.pem.decode(pemContent)[0].body;
        const certificadoDer = fs.readFileSync(process.env.BaseDir+'\\Arquivos\\Permanente\\cert.pfx', 'binary');

        const pdfDoc = await PDFDocument.load(pdfBuffer);
        const page = pdfDoc.getPages()[0];
        
        // Preparar certificado
        const p12 = forge.pkcs12.pkcs12FromAsn1(
            forge.asn1.fromDer(certificadoDer), 
            false, 
            'dwith2024'
        );
        const keyBag = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag });
        const certBag = p12.getBags({ bagType: forge.pki.oids.certBag });
        
        const privateKey = keyBag[forge.pki.oids.pkcs8ShroudedKeyBag][0].key;
        const certificate = certBag[forge.pki.oids.certBag][0].cert;
        
        // Calcular hash
        const hash = forge.md.sha256.create().update(
            await pdfDoc.save()
        ).digest().getBytes();
        
        // Assinar hash
        const signature = privateKey.sign(hash, 'SHA256');
        
        // Construir objeto de assinatura
        const signatureDict = pdfDoc.context.obj({
            Type: 'Sig',
            Filter: 'Adobe.PPKLite',
            SubFilter: 'ETSI.CAdES.detached',
            Contents: new Uint8Array(forge.util.binary.raw.decode(signature)),
            Cert: new Uint8Array(forge.asn1.toDer(
                forge.pki.certificateToAsn1(certificate)
            ).getBytes()),
            M: moment().format('YYYYMMDDHHmmssZZ')
        });
        
        // Adicionar assinatura ao PDF
        const signatureRef = pdfDoc.context.register(signatureDict);
        pdfDoc.catalog.set(
            pdfDoc.context.obj({
                SigFlags: 3,
                Signatures: [signatureRef]
            })
        );
        
        resolve(pdfDoc.save());


        /****************** const { exec } = require('child_process');

        const command = 'cd '+process.env.BaseDir+'\\Arquivos\\Permanente & java -jar JSignPdf.jar -d ' + process.env.BaseDir + '\\Arquivos\\Temporario -kst PKCS12 -ksf cert.pfx -ksp ' + process.env.SENHA_DO_CERTIFICADO + ' -pr DISALLOW_PRINTING ' + process.env.BaseDir + '\\Arquivos\\Temporario\\' + NomeDoArquivo;

        exec(command, { windowsHide: true }, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error: ${error}`);
                reject(error);
            }
            if (stderr) {
                console.error(`stderr: ${stderr}`);
            }
            resolve(true);
        }); *****/

        /** const pfxBuffer = fs.readFileSync(process.env.BaseDir+'\\Arquivos\\Permanente\\cert.pfx');
        const p12Asn1 = forge.asn1.fromDer(pfxBuffer.toString('binary'));
        const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, 'dwith2024');
      
        const keyObj = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag })[forge.pki.oids.pkcs8ShroudedKeyBag][0];
        const certObj = p12.getBags({ bagType: forge.pki.oids.certBag })[forge.pki.oids.certBag][0];
      
        const privateKeyPem = forge.pki.privateKeyToPem(keyObj.key);
        const certificate = forge.pki.certificateToPem(certObj.cert);
      
        console.log(privateKeyPem);
        console.log(certificate);

        const pdfBuffer = fs.readFileSync(process.env.BaseDir+'\\Arquivos\\Temporario\\'+NomeDoArquivo);
        const pdfDoc = await PDFDocument.load(pdfBuffer);
      
        // Criar uma assinatura fictícia (espaço reservado)
        const signaturePlaceholder = Buffer.alloc(8192); // Espaço reservado para a assinatura
      
        // Adicionar uma assinatura simples ao PDF
        const pages = pdfDoc.getPages();
        const firstPage = pages[0];
        firstPage.drawText('Assinado digitalmente', {
          x: 50,
          y: 50,
          size: 12,
          color: rgb(0, 0, 0), // preto
        });
      
        // Salvar o PDF com o espaço reservado
        const pdfWithPlaceholder = await pdfDoc.save();

        // Criar assinatura
        const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);
        const md = forge.md.sha256.create();
        md.update(pdfWithPlaceholder, 'binary');
        const signature = privateKey.sign(md);
        const signatureBuffer = Buffer.from(signature, 'binary');        

        console.log(signatureBuffer);

        signatureBuffer.copy(signaturePlaceholder);

        // Escrever o PDF final no disco
        fs.writeFileSync(process.env.BaseDir+'\\Arquivos\\Temporario\\signed.pdf', Buffer.concat([pdfWithPlaceholder, signaturePlaceholder]));
        console.log(`PDF assinado salvo em: ${process.env.BaseDir+'\\Arquivos\\Temporario\\signed.pdf'}`);   */     

        /**** // Read the PDF and certificate files
        const pdfBuffer = readFileSync(process.env.BaseDir+'\\Arquivos\\Temporario\\'+NomeDoArquivo);
        const certificateBuffer = readFileSync(process.env.BaseDir+'\\Arquivos\\Permanente\\cert.pfx');

        // Create a new signer instance
        const signer = new NodeSignPDF();

        // Sign the PDF
        const signedPdf = await signer.sign(pdfBuffer, certificateBuffer, {
            passphrase: password,
        });

        // Save the signed PDF
        const outputPath = `signed_${NomeDoArquivo}`;
        console.log(`Saving signed PDF to ${outputPath}`);
        writeFileSync(outputPath, signedPdf);

        resolve(true); **/

        /*const diretorioOndeComandoSeraExecutado = process.env.BaseDir+'\\Arquivos\\Permanente';

        const argumentos = [
            '-jar',
            'JSignPdf.jar',
            '-d',
            process.env.BaseDir+'\\Arquivos\\Temporario',
            '-kst',
            'PKCS12',
            '-ksf',
            'cert.pfx',
            '-ksp',
            process.env.SENHA_DO_CERTIFICADO,
            '-pr',
            'DISALLOW_PRINTING',
            process.env.BaseDir+'\\Arquivos\\Temporario\\'+NomeDoArquivo,
        ];

        const processo = spawn('java', argumentos, {
            cwd: diretorioOndeComandoSeraExecutado,
            detached: true, 
            stdio: 'ignore',
            windowsHide: true,
            shell: false,
        });

        // Desanexa o processo
        processo.unref();

        console.log('Comando executado com sucesso!');

        resolve(true);*/

        /** 
        const comando = 'cd '+process.env.BaseDir+'\\Arquivos\\Permanente & java -jar JSignPdf.jar -d '+process.env.BaseDir+'\\Arquivos\\Temporario -kst PKCS12 -ksf cert.pfx -ksp '+process.env.SENHA_DO_CERTIFICADO+' -pr DISALLOW_PRINTING '+process.env.BaseDir+'\\Arquivos\\Temporario\\'+NomeDoArquivo

        cmd.run(comando, (err, data, stderr) => {

            if (err == null) {
                console.log('certificado adicionado com sucesso .......')
                resolve(true);
            } else {
                console.log('CertificadoDigital.js')
                reject(err)
            }

        })*/

    });

}