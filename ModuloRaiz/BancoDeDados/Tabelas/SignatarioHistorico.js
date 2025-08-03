module.exports = (InstanciaConfiguradaDoSequelize, Sequelize) => {
    const SignatarioHistorico = InstanciaConfiguradaDoSequelize.define("SignatarioHistorico", {
        SignatarioHistoricoId: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        SignatarioHistoricoStatus: {
            type: Sequelize.STRING,
        },
        SignatarioHistoricoIp: {
            type: Sequelize.TEXT,
        },
        SignatarioHistoricoDispositivo: {
            type: Sequelize.TEXT,
        },
        SignatarioHistoricoAcao: {
            type: Sequelize.STRING,
        }
    });

    return SignatarioHistorico;
}
