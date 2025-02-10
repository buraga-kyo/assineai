const { Assinatura, Signatarios, Documentos } = require("../../BancoDeDados/Conector").Tabelas;
const mandrill = require('@mailchimp/mailchimp_transactional')('md-e1dx4awbFEd78CVxXvATrQ');
const axios = require('axios');

module.exports = async (Requisicao, Resposta) => {
    const signatarios = await Signatarios.findOne({
        raw: true,
        where: {
            SignatarioTokenLinkAssinatura: Requisicao.body.SignatarioToken
        },
        attributes: ["SignatarioTokenWhatsApp", "SignatarioTokenEmail"]
    });
    try {
        const url = 'https://evolutiondesafioia7d.assineae.online/message/sendText/dev_assi';
        
        // Dados a serem enviados
        const data = {
            number: "5521969099714@s.whatsapp.net",
            options: {
                presence: "composing",
                linkPreview: false
            },
            textMessage: {
                text: `Token: ${signatarios.SignatarioTokenWhatsApp}`
            }
        };
        
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'apiKey': 'u7gdscwr46sgxdbhil58q',
            }
        };        

        // Enviar requisição POST
        const respostaWhats = await axios.post(url, data, config)
        console.log(respostaWhats)

        const response = await mandrill.messages.send({
          message: {
            html: `token: ${signatarios.SignatarioTokenEmail}`,
            text: `token: ${signatarios.SignatarioTokenEmail}`,
            subject: `token: ${signatarios.SignatarioTokenEmail}`,
            from_email: 'contato@dwith.com.br',
            to: [{ email: 'bragaus@outlook.com' }],
          },
        });
        console.log('E-mail enviado:', response);

        Resposta.status(200).send(true)
      } catch (error) {
        console.error('Erro:', error);
        Resposta.status(200).send(error)
      }
    
    /*const nodemailer = require('nodemailer');
    
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          type: 'OAuth2',
          user: 'mannoplay@gmail.com', // Seu e-mail do Gmail
          clientId: '310311605738-q236bgra8o2nrsaro9jfhirnts91f6t2.apps.googleusercontent.com',
          clientSecret: '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',
          refreshToken: '1//04AEGcKz80q1HCgYIARAAGAQSNwF-L9Ir4thZsS3NY03I99dANZh3tYv5Avar9r5bP3gLtw8zJkLetIGJJTLkA64WXsS7gqIG4BY',
        },        
        // host: 'smtp.gmail.com',
        // port: 587,
        // secure: false,
        // auth: {
        //     user: 'mannoplay@gmail.com',
        //     pass: '5889813hp',
        // }
    });
    
    const mailOptions = {
        from: 'mannoplay@gmail.com',
        to: 'bragaus@outlook.com',
        //to: `${process.env.MENSAGEIRO_DESTINO_EMAIL}, ${process.env.MENSAGEIRO_DESTINO_EMAIL_COPIA}`,
        subject: 'titulo',
        text: 'corpo'
    };
    
    // Função que, efetivamente, envia o email.
    transporter.sendMail(mailOptions, (erro, info) => {
        if (erro) {
            console.log(erro);
        }
    
        console.log(info);
        res.send(info);
    });   */ 

}