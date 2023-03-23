const CriarRegistros = require("../BancoDeDados/Consultas/CriarRegistros");
const ConstruirPaginaComDadosDeAssinatura = require("../Ferramentas/ManipulacaoDePDF/ConstruirPaginaComDadosDeAssinatura");
const AssinarPDFcomCertificadoDigital = require("../Ferramentas/LidadorDeAssinatura/CertificadoDigital");
const fs = require("fs");

module.exports = async (Requisicao, Resposta, ProximaFuncao) => {
    
    const DocumentoBase64 = Requisicao.body.DocumentoBase64
    const IdDoDocumento = await CriarRegistros.Documento(Requisicao.body.DocumentoNome, DocumentoBase64);

    const RegistroDoSignatario = {
        SignatarioNome: Requisicao.body.SignatarioNome,
        SignatarioEmail: Requisicao.body.SignatarioEmail,
        SignatarioModoAutenticacao: Requisicao.body.SignatarioModoAutenticacao,
        SignatarioIp: Requisicao.connection.remoteAddress || Requisicao.socket.remoteAddress || Requisicao.connection.socket.remoteAddress,
        SignatarioDispositivo: JSON.stringify(Requisicao.headers),
        SignatarioToken: Requisicao.body.SignatarioToken,
        DocumentoId: IdDoDocumento
    }; 

    const IdDoSignatario = await CriarRegistros.Signatario(RegistroDoSignatario)

    const DocumentoBase64Atualizado = await ConstruirPaginaComDadosDeAssinatura(DocumentoBase64)

    const NomdeDoArquivo = "./ArquivosTemporarios/"+IdDoDocumento+".pdf"

    fs.writeFile(NomdeDoArquivo, DocumentoBase64Atualizado, 'base64', error => {
        if (error) {
            throw error;
        } else {
            exec('gswin32c -dPDFA=1 -dBATCH -dNOPAUSE -dNOOUTERSAVE -dPDFSETTINGS=/printer -dCompatibilityLevel="1.4" -dPDFACompatibilityPolicy=1 -dUseCIEColor -sProcessColorModel=DeviceRGB -sColorConversionStrategy=RGB -sDEVICE=pdfwrite -sOutputFile="'+NomdeDoArquivo+'" "_'+NomdeDoArquivo+'" "PDFA_def.ps"')
            console.log('base64 saved!');
        }
    });    

    //const resultado = await AssinarPDFcomCertificadoDigital(DocumentoBase64Atualizado)

    // console.log(DocumentoBase64Atualizado)
    // console.log(IdDoSignatario)
    
    Resposta.sendStatus(200)
    
    //  gswin32c -dPDFA=1 -dBATCH -dNOPAUSE -dNOOUTERSAVE -dPDFSETTINGS=/printer -dCompatibilityLevel="1.4" -dPDFACompatibilityPolicy=1 -dUseCIEColor -sProcessColorModel=DeviceRGB -sColorConversionStrategy=RGB -sOutputICCProfile="AdobeRGB1998.icc"  -sDEVICE=pdfwrite -sOutputFile="1.pdf" "2.pdf" "PDFA_def.ps"

    




    
    // gs -dPDFA -dBATCH -dNOPAUSE -dUseCIEColor -sProcessColorModel=DeviceCMYK -sDEVICE=pdfwrite -sPDFACompatibilityPolicy=1 -sOutputFile=output_filename.pdf input_filename.pdf
}