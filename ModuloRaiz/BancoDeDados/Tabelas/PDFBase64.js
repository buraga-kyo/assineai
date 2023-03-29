module.exports = (InstanciaConfiguradaDoSequelize, Sequelize) => {
    const PDFBase64 = InstanciaConfiguradaDoSequelize.define("PDFBase64", {
        PDFBase64Id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true
        },          
        PDFBase64Original: {
            type: Sequelize.TEXT,
        },
        PDFBase64Assinado: {
            type: Sequelize.TEXT,
        }      
    });
  
    return PDFBase64;
};
  