const rotas = require("express").Router()
const CriarDocumentoViaAPI = require("./CriarDocumentoViaAPI")
const AdicionarDocumentoExtraViaAPI = require("./AdicionarDocumentoExtraViaAPI")
const AssinarDocumentoViaAPI = require("./AssinarDocumentoViaAPI")
const ListarTodosDocumentos = require("./ListarTodosDocumentos")
const ListarDetalheDoDocumento = require("./ListarDetalheDoDocumento")
const ListarDocumentosAguardandoAssinatura = require("./ListarDocumentosAguardandoAssinatura")
const RecuperarArquivoOriginalEmBase64 = require("./RecuperarArquivoOriginalEmBase64")
const RecuperarArquivoAssinadoEmBase64 = require("./RecuperarArquivoAssinadoEmBase64")

rotas.post("/CriarDocumentoViaAPI", CriarDocumentoViaAPI)
rotas.post("/AdicionarDocumentoExtraViaAPI/:DocumentoToken", AdicionarDocumentoExtraViaAPI)
rotas.post("/AssinarDocumentoViaAPI", AssinarDocumentoViaAPI)

rotas.post("/ListarTodosDocumentos", ListarTodosDocumentos)

rotas.get("/ListarDetalheDoDocumento/:DocumentoToken", ListarDetalheDoDocumento)
rotas.get("/ListarDocumentosAguardandoAssinatura/:SignatarioToken", ListarDocumentosAguardandoAssinatura)
rotas.get("/RecuperarArquivoOriginalEmBase64/:DocumentoExtraId", RecuperarArquivoOriginalEmBase64)
rotas.get("/RecuperarArquivoAssinadoEmBase64/:DocumentoExtraId", RecuperarArquivoAssinadoEmBase64)

const teste = require("./LidadorDeAssinaturaViaAPI_Backup")
rotas.post("/teste", teste)

module.exports = rotas
