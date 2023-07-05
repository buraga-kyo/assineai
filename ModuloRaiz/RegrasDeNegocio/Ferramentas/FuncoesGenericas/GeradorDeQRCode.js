const fs = require("fs");
const QRCode = require('qrcode');

module.exports = async (DocumentoGUID, link) =>  {

    return new Promise((resolve, reject) => {

        QRCode.toFile('./ArquivosTemporarios/'+DocumentoGUID+'_QRCode.png', link, {
            errorCorrectionLevel: 'H'
        }, function(err) {
            if (err) throw err;
            const QRCodeBuffer = fs.readFileSync('./ArquivosTemporarios/'+DocumentoGUID+'_QRCode.png');
            resolve(QRCodeBuffer)
        });        

    })

}