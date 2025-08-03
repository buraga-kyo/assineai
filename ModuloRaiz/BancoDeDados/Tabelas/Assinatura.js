module.exports = (InstanciaConfiguradaDoSequelize, Sequelize) => {
    
    const Assinatura = InstanciaConfiguradaDoSequelize.define("Assinatura", {
        AssinaturaId: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },    
        AssinaturaNome: {
            type: Sequelize.STRING,
        },            
        AssinaturaResponsavel: {
            type: Sequelize.STRING,
        },
        AssinaturaStatus: {
            type: Sequelize.STRING,
        },
        AssinaturaQuantidadeDocumentoAssinado: {
            type: Sequelize.STRING,
        }
    });

    return Assinatura;
}; 
