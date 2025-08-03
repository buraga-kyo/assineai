const { Signatario, Documento, Arquivo, DocumentoExtra } = require("../../BancoDeDados/Conector").Tabelas
const DataAtualFormatada = require("../Ferramentas/FuncoesGenericas/DataAtualFormatada")
const ConstruirPaginaComDadosDeAssinatura = require("../Ferramentas/ManipulacaoDePDF/ConstruirPaginaComDadosDeAssinaturaProducao")
const CriarArquivoPDFApartirDoBase64 = require("../Ferramentas/ManipulacaoDePDF/CriarArquivoPDFApartirDoBase64")
const AssinarPDFcomCertificadoDigital = require("../Ferramentas/LidadorDeAssinatura/CertificadoDigital")
const AssinarPDFcomCriptografiaAssimetrica = require("../Ferramentas/LidadorDeAssinatura/CriptografiaAssimetrica")
const ConstruirPaginaDocumentoExtraComDadosDeAssinaturaProducao = require("../Ferramentas/ManipulacaoDePDF/ConstruirPaginaDocumentoExtraComDadosDeAssinaturaProducao")
const fs = require("fs"); 

module.exports = async (Requisicao, Resposta) => {
    const { dataValues: RegistrosDoSignatario } = await Signatario.findOne({ where: { SignatarioToken: Requisicao.body.SignatarioToken } })
    const { dataValues: RegistrosDoDocumento } = await Documento.findOne({ where: { DocumentoId: RegistrosDoSignatario.DocumentoId } })

    RegistrosDoSignatario.SignatarioIp = Requisicao.connection.remoteAddress || Requisicao.socket.remoteAddress || Requisicao.connection.socket.remoteAddress
    RegistrosDoSignatario.SignatarioDispositivo = Requisicao.headers['user-agent']
    RegistrosDoSignatario.SignatarioDataAssinatura = DataAtualFormatada()
    RegistrosDoSignatario.SignatarioStatusAssinatura = "Assinado"
    
    Signatario.update(RegistrosDoSignatario, { where: { SignatarioId: RegistrosDoSignatario.SignatarioId } })    
    Documento.update({ DocumentoStatusAssinatura: "Em Processo" }, { where: { DocumentoId: RegistrosDoSignatario.DocumentoId } })

    const DocumentoBase64Atualizado = await ConstruirPaginaComDadosDeAssinatura(RegistrosDoDocumento.DocumentoId, RegistrosDoSignatario.SignatarioId)

    const NomeDoArquivo = RegistrosDoDocumento.DocumentoId+".pdf"
    const CaminhoDoArquivo = "./Arquivos/Temporario/"+NomeDoArquivo

    const ArquivoPDFCriadoComSucesso = await CriarArquivoPDFApartirDoBase64(CaminhoDoArquivo, DocumentoBase64Atualizado)

    if (ArquivoPDFCriadoComSucesso) {
        const PDFAssinadoComSucesso = await AssinarPDFcomCertificadoDigital(NomeDoArquivo)

        if (PDFAssinadoComSucesso) {
            const BufferDoPDFcomCertificado =  fs.readFileSync("./Arquivos/Temporario/"+RegistrosDoDocumento.DocumentoId+"_signed.pdf")
            const Base64PDFComCertificado = BufferDoPDFcomCertificado.toString('base64')
            const DadosCriptografiaAssimetrica = AssinarPDFcomCriptografiaAssimetrica(Base64PDFComCertificado)

            const { ArquivoId } = await Arquivo.create({ ArquivoBase64: Base64PDFComCertificado })

            const TotalDeSignatarios = await Signatario.count({ 
                where: { DocumentoId: RegistrosDoSignatario.DocumentoId } 
            })
    
            const TotalDeAssinaturas = await Signatario.count({ 
                where: { SignatarioStatusAssinatura: 'Assinado', DocumentoId: RegistrosDoSignatario.DocumentoId } 
            })

            const Data = new Date();
    
            let Mensagem = 'Assinou em '+Data.toLocaleString('pt-BR');        

            //new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')
            
            Signatario.update({ 
                SignatarioMensagemSobreVisualizacaoDoLinkDeAssinatura: Mensagem,
                SignatarioStatusAssinatura: 'Assinado',
             }, { where: { SignatarioToken: Requisicao.body.SignatarioToken } })

            Documento.update({
                DocumentoChaveAssinatura: DadosCriptografiaAssimetrica.Assinatura,
                DocumentoChavePublica: DadosCriptografiaAssimetrica.ChavePublica,
                ArquivoAssinadoId: ArquivoId,
                DocumentoStatusAssinatura: (TotalDeSignatarios == TotalDeAssinaturas ? 'Assinado' : 'Em Processo')
            }, {
                where: {
                    DocumentoId: RegistrosDoDocumento.DocumentoId
                }
            })

        }
    }   

    const RegistrosDosDocumentosExtras = await DocumentoExtra.findAll({ where: { DocumentoId: RegistrosDoSignatario.DocumentoId } })

    for await (let Registros of RegistrosDosDocumentosExtras) {

        const DocumentoBase64Atualizado = await ConstruirPaginaDocumentoExtraComDadosDeAssinaturaProducao(
            Registros.DocumentoExtraId, RegistrosDoSignatario.SignatarioId
        )

        const NomeDoArquivo = Registros.DocumentoExtraId+".pdf"
        const CaminhoDoArquivo = "./Arquivos/Temporario/"+NomeDoArquivo
    
        const ArquivoPDFCriadoComSucesso = await CriarArquivoPDFApartirDoBase64(CaminhoDoArquivo, DocumentoBase64Atualizado)
    
        if (ArquivoPDFCriadoComSucesso) {
            const PDFAssinadoComSucesso = await AssinarPDFcomCertificadoDigital(NomeDoArquivo)
    
            if (PDFAssinadoComSucesso) {
                const BufferDoPDFcomCertificado =  fs.readFileSync("./Arquivos/Temporario/"+Registros.DocumentoExtraId+"_signed.pdf")
                const Base64PDFComCertificado = BufferDoPDFcomCertificado.toString('base64')
                const DadosCriptografiaAssimetrica = AssinarPDFcomCriptografiaAssimetrica(Base64PDFComCertificado)
    
                const { ArquivoId } = await Arquivo.create({ ArquivoBase64: Base64PDFComCertificado })
                
                console.log(ArquivoId)

                DocumentoExtra.update({
                    DocumentoExtraChaveAssinatura: DadosCriptografiaAssimetrica.Assinatura,
                    DocumentoExtraChavePublica: DadosCriptografiaAssimetrica.ChavePublica,
                    ArquivoAssinadoId: ArquivoId,
                }, {
                    where: {
                        DocumentoId: RegistrosDoDocumento.DocumentoId
                    }
                })
    
            }
        }   
    }

    Resposta.json('DocumentoAssinadoComSucesso')
}

