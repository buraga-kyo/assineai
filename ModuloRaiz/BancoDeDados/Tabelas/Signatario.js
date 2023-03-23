module.exports = (InstanciaConfiguradaDoSequelize, Sequelize) => {
    const Signatario = InstanciaConfiguradaDoSequelize.define("Signatario", {
        SignatarioToken: {
            type: Sequelize.TEXT
        },
        SignatarioNome: {
            type: Sequelize.STRING,
        },
        SignatarioEmail: {
            type: Sequelize.STRING,
        },
        SignatarioModoAutenticacao: {
            type: Sequelize.STRING,
        },
        SignatarioStatusAssinatura: {
            type: Sequelize.STRING
        },
        SignatarioDataAssinatura: {
            type: Sequelize.STRING
        },
        SignatarioQuantidadeDeAcessosNoLinkDeAssinatura: {
            type: Sequelize.INTEGER
        },
        SignatarioUltimaVisualizacaoNoLinkDeAssinatura: {
            type: Sequelize.STRING
        },
        SignatarioDataAssinatura: {
            type: Sequelize.STRING
        },
        SignatarioIp: {
            type: Sequelize.TEXT,
        },
        SignatarioDispositivo: {
            type: Sequelize.TEXT,
        },
        SignatarioGeoLatitude: {
            type: Sequelize.TEXT
        },
        SignatarioGeoLongitude: {
            type: Sequelize.TEXT
        }
    });

    return Signatario;
}
