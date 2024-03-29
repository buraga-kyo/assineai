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
        DocumentoOriginalURLS3: {
            type: Sequelize.TEXT,
        },
        DocumentoEmAndamentoURLS3: {
            type: Sequelize.TEXT,
        },
        DocumentoAssinadoURLS3: {
            type: Sequelize.TEXT,
        },
        DocumentoChaveS3: {
            type: Sequelize.TEXT,
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
        }
    });

    return AssinaturaDocumentos;
};
