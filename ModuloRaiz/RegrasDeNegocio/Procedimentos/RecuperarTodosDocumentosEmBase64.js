const RecuperarArquivoOriginalEmBase64 = require("./RecuperarArquivoOriginalEmBase64");

const { Documento, DocumentoExtra, Arquivo } = require("../../BancoDeDados/Conector").Tabelas;

module.exports = async ({params: { DocumentoId } }, Resposta) => {

    var ArquivosBase64 = {
        ArquivoOriginal: 0,
        ArquivoAssinado: 0,
        ArquivosExtrasOriginais: [],
        ArquivosExtrasAssinados: []
    }

    let { ArquivoOriginalId } = await Documento.findOne({
        where: { 'DocumentoId': DocumentoId },
        attributes: [ "ArquivoOriginalId" ],
    })

    let { ArquivoBase64: ArquivoOriginalBase64} = await Arquivo.findOne({
        where: { 'ArquivoId': ArquivoOriginalId },
        attributes: [ "ArquivoBase64" ]        
    })

    ArquivosBase64['ArquivoOriginal'] = ArquivoOriginalBase64

    var { ArquivoAssinadoId } = await Documento.findOne({
        where: { 'DocumentoId': DocumentoId },
        attributes: [ "ArquivoAssinadoId" ],
    })

    if (ArquivoAssinadoId != null) {

        let { ArquivoBase64: ArquivoAssinadoBase64 } = await Arquivo.findOne({
            where: { 'ArquivoId': ArquivoAssinadoId },
            attributes: [ "ArquivoBase64" ],
        }) 

        ArquivosBase64['ArquivoAssinado']  = ArquivoAssinadoBase64
    }

    let DocumentosExtras = await DocumentoExtra.findAll({
        where: { 'DocumentoId': DocumentoId },
        attributes: ['ArquivoOriginalId']
    })

    let DocumentosExtrasAssinados = await DocumentoExtra.findAll({
        where: { 'DocumentoId': DocumentoId },
        attributes: ['ArquivoAssinadoId']
    })

    console.log(DocumentosExtrasAssinados)
    
    if (DocumentosExtras) {

        const AdicionarDocumentoExtraOriginal = async () => {

            for (const {dataValues: { ArquivoOriginalId }} of DocumentosExtras) {

                console.log(ArquivoOriginalId)
                
                let { ArquivoBase64: ArquivoExtraOriginal } = await Arquivo.findOne({
                    where: { 'ArquivoId': ArquivoOriginalId },
                    attributes: [ "ArquivoBase64" ]        
                })

                ArquivosBase64.ArquivosExtrasOriginais.push(ArquivoExtraOriginal)
            }

        };

        await AdicionarDocumentoExtraOriginal()
    }

    // if (DocumentosExtrasAssinados) {

    //     const AdicionarDocumentoExtraAssinado = async () => {

    //         for (const {dataValues: { ArquivoAssinadoId }} of DocumentosExtrasAssinados) {

    //             console.log(ArquivoAssinadoId)
                
    //             let { ArquivoBase64: ArquivoExtraAssinado } = await Arquivo.findOne({
    //                 where: { 'ArquivoId': ArquivoAssinadoId },
    //                 attributes: [ "ArquivoBase64" ]        
    //             })

    //             ArquivosBase64.ArquivosExtrasAssinados.push(ArquivoExtraAssinado)
    //         }

    //     };

    //     await AdicionarDocumentoExtraAssinado()      

    Resposta.json(ArquivosBase64)
}