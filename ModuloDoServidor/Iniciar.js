require('dotenv').config();
require("../ModuloRaiz/BancoDeDados/Conector").InstanciaConfiguradaDoSequelize.sync({ force: false }).catch(erro => console.log(erro));

const express = require("express");
const cors = require("cors");
const morgan = require('morgan');

const LidadorDeRotasDaAPI = require("../ModuloRaiz/RegrasDeNegocio/Procedimentos/LidadorDeRotaDaAPI");

const Servidor = express();

// Servidor.use((req, res, next) => {
//   res.header('Access-Control-Allow-Origin', '*')
//   res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
//   next()
// })

Servidor.use(morgan('dev'));
Servidor.use(cors()); // { credentials: true, origin: process.env.ORIGIN }
Servidor.use(express.json({limit: '50mb'}));
Servidor.use(express.urlencoded({ extended: false}));
Servidor.use(LidadorDeRotasDaAPI);
//Servidor.use(cors({credentials: true, origin: process.env.ORIGIN}));
Servidor.listen(process.env.PORT || 3000);


