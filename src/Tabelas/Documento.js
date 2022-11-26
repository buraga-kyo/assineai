module.exports = (InstanciaConfiguradaDoSequelize, Sequelize) => {
    
	const Documento = InstanciaConfiguradaDoSequelize.define("Documento", {
        DocumentoNome: {
            type: Sequelize.STRING,
        },
        DocumentoBase64: {
            type: Sequelize.TEXT,
        },
        DocumentoChavePublica: {
            type: Sequelize.STRING,
        },
    });

	return Documento;
};
