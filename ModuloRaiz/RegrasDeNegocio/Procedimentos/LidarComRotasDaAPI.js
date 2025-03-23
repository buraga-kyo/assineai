const rotas = require("express").Router()
const CriarDocumentoViaAPI = require("./CriarDocumentoViaAPI")
const AdicionarDocumentoExtraViaAPI = require("./AdicionarDocumentoExtraViaAPI")
const AssinarDocumentoViaAPI = require("./AssinarDocumentoViaAPI")
const ListarTodosDocumentos = require("./ListarTodosDocumentos")
const ListarTodasAssinaturas = require("./ListarTodasAssinaturas")
const ListarDetalheAssinatura = require("./ListarDetalheAssinatura")
const ListarDetalheDoDocumento = require("./ListarDetalheDoDocumento")
const ListarDetalhesDoSignatario = require("./ListarDetalhesDoSignatario")
const ListarDetalheDoDocumentoAPartirDoTokenDoSignatario = require("./ListarDetalheDoDocumentoAPartirDoTokenDoSignatario")
const ListarDocumentosAguardandoAssinatura = require("./ListarDocumentosAguardandoAssinatura")
const RecuperarArquivoOriginalEmBase64 = require("./RecuperarArquivoOriginalEmBase64")
const RecuperarArquivoAssinadoEmBase64 = require("./RecuperarArquivoAssinadoEmBase64")
const RecuperarArquivoPrincipalOriginalEmBase64 = require("./RecuperarArquivoPrincipalOriginalEmBase64")
const RecuperarArquivoPrincipalAssinadoEmBase64 = require("./RecuperarArquivoPrincipalAssinadoEmBase64")
const EnviarEmailDeConfirmacaoDeDadosComToken = require("./EnviarEmailDeConfirmacaoDeDadosComToken")
const RecuperarTokenQueVaiSerEnviadoNoEmailDoSignatario = require("./RecuperarTokenQueVaiSerEnviadoNoEmailDoSignatario")
const VerificarAutenticidadeDoTokenInseridoPeloSignatario = require("./VerificarAutenticidadeDoTokenInseridoPeloSignatario")
const RecuperarTodosDocumentosEmBase64 = require("./RecuperarTodosDocumentosEmBase64")
const CriarAssinaturaViaAPI = require("./CriarAssinaturaViaAPI")
const GCR_AssinarDocumentoViaAPI = require("./GCR_AssinarDocumentoViaAPI")
const GCA_AssinarDocumentoViaAPI = require("./GCA_AssinarDocumentoViaAPI")
const AssineAi_AssinarDocumentoViaAPI = require("./AssineAi_AssinarDocumentoViaAPI")
const ValidarToken = require("./ValidarToken")
const EnviarToken = require("./EnviarToken")
const multer = require('multer');

rotas.post("AtualizarTemaTelaAssinatura", async (req, res) => {
    console.log(req.body)
    const { Empresa } = require("../../BancoDeDados/Conector").Tabelas;
    const retorno = await Empresa.create({
        EmpresaTemaTelaAssinatura: 'assinaturaNome',
    });
    res.send(retorno)
})

rotas.post("/ValidarToken", ValidarToken)

rotas.post("/AssineAi_AssinarDocumentoViaAPI", AssineAi_AssinarDocumentoViaAPI)

rotas.post('/EnviarToken', EnviarToken)

rotas.post("/teste", async (req, res) => {
    const { PDFDocument, StandardFonts, rgb, PDFName, PDFString, degrees } = require("pdf-lib");
    const fs = require("fs");

    const BufferDoBase64 = Buffer.from(req.body.base64, 'base64')
    const PDF = await PDFDocument.load(BufferDoBase64)
    const HelveticaBold = await PDF.embedFont(StandardFonts.HelveticaBold)
    var Pagina = PDF.getPage(req.body.page - 1)

    Pagina.drawText('Assinaturas', {
        x: req.body.x,
        y: Pagina.getHeight() - req.body.y,
        size: 15,
        font: HelveticaBold,
        color: rgb(0.14, 0.14, 0.14)
    })

    const BytesDoPDF = await PDF.save()
    const DocumentoBase64Atualizado = Buffer.from(BytesDoPDF).toString('base64')

    fs.writeFile('./teste222.pdf', DocumentoBase64Atualizado, 'base64', Erro => {
        if (Erro) {
            res.send(Erro)
        } else {
            res.send("ok")
        }
    });
})

rotas.post("/GCA_AssinarDocumentoViaAPI", GCA_AssinarDocumentoViaAPI)
rotas.post("/GCR_AssinarDocumentoViaAPI", GCR_AssinarDocumentoViaAPI)

const storage = multer.memoryStorage();
const upload = multer({ storage });
rotas.post("/CriarAssinaturaViaAPI", upload.any(), CriarAssinaturaViaAPI)
rotas.post("/ListarTodasAssinaturas", ListarTodasAssinaturas)
rotas.get("/ListarDetalheAssinatura", ListarDetalheAssinatura)
rotas.get("/ListarDetalhesDoSignatario", ListarDetalhesDoSignatario)

rotas.post("/AssinarDocumentoViaAPI", AssinarDocumentoViaAPI)

rotas.post("/CriarDocumentoViaAPI", CriarDocumentoViaAPI)
rotas.post("/ListarTodosDocumentos", ListarTodosDocumentos)
rotas.post("/EnviarEmailDeConfirmacaoDeDadosComToken", EnviarEmailDeConfirmacaoDeDadosComToken)
rotas.post("/VerificarAutenticidadeDoTokenInseridoPeloSignatario", VerificarAutenticidadeDoTokenInseridoPeloSignatario)
rotas.post("/AdicionarDocumentoExtraViaAPI/:DocumentoToken", AdicionarDocumentoExtraViaAPI)

rotas.get("/RecuperarTodosDocumentosEmBase64/:DocumentoId", RecuperarTodosDocumentosEmBase64)
rotas.get("/ListarDetalheDoDocumentoAPartirDoTokenDoSignatario/:SignatarioToken", ListarDetalheDoDocumentoAPartirDoTokenDoSignatario)
rotas.get("/ListarDetalheDoDocumento/:DocumentoToken", ListarDetalheDoDocumento)
rotas.get("/ListarDocumentosAguardandoAssinatura/:SignatarioToken", ListarDocumentosAguardandoAssinatura)
rotas.get("/RecuperarTokenQueVaiSerEnviadoNoEmailDoSignatario/:SignatarioToken", RecuperarTokenQueVaiSerEnviadoNoEmailDoSignatario)
rotas.get("/RecuperarArquivoOriginalEmBase64/:DocumentoExtraId", RecuperarArquivoOriginalEmBase64)
rotas.get("/RecuperarArquivoAssinadoEmBase64/:DocumentoExtraId", RecuperarArquivoAssinadoEmBase64)
rotas.get("/RecuperarArquivoPrincipalOriginalEmBase64/:DocumentoId", RecuperarArquivoPrincipalOriginalEmBase64)
rotas.get("/RecuperarArquivoPrincipalAssinadoEmBase64/:DocumentoId", RecuperarArquivoPrincipalAssinadoEmBase64)

module.exports = rotas
