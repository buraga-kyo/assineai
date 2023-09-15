const nodemailer = require("nodemailer");

module.exports = async (Requisicao, Resposta) => {

    const Transportador = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_SENHA,
        }
    })

    const Configuracoes = {
        from: process.env.EMAIL_FROM,
        to: Requisicao.body.Destino,
        subject: Requisicao.body.Titulo,
        text: Requisicao.body.Conteudo
    }

    Transportador.sendMail(Configuracoes, (Erro) => {
        if (Erro) {
            console.log(Erro)
            Resposta.sendStatus(500)
        } else {
            Resposta.sendStatus(200)
        }
    })

};