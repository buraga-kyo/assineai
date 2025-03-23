module.exports = (InstanciaConfiguradaDoSequelize, Sequelize) => {

    const Empresa = InstanciaConfiguradaDoSequelize.define("Empresa", {
        EmpresaId: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        EmpresaTemaTelaAssinatura: {
            type: Sequelize.STRING,
        }
    });

    return Empresa;
}; 
