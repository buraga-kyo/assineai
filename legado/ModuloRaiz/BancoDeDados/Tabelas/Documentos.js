module.exports = (InstanciaConfiguradaDoSequelize, Sequelize) => {
    const AssinaturaDocumentos = InstanciaConfiguradaDoSequelize.define("AssinaturaDocumentos", {
        DocumentoId: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        DocumentoTitulo: {
            type: Sequelize.STRING,
        },
        DocumentoBuffer: {
            type: Sequelize.BLOB
        },
        DocumentoAssinadoBuffer: {
            type: Sequelize.BLOB
        },
        DocumentoColecaoDeDivArrastavel: {
            type: Sequelize.JSON
        },
        DocumentoToken: {
            type: Sequelize.TEXT,
        },
        DocumentoCriptografiaChavePublica: {
            type: Sequelize.TEXT,
        },
        DocumentoCriptografiaAssinatura: {
            type: Sequelize.TEXT
        },
        DocumentoHashDoPDFOriginal: {
            type: Sequelize.TEXT,
        },
        DocumentoLinkAutenticacao: {
            type: Sequelize.TEXT,
        }
    });

    return AssinaturaDocumentos;
};
