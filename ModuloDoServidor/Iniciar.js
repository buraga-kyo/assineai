require('dotenv').config()

require("../ModuloRaiz/BancoDeDados/Conector")
    .InstanciaConfiguradaDoSequelize
    .sync({ force: true })
    .catch(erro => console.log(erro))

const express = require("express")
const cors = require("cors")
const morgan = require('morgan')

const LidarComRotasDaAPI = require("../ModuloRaiz/RegrasDeNegocio/Procedimentos/LidarComRotasDaAPI")

const Servidor = express()

Servidor.use(morgan('dev'))
Servidor.use(cors())
Servidor.use(express.json({limit: '50mb'}))
Servidor.use(express.urlencoded({ extended: false}))
Servidor.use(LidarComRotasDaAPI)
Servidor.listen(process.env.PORT || 4004)


