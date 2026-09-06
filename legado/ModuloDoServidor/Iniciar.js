require('dotenv').config()
console.log(typeof process.env.DB_PASS, process.env.DB_PASS)

require("../ModuloRaiz/BancoDeDados/Conector")
    .InstanciaConfiguradaDoSequelize
    .sync({ force: true })
    .catch(erro => console.log(erro))

const express = require("express")
const cors = require("cors")
const morgan = require('morgan')

const LidadorDeRotasDaAPI = require("../ModuloRaiz/RegrasDeNegocio/Procedimentos/LidarComRotasDaAPI.js")

const Servidor = express()

Servidor.use(morgan('dev'))
Servidor.use(cors())
Servidor.use(express.json({limit: '50mb'}))
Servidor.use(express.urlencoded({ extended: false}))
Servidor.use(LidadorDeRotasDaAPI)
Servidor.listen(process.env.PORT || 3000)


