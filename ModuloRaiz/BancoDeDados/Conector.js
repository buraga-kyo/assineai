const Configuracao = require("./Configuracao");
const Sequelize = require("sequelize");
const Documento = require("./Tabelas/Documento");
const Signatario = require("./Tabelas/Signatario");
const Usuario = require("./Tabelas/Usuario");
const PDFBase64 = require("./Tabelas/PDFBase64");
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
  PDFBase64: PDFBase64(InstanciaConfiguradaDoSequelize, Sequelize),
  Signatario: Signatario(InstanciaConfiguradaDoSequelize, Sequelize),
  Usuario: Usuario(InstanciaConfiguradaDoSequelize, Sequelize),
};

BancoDeDados.Tabelas.PDFBase64.belongsTo(BancoDeDados.Tabelas.Documento, {
    constraint: true,
    foreignKey: 'DocumentoId'    
})

// Um signatario para um documento
BancoDeDados.Tabelas.Signatario.belongsTo(BancoDeDados.Tabelas.Documento, {
    constraint: true,
    foreignKey: 'DocumentoId'
})

// um documento para muitos signatarios
BancoDeDados.Tabelas.Documento.hasMany(BancoDeDados.Tabelas.Signatario, {
    foreignKey: 'DocumentoId'
});

module.exports = BancoDeDados;
