module.exports = (InstanciaConfiguradaDoSequelize, Sequelize) => {
    const Signatario = InstanciaConfiguradaDoSequelize.define("Signatario", {
        SignatarioId: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true
        },        
        SignatarioToken: {
            type: Sequelize.TEXT
        },
        SignatarioNome: {
            type: Sequelize.STRING,
        },
        SignatarioEmail: {
            type: Sequelize.STRING,
        },
        SignatarioQualificacao: {
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
        SignatarioMensagemSobreVisualizacaoDoLinkDeAssinatura: {
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
        },
        SignatarioStatusAssinatura: {
            type: Sequelize.STRING
        },
        SignatarioLinkAssinatura:  {
            type: Sequelize.TEXT
        },
        SignatarioTokenEnviadoEmail: {
            type: Sequelize.STRING
        }
    });

    return Signatario;
}
