module.exports = (InstanciaConfiguradaDoSequelize, Sequelize) => {
  const Documento = InstanciaConfiguradaDoSequelize.define("Documento", {
    DocumentoToken: {
      type: Sequelize.TEXT,
    },
    DocumentoNome: {
      type: Sequelize.STRING,
    },
    DocumentoChavePublica: {
      type: Sequelize.TEXT,
    },
    DocumentoStatusAssinatura: {
      type: Sequelize.STRING,
    },
    DocumentoOriginalBase64: {
      type: Sequelize.TEXT,
    },
    DocumentoAssinadoBase64: {
      type: Sequelize.TEXT,
    }
  });

  return Documento;
};
