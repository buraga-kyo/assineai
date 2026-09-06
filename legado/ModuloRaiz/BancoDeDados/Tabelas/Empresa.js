module.exports = (InstanciaConfiguradaDoSequelize, Sequelize) => {

    const Empresa = InstanciaConfiguradaDoSequelize.define("Empresa", {
        EmpresaId: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        EmpresaUsuario: {
            type: Sequelize.STRING,
        },
        EmpresaSenha: {
            type: Sequelize.STRING,
        },
        EmpresaNome: {
            type: Sequelize.STRING,
        },
        EmpresaCNPJ: {
            type: Sequelize.STRING,
        },
        EmpresaEmail: {
            type: Sequelize.STRING,
        },
        EmpresaTemaTelaAssinatura: {
            type: Sequelize.STRING,
        }
    });

    return Empresa;
}; 
