const passport = require("passport");
const EstrategiaLocal = require("passport-local");
const { Usuario } = require("../../BancoDeDados/Conector").Tabelas;
const crypto = require("crypto");

exports.VerificarUsuarioCadastrado = (
  { body: { usuario } },
  resultado,
  proximaFuncao,
) => {
  // Verificando se existe um usuário com o mesmo login no BD
  Usuario.findOne({
    where: { UsuarioLogin: usuario.trim() },
  })
    .then((UsuarioBD) => {
      if (UsuarioBD) {
        resultado.send("Já existe um usuário com o mesmo login.");
      } else {
        proximaFuncao();
      }
    })
    .catch((erro) => resultado.status(500).send(erro));
};

exports.CriarUsuario = (
  { body: { usuario, senha } },
  resultado,
  proximaFuncao,
) => {
  const BytesRandomicos = crypto.randomBytes(16);

  crypto.pbkdf2(
    senha,
    BytesRandomicos,
    310000,
    32,
    "sha256",
    function (erro, senhaCriptografada) {
      if (erro) {
        resultado.status(500).send(erro);
      }

      const Registro = {
        UsuarioLogin: usuario,
        UsuarioSenha: senhaCriptografada.toLocaleString(),
        UsuarioBytesRandomicos: BytesRandomicos,
      };

      Usuario.create(Registro)
        .then(() => {
          resultado.status(200).send("Usuário cadastrado com sucesso!");
          proximaFuncao();
        })
        .catch((erro) => resultado.status(500).send(erro));
    },
  );
};

exports.LogarUsuario = (
  { body: { usuario, senha } },
  resultado,
  proximaFuncao,
) => {
  /*
  passport.use(
    new EstrategiaLocal(function verify(usuario, senha) {
      Usuario.findOne({
        where: { UsuarioLogin: usuario.trim() },
      })
        .then((UsuarioBD) => {
          if (UsuarioBD) {
            crypto.pbkdf2(
              UsuarioBD.UsuarioSenha,
              UsuarioBD.UsuarioBytesRandomicos,
              310000,
              32,
              "sha256",
              function (erro, senhaCriptografada) {
                if (erro) {
                  resultado.status(500).send("Usuário ou senha incorretos.");
                  proximaFuncao();
                }
                if (
                  !crypto.timingSafeEqual(
                    UsuarioBD.UsuarioSenha,
                    senhaCriptografada
                  )
                ) {
                  resultado.status(500).send("Usuário ou senha incorretos.");
                  proximaFuncao();
                }
                resultado.status(200).send(UsuarioBD);
                proximaFuncao();
              }
            );
          } else {
            resultado.send("Usuário ou senha incorretos.");
            proximaFuncao();
          }
        })
        .catch((erro) => resultado.status(500).send(erro));
    })
  );*/
};
