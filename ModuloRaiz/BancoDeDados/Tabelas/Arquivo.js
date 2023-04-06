module.exports = (InstanciaConfiguradaDoSequelize, Sequelize) => {
    const Arquivo = InstanciaConfiguradaDoSequelize.define("Arquivo", {
        ArquivoId: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true
        },          
        ArquivoBase64: {
            type: Sequelize.TEXT,
        }
    });
  
    return Arquivo;
};
  