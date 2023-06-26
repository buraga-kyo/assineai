const rotas = require("express").Router();
const CriarDocumentoViaAPI = require("./CriarDocumentoViaAPI");
const AdicionarDocumentoExtraViaAPI = require("./AdicionarDocumentoExtraViaAPI");
const teste = require("./LidadorDeAssinaturaViaAPI_Backup");

rotas.post("/CriarDocumentoViaAPI", CriarDocumentoViaAPI);
rotas.post("/AdicionarDocumentoExtraViaAPI/:guid", AdicionarDocumentoExtraViaAPI);

rotas.post("/teste", teste);

module.exports = rotas;
