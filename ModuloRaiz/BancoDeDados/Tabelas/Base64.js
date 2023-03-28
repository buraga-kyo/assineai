module.exports = (InstanciaConfiguradaDoSequelize, Sequelize) => {
    const Base64 = InstanciaConfiguradaDoSequelize.define("Documento", {
      Base64Tipo: {
        type: Sequelize.STRING,
      },
      Base64: {
        type: Sequelize.TEXT,
      }
    });
  
    return Base64;
};
  