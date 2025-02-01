module.exports = (InstanciaConfiguradaDoSequelize, Sequelize) => {
    const AssinaturaSignatarios = InstanciaConfiguradaDoSequelize.define("AssinaturaSignatarios", {
        SignatarioId: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        SignatarioFormaDeAutenticacao: {
            type: Sequelize.ARRAY(Sequelize.STRING)
        },
        SignatarioAssinou: {
            type: Sequelize.BOOLEAN,
        },
        SignatarioNome: {
            type: Sequelize.STRING,
        },
        SignatarioEmail: {
            type: Sequelize.STRING,
        },
        SignatarioRG: {
            type: Sequelize.STRING,
        },
        SignatarioCPF: {
            type: Sequelize.STRING,
        },
        SignatarioWhatsApp: {
            type: Sequelize.STRING,
        },
        SignatarioTokenEmail: {
            type: Sequelize.STRING
        },
        SignatarioTokenWhatsApp: {
            type: Sequelize.STRING
        },
        SignatarioTokenLinkAssinatura: {
            type: Sequelize.TEXT
        },
        SignatarioLinkAssinatura: {
            type: Sequelize.TEXT
        },
        SignatarioQualificacao: {
            type: Sequelize.STRING,
        },
        SignatarioSituacaoAssinatura: {
            type: Sequelize.STRING
        },
        SignatarioDataAssinatura: {
            type: Sequelize.STRING
        },
        SignatarioQuantidadeDeAcessosNoLinkDeAssinatura: {
            type: Sequelize.STRING,
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
        SignatarioGeolocalizacao: {
            type: DataTypes.GEOGRAPHY('POINT'),
        }
    });

    return AssinaturaSignatarios;
}
