const rotas = require("express").Router();
const LidadorDeAssinaturaViaAPI = require("../Procedimentos/LidadorDeAssinaturaViaAPI");

rotas.post("/CriarDocumentoViaAPI", LidadorDeAssinaturaViaAPI);

module.exports = rotas;
