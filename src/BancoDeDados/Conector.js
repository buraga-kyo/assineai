const Configuracao = require("./Configuracao");
const Sequelize = require("sequelize");
const Documento = require("../Tabelas/Documento");
const Signatario = require("../Tabelas/Signatario");
const Usuario = require("../Tabelas/Usuario");
const BancoDeDados = {};

const InstanciaConfiguradaDoSequelize = new Sequelize(
  Configuracao.DB,
  Configuracao.USER,
  Configuracao.PASSWORD,
  {
    host: Configuracao.HOST,
    dialect: Configuracao.dialect,
    operatorsAliases: false,
    pool: {
      max: Configuracao.pool.max,
      min: Configuracao.pool.min,
      acquire: Configuracao.pool.acquire,
      idle: Configuracao.pool.idle,
    },
  }
);

BancoDeDados.Sequelize = Sequelize;
BancoDeDados.InstanciaConfiguradaDoSequelize = InstanciaConfiguradaDoSequelize;

BancoDeDados.Tabelas = {
  Documento: Documento(InstanciaConfiguradaDoSequelize, Sequelize),
  Signatario: Signatario(InstanciaConfiguradaDoSequelize, Sequelize),
  Usuario: Usuario(InstanciaConfiguradaDoSequelize, Sequelize),
};

BancoDeDados.Tabelas.Documento.hasMany(BancoDeDados.Tabelas.Signatario);
BancoDeDados.Tabelas.Documento.belongsTo(BancoDeDados.Tabelas.Signatario);

module.exports = BancoDeDados;
