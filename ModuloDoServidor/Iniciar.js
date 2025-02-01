require('dotenv').config({ path: __dirname + '/.env' })
require("../ModuloRaiz/BancoDeDados/Conector")
    .InstanciaConfiguradaDoSequelize
    .sync({ alter: true })
    .catch(erro => console.log(erro))

const express = require("express")
const cors = require("cors")
const morgan = require('morgan')

process.env.BaseDir = __dirname;
//process.env.SENHA_DO_CERTIFICADO=25397272;

const LidarComRotasDaAPI = require("../ModuloRaiz/RegrasDeNegocio/Procedimentos/LidarComRotasDaAPI")

const Servidor = express()

Servidor.use(morgan('dev'))
Servidor.use(cors())
Servidor.use(express.json({ limit: '50mb' }))
Servidor.use(express.urlencoded({ extended: false }))
Servidor.use(LidarComRotasDaAPI)
Servidor.listen(process.env.PORT || 4004)


