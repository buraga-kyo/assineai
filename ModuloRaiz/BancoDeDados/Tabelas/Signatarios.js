module.exports = (InstanciaConfiguradaDoSequelize, Sequelize) => {
    const Signatarios = InstanciaConfiguradaDoSequelize.define("Signatarios", {         
        SignatarioId: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },           
        SignatarioNome: {
            type: Sequelize.STRING,
        },        
        SignatarioEmail: {
            type: Sequelize.STRING,
        },
        SignatarioTokenEmail: {
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
        }
    });

    return Signatarios;
}
