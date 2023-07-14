const rotas = require("express").Router()
const CriarDocumentoViaAPI = require("./CriarDocumentoViaAPI")
const AdicionarDocumentoExtraViaAPI = require("./AdicionarDocumentoExtraViaAPI")
const AssinarDocumentoViaAPI = require("./AssinarDocumentoViaAPI")
const teste = require("./LidadorDeAssinaturaViaAPI_Backup")

rotas.post("/CriarDocumentoViaAPI", CriarDocumentoViaAPI)
rotas.post("/AdicionarDocumentoExtraViaAPI/:DocumentoToken", AdicionarDocumentoExtraViaAPI)
rotas.post("/AssinarDocumentoViaAPI", AssinarDocumentoViaAPI)
rotas.post("/teste", teste)

module.exports = rotas
