const { Documentos, Signatarios, Assinatura, InstanciaConfiguradaDoSequelize } = require("../../BancoDeDados/Conector").Tabelas;
const Op = require("sequelize").Op;

module.exports = async (Requisicao, Resposta) => {

    try {
        
        let AssinaturasEncontradas = await Assinatura.findAll({
            attributes: ["AssinaturaId"],
            include: [
                {model: Documentos}, 
                {model: Signatarios}
            ]
        })

        console.log(AssinaturasEncontradas)
        Resposta.json(AssinaturasEncontradas)

    } catch (Erro) {
        
    }    

    // try {

    //     const { FiltroDeStatus, FiltroDeProcura, FiltroDeData, Ordenacao } = Requisicao.body;
    //     const Filtro = {};

    //     if (FiltroDeStatus) Filtro.StatusDoDocumento = FiltroDeStatus;
    //     if (FiltroDeProcura) Filtro.NomeDoDocumento = { [Op.iLike]: "%"+FiltroDeProcura+"%" }
    //     if (FiltroDeData != null) {

    //         if (FiltroDeData?.includes(" até ")) {

    //             const DataAntesDoAte = FiltroDeData.split(" até ")[0]

    //             var PartesDaData = DataAntesDoAte.split('-')
    //             var dia = PartesDaData[0]
    //             var mes = PartesDaData[1]
    //             var ano = PartesDaData[2]

    //             var DataAntesDoAteFormatada = `${ano}-${mes}-${dia}`

    //             const DataDepoisDoAte = FiltroDeData.split(" até ")[1]

    //             PartesDaData = DataDepoisDoAte.split('-')
    //             dia = PartesDaData[0]
    //             mes = PartesDaData[1]
    //             ano = PartesDaData[2]

    //             var DataDepoisDoAteFormatada = `${ano}-${mes}-${dia}`
                
    //             var DataInicial = new Date(DataAntesDoAteFormatada)
    //             var DataFinal = new Date(DataDepoisDoAteFormatada)

    //             DataFinal.setUTCHours(23,59,59,999); //Setando a hora da data fim no final do dia

    //             Filtro.DataDeGeracaoDoDocumento = { [Op.between]: [DataInicial, DataFinal] }

    //         } else {

    //             const PartesDaData = FiltroDeData.split('-')
    //             const dia = PartesDaData[0]
    //             const mes = PartesDaData[1]
    //             const ano = PartesDaData[2]
    //             var DataFormatada = `${ano}-${mes}-${dia}`

    //             var DataInicial = new Date(DataFormatada)
    //             var DataFinal = new Date(DataFormatada)

    //             DataFinal.setUTCHours(23,59,59,999)

    //             Filtro.DataDeGeracaoDoDocumento = { [Op.between]: [DataInicial, DataFinal] }

    //         }

    //     }

    //     let OrdenacaoSQL = [];
    //     if (Ordenacao && Ordenacao?.campo) {
    //       if (Ordenacao.campo === 'Signatarios') {
            
    //         OrdenacaoSQL = [
    //           [InstanciaConfiguradaDoSequelize.literal('"SignatarioNome"'), Ordenacao.tipo.toUpperCase()],
    //         ];
    //       } else {
            
    //         OrdenacaoSQL = [[Ordenacao.campo, Ordenacao.tipo.toUpperCase()]];
    //       }
    //     }

    //     let DocumentosEncontrados = await Documentos.findAndCountAll({
    //         where: Filtro,
    //         offset: Requisicao.body.QtdPularRegistrosPular,
    //         limit: Requisicao.body.limiteRegistros,
    //         attributes: [ "DocumentoId", "DocumentoNome", "DocumentoStatusAssinatura", "DocumentoToken", "DocumentoDataDeGeracao"],
    //         include: [
    //           {model: Signatarios, as: 'Signatarios', attributes: ['SignatarioNome']},
    //           {model: DocumentoExtra, as: 'DocumentosExtras', attributes: ['DocumentoExtraId']}
    //         ],
    //         order: OrdenacaoSQL
    //     })

    //     DocumentosEncontrados.TotalDeDocumentos = await Documentos.count()
    //     DocumentosEncontrados.DocumentosAssinados = await Documentos.count({ where: { DocumentoStatusAssinatura: 'Assinado' } })
    //     DocumentosEncontrados.DocumentosEmProcesso = await Documentos.count({ where: { DocumentoStatusAssinatura: 'Em Processo' } })
    //     DocumentosEncontrados.DocumentosExcluidos = await Documentos.count({ where: { DocumentoStatusAssinatura: 'Excluido' } })

    //     Resposta.json(DocumentosEncontrados)

    // } catch (Erro) {
    //     console.log(Erro)
    //     Resposta.sendStatus(500)
    // }


}

