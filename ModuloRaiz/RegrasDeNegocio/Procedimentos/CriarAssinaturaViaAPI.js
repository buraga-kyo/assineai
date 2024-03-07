const { Sequelize, DataTypes } = require('sequelize');
const { Assinatura, Documentos, Signatarios, InstanciaConfiguradaDoSequelize } = require("../../BancoDeDados/Conector").Tabelas
const RecuperarHashDeArquivoApartirDeBase64 = require("../Ferramentas/FuncoesGenericas/RecuperarHashDeArquivoApartirDeBase64")
const CriarArquivoPDFApartirDoBase64 = require("../Ferramentas/ManipulacaoDePDF/CriarArquivoPDFApartirDoBase64")
const crypto = require("crypto")

module.exports = async ({ body }, Resposta) => {
    
    try {

        let Transacao = await InstanciaConfiguradaDoSequelize.transaction()

        const { AssinaturaId } = await Assinatura.create({
            AssinaturaResponsavel: body.AssinaturaResponsavel,
            AssinaturaStatus: body.AssinaturaStatus,
            AssinaturaQuantidadeDocumentoAssinado: "0"
        }, { transaction: Transacao })

        for (let i = 0; i < body.Documentos.length; i++) {

            await Documentos.create({
                DocumentoTitulo: body.Documentos[i].DocumentoTitulo,
                DocumentoOriginalURLS3: body.Documentos[i].DocumentoOriginalURLS3,
                DocumentoToken: crypto.randomUUID(),
                DocumentoChavePublica: "Melhorar como foi feito",
                DocumentoHashDoPDFOriginal: "Melhorar como foi feito"
            }, { transaction: Transacao })
    
        }

        for (let i = 0; i < body.Signatarios.length; i++) {
        
            await Signatarios.create({
                SignatarioNome: body.Signatarios[i].SignatarioNome
            }, { transaction: Transacao })

        }

        await Transacao.commit()

        
        //await Transacao.rollback()

        // let DocumentoToken = crypto.randomUUID()
        // let ArquivoBase64 = Requisicao.body.DocumentoBase64
        // let CaminhoDoPDF = "./Arquivos/Temporario/"+DocumentoToken+"_Original.pdf"
        // await CriarArquivoPDFApartirDoBase64(CaminhoDoPDF, ArquivoBase64)
        // const HashDoPDFOriginal = await RecuperarHashDeArquivoApartirDeBase64(CaminhoDoPDF)

        // const RegistroArquivo = { ArquivoBase64 }
        // const { ArquivoId } = await Arquivo.create(RegistroArquivo)

        // const RegistroDoDocumento = {
        //     DocumentoTitulo: Requisicao.body.DocumentoTitulo,
        //     DocumentoNome: Requisicao.body.DocumentoNome,
        //     DocumentoToken,
        //     DocumentoHashDoPDFOriginal: HashDoPDFOriginal,
        //     ArquivoOriginalId: ArquivoId,
        //     DocumentoStatusAssinatura: "Em Processo",
        //     DocumentoResponsavel: Requisicao.body.DocumentoResponsavel,
        //     DocumentoDataDeGeracao: new Date()
        // }
        // const { DocumentoId } = await Documento.create(RegistroDoDocumento)

        // const ColecaoDeSignatarios = Requisicao.body.Signatarios.map((RegistroDoSignatario) => {
        //     let SignatarioToken = crypto.randomUUID()
        //     const SignatarioTokenEnviadoEmail = Math.floor(100000 + Math.random() * 900000).toString().substring(0, 6)
            
        //     return {
        //         ...RegistroDoSignatario,
        //         SignatarioToken,
        //         SignatarioTokenEnviadoEmail,
        //         DocumentoId: DocumentoId,
        //         SignatarioStatusAssinatura: "Pendente",
        //         SignatarioLinkAssinatura: process.env.ORIGIN+'/Paineis/DocumentoAguardandoAssinatura/'+SignatarioToken,
        //         SignatarioMensagemSobreVisualizacaoDoLinkDeAssinatura: 'Não abriu o link de assinatura'
        //     }
        // })

        // ColecaoDeSignatarios.forEach((RegistroDoSignatario) => {
        //     Signatario.create(RegistroDoSignatario)
        // })

        // const JSONResposta = {
        //     Documento: RegistroDoDocumento,
        //     Signatarios: ColecaoDeSignatarios 
        // }

        Resposta.json(AssinaturaId)

    } catch (Erro) {
        console.log(Erro)
        Resposta.sendStatus(500)
    }

    
}