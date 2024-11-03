const { Assinatura, Documentos, Signatarios, InstanciaConfiguradaDoSequelize } = require("../../BancoDeDados/Conector").Tabelas
const crypto = require("crypto")

const CalcularHash = require("../Ferramentas/FuncoesGenericas/CalcularHash")
const CriptografiaAssimetrica = require("../Ferramentas/LidarComAssinatura/CriptografiaAssimetrica")

module.exports = async (Requisicao, Resposta) => {

    let Transacao = await InstanciaConfiguradaDoSequelize.transaction()

    console.log(Requisicao.body)

    try {

        const { assinaturaNome } = JSON.parse(Requisicao.body["assinatura"]);
        const { AssinaturaId } = await Assinatura.create({
            AssinaturaNome: assinaturaNome,
            AssinaturaResponsavel: "Sistema",
            AssinaturaStatus: "Pendente",
            AssinaturaQuantidadeDocumentoAssinado: "0"
        }, { transaction: Transacao });

        const documentos = Requisicao.files;
        await Promise.all(documentos.map(async (documento, index) => {
            const { Documento } = JSON.parse(Requisicao.body[`documento${index}`]);
            buffer = documento.buffer

            let { ChavePublica, Assinatura } = CriptografiaAssimetrica(buffer)

            await Documentos.create({
                DocumentoTitulo: Documento.Nome,
                DocumentoBuffer: buffer,
                DocumentoColecaoDeDivArrastavel: Documento.ColecaoDeDivArrastavel,
                DocumentoToken: crypto.randomUUID(),
                DocumentoCriptografiaChavePublica: ChavePublica,
                DocumentoCriptografiaAssinatura: Assinatura,
                DocumentoHashDoPDFOriginal: CalcularHash(buffer),
                AssinaturaId
            }, { transaction: Transacao })
        }))

        const signatarios = JSON.parse(Requisicao.body.signatarios)
        await Promise.all(signatarios.dadosDoSignatario.map(async (signatario) => {
            await Signatarios.create({
                SignatarioNome: signatario.Nome,
                SignatarioAssinou: false,
                SignatarioEmail: signatario.Email,
                SignatarioWhatsApp: signatario.WhatsApp,
                SignatarioQualificacao: signatario.Qualificacao,
                SignatarioRG: signatario.RG,
                SignatarioCPF: signatario.CPF,
                SignatarioFormaDeAutenticacao: signatario.FormaDeAutenticacao,
                SignatarioSituacaoAssinatura: "Não abriu o link",
                SignatarioTokenLinkAssinatura: signatario.GUID,
                SignatarioTokenEmail: Math.floor(100000 + Math.random() * 900000).toString().substring(0, 6),
                SignatarioTokenWhatsApp: Math.floor(100000 + Math.random() * 900000).toString().substring(0, 6),
                AssinaturaId
            }, { transaction: Transacao })
        }))

        await Transacao.commit()
        Resposta.status(200).json(AssinaturaId)

    } catch (Erro) {

        await Transacao.rollback()
        console.log(Erro)
        Resposta.status(500).json(Erro)

    }

}