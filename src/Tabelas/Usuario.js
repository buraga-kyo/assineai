module.exports = (InstanciaConfiguradaDoSequelize, Sequelize) => {
  const Usuario = InstanciaConfiguradaDoSequelize.define("Usuario", {
    UsuarioLogin: {
      type: Sequelize.STRING,
    },
    UsuarioSenha: {
      type: Sequelize.STRING,
    },
    UsuarioBytesRandomicos: {
      type: Sequelize.STRING.BINARY,
    },
  });

  return Usuario;
};
