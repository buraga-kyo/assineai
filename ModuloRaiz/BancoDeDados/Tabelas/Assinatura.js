module.exports = (InstanciaConfiguradaDoSequelize, Sequelize) => {
    
    const Assinatura = InstanciaConfiguradaDoSequelize.define("Assinatura", {
        AssinaturaId: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
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
