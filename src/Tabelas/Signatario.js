module.exports = (InstanciaConfiguradaDoSequelize, Sequelize) => {
    const Signatario = InstanciaConfiguradaDoSequelize.define("Signatario", {
        SignatarioNome: {
            type: Sequelize.STRING,
        },
        SignatarioEmail: {
            type: Sequelize.STRING,
        },
        SignatarioModoAutenticacao: {
            type: Sequelize.STRING,
        },
        SignatarioIp: {
            type: Sequelize.TEXT,
        },
        SignatarioDispositivo: {
            type: Sequelize.TEXT,
        },
        SignatarioToken: {
            type: Sequelize.TEXT,
        }
    });

    return Signatario;
}
