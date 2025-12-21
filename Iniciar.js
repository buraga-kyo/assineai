require('dotenv').config({ path: __dirname + '/.env' }) // Carrega as variáveis de ambiente do arquivo .env
require("./ModuloRaiz/BancoDeDados/Conector")
    .InstanciaConfiguradaDoSequelize
    .sync({ alter: true })
    .catch(erro => console.log(erro))

const express = require("express")
const cors = require("cors")
const morgan = require('morgan')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')

process.env.BaseDir = __dirname; // Define o diretório base para o projeto

const LidarComRotasDaAPI = require("./ModuloRaiz/RegrasDeNegocio/Procedimentos/LidarComRotasDaAPI")

const Servidor = express()

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100 // limite de 100 requisições por IP
})
Servidor.use(limiter)
Servidor.use(helmet())
Servidor.use(morgan('combined'))
Servidor.use(cors())
Servidor.use(express.json({ limit: '50mb' }))
Servidor.use(express.urlencoded({ extended: false }))
Servidor.use(LidarComRotasDaAPI)
Servidor.listen(process.env.PORT || 4004)


