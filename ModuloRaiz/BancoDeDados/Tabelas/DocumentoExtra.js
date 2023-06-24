module.exports = (InstanciaConfiguradaDoSequelize, Sequelize) => {
    const DocumentoExtra = InstanciaConfiguradaDoSequelize.define("DocumentoExtra", {
      DocumentoExtraId: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          allowNull: false,
          primaryKey: true
      },
      DocumentoExtraGUID: {
        type: Sequelize.TEXT,
      },
      DocumentoExtraNome: {
        type: Sequelize.STRING,
      },
      DocumentoExtraChavePublica: {
        type: Sequelize.TEXT,
      },
      DocumentoExtraChaveAssinatura: {
        type: Sequelize.TEXT,
      },
      DocumentoExtraStatusAssinatura: {
        type: Sequelize.STRING,
      }
    });
  
    return DocumentoExtra;
  };
  