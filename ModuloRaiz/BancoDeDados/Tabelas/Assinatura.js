module.exports = (InstanciaConfiguradaDoSequelize, Sequelize) => {
    
    const Assinatura = InstanciaConfiguradaDoSequelize.define("Assinatura", {
        AssinaturaData: {
            type: Sequelize.DATE
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
