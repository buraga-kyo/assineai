const fs = require("fs");
const QRCode = require('qrcode');

module.exports = async (DocumentoGUID, link) =>  {

    return new Promise((resolve, reject) => {

        QRCode.toFile('./Arquivos/Temporario/'+DocumentoGUID+'_QRCode.png', link, {
            errorCorrectionLevel: 'H'
        }, function(err) {
            if (err) throw err;
            const QRCodeBuffer = fs.readFileSync('./Arquivos/Temporario/'+DocumentoGUID+'_QRCode.png');
            resolve(QRCodeBuffer)
        });        

    })

}