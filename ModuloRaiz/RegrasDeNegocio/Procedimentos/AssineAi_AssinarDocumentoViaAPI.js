const { Assinatura, Signatarios, Documentos } = require("../../BancoDeDados/Conector").Tabelas;
const AssineAi_ConstruirPaginaComDadosDeAssinatura = require("../Ferramentas/ManipulacaoDePDF/AssineAi_ConstruirPaginaComDadosDeAssinatura")
const CriarArquivoPDFApartirDoBase64 = require("../Ferramentas/ManipulacaoDePDF/CriarArquivoPDFApartirDoBase64")
const AssinarPDFcomCertificadoDigital = require("../Ferramentas/LidarComAssinatura/CertificadoDigital")
const AssinarPDFcomCriptografiaAssimetrica = require("../Ferramentas/LidarComAssinatura/CriptografiaAssimetrica")
const fs = require("fs");
const { raw } = require("body-parser");

module.exports = async (Requisicao, Resposta) => {

    try {

        console.log(Requisicao.body);

        const signatario = await Signatarios.findOne({
            raw: true,
            where: {
                SignatarioTokenLinkAssinatura: Requisicao.body.SignatarioToken
            },
            attributes: ["AssinaturaId", "SignatarioTokenEmail", "SignatarioTokenWhatsApp"]
        });

        let autenticadoVia = "";
        if (Requisicao.body.otp == signatario.SignatarioTokenEmail) {
            autenticadoVia = "email";
        } else {
            autenticadoVia = "whatsapp";
        }

        await Signatarios.update({ 
            SignatarioGeolocalizacao: {
                type: 'Point',
                coordinates: [Requisicao.body.userLocation.longitude, Requisicao.body.userLocation.latitude]
            },
            SignatarioAssinou: true,
            SignatarioIp: Requisicao.connection.remoteAddress || Requisicao.socket.remoteAddress || Requisicao.connection.socket.remoteAddress,
            SignatarioDispositivo: Requisicao.headers['user-agent'],
            SignatarioAutenticadoVia: autenticadoVia,
            SignatarioSelfieBase64: Requisicao.body.selfie,
            SignatarioAssinaturaEscritaBase64: Requisicao.body.SignatarioAssinaturaEscritaBase64   
         }, { where: { SignatarioTokenLinkAssinatura: Requisicao.body.SignatarioToken } })

        const signatarios = await Signatarios.findAll({
            raw: true,
            where: {
                AssinaturaId: signatario.AssinaturaId
            }
        });

        const documentos = await Documentos.findAll({
            raw: true,
            where: {
                AssinaturaId: signatario.AssinaturaId
            }
        });

        var NomeDoArquivo = ""
        var CaminhoDoArquivo = ""

        for await (const documento of documentos) {

            NomeDoArquivo = documento.DocumentoToken + ".pdf";
            const buffer = await AssineAi_ConstruirPaginaComDadosDeAssinatura(documento, signatarios, Requisicao.body.selfie!==null);
            CaminhoDoArquivo = process.env.BaseDir + "/Arquivos/Temporario/" + NomeDoArquivo;
            await fs.promises.writeFile(CaminhoDoArquivo, buffer);
            await AssinarPDFcomCertificadoDigital(NomeDoArquivo);
            const BufferDoPDFcomCertificado =  fs.readFileSync(process.env.BaseDir+"/Arquivos/Temporario/"+documento.DocumentoToken+"_signed.pdf");

            await Documentos.update({
                DocumentoAssinadoBuffer: BufferDoPDFcomCertificado
            }, { where: { DocumentoToken: documento.DocumentoToken } });

        }

        if(signatarios.filter(signatario => signatario.SignatarioAssinou === false).length === 0) {
            await Assinatura.update({
                AssinaturaStatus: "Finalizada"
            }, { where: { AssinaturaId: signatario.AssinaturaId } })
        } else {
            await Assinatura.update({
                AssinaturaStatus: "Em Andamento"
            }, { where: { AssinaturaId: signatario.AssinaturaId } })            
        }

        const documentosAssinados = await Documentos.findAll({
            raw: true,
            where: {
                AssinaturaId: signatario.AssinaturaId
            }
        });

        Resposta.status(200).json(documentosAssinados)

    } catch (error) {

        await Signatarios.update({ 
            SignatarioAssinou: false,
         }, { where: { SignatarioTokenLinkAssinatura: Requisicao.body.SignatarioToken } })

        console.error('-----------------------------------------------------------------------------------')
        console.error('***********************************************************************************')
        console.error(error)
        console.error('-----------------------------------------------------------------------------------')

        Resposta.status(500).json(error)

    }

}