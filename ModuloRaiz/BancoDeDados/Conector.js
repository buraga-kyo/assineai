const Configuracao = require("./Configuracao");
const Sequelize = require("sequelize");
const Documento = require("./Tabelas/Documento");
const Signatario = require("./Tabelas/Signatario");
const Usuario = require("./Tabelas/Usuario");
const Arquivo = require("./Tabelas/Arquivo");
const DocumentoExtra = require("./Tabelas/DocumentoExtra");

const BancoDeDados = {};

const InstanciaConfiguradaDoSequelize = new Sequelize(
  Configuracao.DB,
  Configuracao.USER,
  Configuracao.PASSWORD,
  {
    host: Configuracao.HOST,
    dialect: Configuracao.dialect,
    logging: false,
    operatorsAliases: 0,
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
  Arquivo: Arquivo(InstanciaConfiguradaDoSequelize, Sequelize),
  Signatario: Signatario(InstanciaConfiguradaDoSequelize, Sequelize),
  Usuario: Usuario(InstanciaConfiguradaDoSequelize, Sequelize),
  DocumentoExtra: DocumentoExtra(InstanciaConfiguradaDoSequelize, Sequelize)
};

BancoDeDados.Tabelas.DocumentoExtra.belongsTo(BancoDeDados.Tabelas.Documento, {
    constraint: true,
    foreignKey: 'DocumentoId'    
})

BancoDeDados.Tabelas.DocumentoExtra.belongsTo(BancoDeDados.Tabelas.Arquivo, {
    constraint: true,
    foreignKey: 'ArquivoOriginalId'    
})

BancoDeDados.Tabelas.DocumentoExtra.belongsTo(BancoDeDados.Tabelas.Arquivo, {
    constraint: true,
    foreignKey: 'ArquivoAssinadoId'    
})

BancoDeDados.Tabelas.Documento.belongsTo(BancoDeDados.Tabelas.Arquivo, {
    constraint: true,
    foreignKey: 'ArquivoOriginalId'    
})

BancoDeDados.Tabelas.Documento.belongsTo(BancoDeDados.Tabelas.Arquivo, {
    constraint: true,
    foreignKey: 'ArquivoEmAndamentoId'    
})

BancoDeDados.Tabelas.Documento.belongsTo(BancoDeDados.Tabelas.Arquivo, {
    constraint: true,
    foreignKey: 'ArquivoAssinadoId'    
})

// Um signatario para um documento
BancoDeDados.Tabelas.Signatario.belongsTo(BancoDeDados.Tabelas.Documento, {
    constraint: true,
    foreignKey: 'DocumentoId'
})

// um documento para muitos signatarios
BancoDeDados.Tabelas.Documento.hasMany(BancoDeDados.Tabelas.Signatario, {
    foreignKey: 'DocumentoId', as: 'Signatarios'
})

module.exports = BancoDeDados;