module.exports = (InstanciaConfiguradaDoSequelize, Sequelize) => {
  const Documento = InstanciaConfiguradaDoSequelize.define("Documento", {
    DocumentoId: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    DocumentoToken: {
      type: Sequelize.TEXT,
    },
    DocumentoNome: {
      type: Sequelize.STRING,
    },
    DocumentoChavePublica: {
      type: Sequelize.TEXT,
    },
    DocumentoChaveAssinatura: {
      type: Sequelize.TEXT,
    },
    DocumentoStatusAssinatura: {
      type: Sequelize.STRING,
    }
  });

  return Documento;
};
