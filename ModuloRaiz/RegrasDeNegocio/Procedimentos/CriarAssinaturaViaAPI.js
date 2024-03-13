const { Assinatura, Documentos, Signatarios, InstanciaConfiguradaDoSequelize } = require("../../BancoDeDados/Conector").Tabelas
const crypto = require("crypto")

const CalcularHash = require("../Ferramentas/FuncoesGenericas/CalcularHash")
const CriptografiaAssimetrica = require("../Ferramentas/LidarComAssinatura/CriptografiaAssimetrica")

module.exports = async ({ body }, Resposta) => {

    try {

        let Transacao = await InstanciaConfiguradaDoSequelize.transaction()

        const { AssinaturaId } = await Assinatura.create({
            AssinaturaResponsavel: body.AssinaturaResponsavel,
            AssinaturaStatus: body.AssinaturaStatus,
            AssinaturaQuantidadeDocumentoAssinado: "0"
        }, { transaction: Transacao })

        for (let i = 0; i < body.Documentos.length; i++) {          

            let { ChavePublica, Assinatura } = CriptografiaAssimetrica(body.Documentos[0].DocumentoOriginalURLS3)

            await Documentos.create({
                DocumentoTitulo: body.Documentos[i].DocumentoTitulo,
                DocumentoOriginalURLS3: body.Documentos[i].DocumentoOriginalURLS3,
                DocumentoToken: crypto.randomUUID(),
                DocumentoCriptografiaChavePublica: ChavePublica,
                DocumentoCriptografiaAssinatura: Assinatura,
                DocumentoHashDoPDFOriginal: CalcularHash(body.Documentos[i].DocumentoOriginalURLS3),
                AssinaturaId
            }, { transaction: Transacao })
    
        }

        for (let i = 0; i < body.Signatarios.length; i++) {
        
            await Signatarios.create({
                SignatarioNome: body.Signatarios[i].SignatarioNome,
                SignatarioEmail: body.Signatarios[i].SignatarioEmail,
                SignatarioSituacaoAssinatura: "Não abriu o link",
                SignatarioTokenLinkAssinatura: crypto.randomUUID(),
                SignatarioTokenEmail: Math.floor(100000 + Math.random() * 900000).toString().substring(0, 6),
                AssinaturaId
            }, { transaction: Transacao })

        }

        await Transacao.commit()
        Resposta.json(AssinaturaId)

    } catch (Erro) {

        await Transacao.rollback()
        console.log(Erro)
        Resposta.sendStatus(500)
        
    }

    
}