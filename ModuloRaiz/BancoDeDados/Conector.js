const Configuracao = require("./Configuracao");
const Sequelize = require("sequelize");

const Assinatura = require("./Tabelas/Assinatura");
const Documentos = require("./Tabelas/Documentos");
const Signatarios = require("./Tabelas/Signatarios");
const SignatarioHistorico = require("./Tabelas/SignatarioHistorico");

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
  Assinatura: Assinatura(InstanciaConfiguradaDoSequelize, Sequelize),
  Documentos: Documentos(InstanciaConfiguradaDoSequelize, Sequelize),
  Signatarios: Signatarios(InstanciaConfiguradaDoSequelize, Sequelize),
  SignatarioHistorico: SignatarioHistorico(InstanciaConfiguradaDoSequelize, Sequelize),
  InstanciaConfiguradaDoSequelize
};

// Associações
BancoDeDados.Tabelas.Assinatura.hasMany(BancoDeDados.Tabelas.Documentos, { foreignKey: 'AssinaturaId' });
BancoDeDados.Tabelas.Documentos.belongsTo(BancoDeDados.Tabelas.Assinatura, { foreignKey: 'AssinaturaId' });
BancoDeDados.Tabelas.Assinatura.hasMany(BancoDeDados.Tabelas.Signatarios, { foreignKey: 'AssinaturaId' });
BancoDeDados.Tabelas.Signatarios.belongsTo(BancoDeDados.Tabelas.Assinatura, { foreignKey: 'AssinaturaId' });

BancoDeDados.Tabelas.Signatarios.hasMany(BancoDeDados.Tabelas.SignatarioHistorico, { foreignKey: 'SignatarioId', as: "historicos" });
BancoDeDados.Tabelas.SignatarioHistorico.belongsTo(BancoDeDados.Tabelas.Signatarios, { foreignKey: 'SignatarioId' });


module.exports = BancoDeDados;