// const { Documento, Signatario, DocumentoExtra, InstanciaConfiguradaDoSequelize } = require("../../BancoDeDados/Conector").Tabelas;
// const { Op } = require("sequelize");

// module.exports = async (req, res) => {
//     try {
//         const { FiltroDeStatus, FiltroDeProcura, FiltroDeData, Sort, QtdPularRegistrosPular, limiteRegistros } = req.body;

//         const whereClause = {};
//         if (FiltroDeStatus) whereClause.DocumentoStatusAssinatura = FiltroDeStatus;
//         if (FiltroDeProcura) whereClause.DocumentoNome = { [Op.iLike]: `%${FiltroDeProcura}%` };
//         if (FiltroDeData) {
//             const [dataInicial, dataFinal] = FiltroDeData.includes(" até ")
//                 ? FiltroDeData.split(" até ").map(date => {
//                     const [dia, mes, ano] = date.split("-");
//                     return new Date(ano, mes - 1, dia, 0, 0, 0, 0);
//                 })
//                 : FiltroDeData.split("-").map(Number);

//             whereClause.DocumentoDataDeGeracao = {
//                 [Op.between]: [dataInicial, new Date(dataFinal.setUTCHours(23, 59, 59, 999))]
//             };
//         }

//         let order = [];
//         if (Sort && Sort.field) {
//             if (Sort.field === 'Signatarios') {
//                 order = [[InstanciaConfiguradaDoSequelize.literal('"SignatarioNome"'), Sort.type.toUpperCase()]];
//             } else {
//                 order = [[Sort.field, Sort.type.toUpperCase()]];
//             }
//         }

//         const documentos = await Documento.findAndCountAll({
//             where: whereClause,
//             offset: QtdPularRegistrosPular,
//             limit: limiteRegistros,
//             attributes: ["DocumentoId", "DocumentoNome", "DocumentoStatusAssinatura", "DocumentoToken", "DocumentoDataDeGeracao"],
//             include: [
//                 { model: Signatario, as: 'Signatarios', attributes: ['SignatarioNome'] },
//                 { model: DocumentoExtra, as: 'DocumentosExtras', attributes: ['DocumentoExtraId'] }
//             ],
//             order
//         });

//         const [TotalDeDocumentos, DocumentosAssinados, DocumentosEmProcesso, DocumentosExcluidos] = await Promise.all([
//             Documento.count(),
//             Documento.count({ where: { DocumentoStatusAssinatura: 'Assinado' } }),
//             Documento.count({ where: { DocumentoStatusAssinatura: 'Em Processo' } }),
//             Documento.count({ where: { DocumentoStatusAssinatura: 'Excluido' } })
//         ]);

//         res.json({
//             ...documentos,
//             TotalDeDocumentos,
//             DocumentosAssinados,
//             DocumentosEmProcesso,
//             DocumentosExcluidos
//         });
//     } catch (error) {
//         console.error(error);
//         res.sendStatus(500);
//     }
// };


// const { Documentos, Signatarios, Assinatura, InstanciaConfiguradaDoSequelize } = require("../../BancoDeDados/Conector").Tabelas;
// const Op = require("sequelize").Op;

