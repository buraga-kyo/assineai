const { Documento, Signatario, Arquivo } = require("../../../BancoDeDados/Conector").Tabelas;
const { PDFDocument, StandardFonts, rgb } = require("pdf-lib");

module.exports = async (DocumentoBase64, DocumentoId) =>  {


    const { dataValues: { DocumentoGUID } } = await Documento.findByPk(DocumentoId)

    console.log("DocumentoGUID: "+DocumentoGUID)

    const BufferDoBase64 = Buffer.from(DocumentoBase64, 'base64');

    const PDF = await PDFDocument.load(BufferDoBase64)
    const HelveticaBold = await PDF.embedFont(StandardFonts.HelveticaBold)
    const Helvetica = await PDF.embedFont(StandardFonts.Helvetica)

    const pagina = PDF.addPage();

    pagina.drawText('(Assina AI Logo)', {
        x: 15,
        y: 800,
        size: 15,
        font: HelveticaBold
    })

    pagina.drawText('Relatório de Assinaturas', {
        x: 140,
        y: 800,
        size: 10,
        font: Helvetica
    })

    pagina.drawText('Datas e Horários em UTC-0300 (America/Sao_Paulo)', {
        x: 400,
        y: 810,
        size: 7,
        font: Helvetica
    })

    pagina.drawText('Última atualização em 28 Março 2023, 10:19', {
        x: 427,
        y: 800,
        size: 7,
        font: Helvetica
    })

    const QuantidadeDePaginas = PDF.getPageIndices()

    for (const PaginaAtual of QuantidadeDePaginas) {
        const Pagina = PDF.getPage(PaginaAtual)

        Pagina.drawText('Assina AI 123ahsdu-123siaud-saduashi',  {
            x: 15,
            y: 10,
            size: 7,
            font: Helvetica
        })
    }

    const BytesDoPDF = await PDF.save()
    const DocumentoBase64Atualizado = Buffer.from(BytesDoPDF).toString('base64')

    return DocumentoBase64Atualizado
}