// module.exports = async (Requisicao, Resposta) => {

//     try {

//         const { FiltroDeStatus, FiltroDeProcura, FiltroDeData, Sort } = Requisicao.body;
//         const Filtro = {};

//         if (FiltroDeStatus) Filtro.DocumentoStatusAssinatura = FiltroDeStatus;
//         if (FiltroDeProcura) Filtro.DocumentoNome = { [Op.iLike]: "%"+FiltroDeProcura+"%" }
//         if (FiltroDeData != null) {

//             if (FiltroDeData?.includes(" até ")) {

//                 const DataAntesDoAte = FiltroDeData.split(" até ")[0]

//                 var PartesDaData = DataAntesDoAte.split('-')
//                 var dia = PartesDaData[0]
//                 var mes = PartesDaData[1]
//                 var ano = PartesDaData[2]

//                 var DataAntesDoAteFormatada = `${ano}-${mes}-${dia}`

//                 const DataDepoisDoAte = FiltroDeData.split(" até ")[1]

//                 PartesDaData = DataDepoisDoAte.split('-')
//                 dia = PartesDaData[0]
//                 mes = PartesDaData[1]
//                 ano = PartesDaData[2]

//                 var DataDepoisDoAteFormatada = `${ano}-${mes}-${dia}`
                
//                 var DataInicial = new Date(DataAntesDoAteFormatada)
//                 var DataFinal = new Date(DataDepoisDoAteFormatada)

//                 DataFinal.setUTCHours(23,59,59,999); //Setando a hora da data fim no final do dia

//                 Filtro.DocumentoDataDeGeracao = { [Op.between]: [DataInicial, DataFinal] }

//             } else {

//                 const PartesDaData = FiltroDeData.split('-')
//                 const dia = PartesDaData[0]
//                 const mes = PartesDaData[1]
//                 const ano = PartesDaData[2]
//                 var DataFormatada = `${ano}-${mes}-${dia}`

//                 var DataInicial = new Date(DataFormatada)
//                 var DataFinal = new Date(DataFormatada)

//                 DataFinal.setUTCHours(23,59,59,999)

//                 Filtro.DocumentoDataDeGeracao = { [Op.between]: [DataInicial, DataFinal] }

//             }

//         }

//         let Order = [];
//         if (Sort && Sort?.field) {
//           if (Sort.field === 'Signatarios') {
            
//             Order = [
//               [InstanciaConfiguradaDoSequelize.literal('"SignatarioNome"'), Sort.type.toUpperCase()],
//             ];
//           } else {
            
//             Order = [[Sort.field, Sort.type.toUpperCase()]];
//           }
//         }

//         let Documentos = await Documento.findAndCountAll({
//             where: Filtro,
//             offset: Requisicao.body.QtdPularRegistrosPular,
//             limit: Requisicao.body.limiteRegistros,
//             attributes: [ "DocumentoId", "DocumentoNome", "DocumentoStatusAssinatura", "DocumentoToken", "DocumentoDataDeGeracao"],
//             include: [
//               {model: Signatario, as: 'Signatarios', attributes: ['SignatarioNome']},
//               {model: DocumentoExtra, as: 'DocumentosExtras', attributes: ['DocumentoExtraId']}
//             ],
//             order: Order
//         })

//         Documentos.TotalDeDocumentos = await Documento.count()
//         Documentos.DocumentosAssinados = await Documento.count({ where: { DocumentoStatusAssinatura: 'Assinado' } })
//         Documentos.DocumentosEmProcesso = await Documento.count({ where: { DocumentoStatusAssinatura: 'Em Processo' } })
//         Documentos.DocumentosExcluidos = await Documento.count({ where: { DocumentoStatusAssinatura: 'Excluido' } })

//         Resposta.json(Documentos)

//     } catch (Erro) {
//         console.log(Erro)
//         Resposta.sendStatus(500)
//     }


// }