const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');

module.exports = async (DocumentoGUID, link) => {
  return new Promise((resolve, reject) => {
    const filePath =
      path.join(process.env.BaseDir, 'Arquivos', 'Temporario', `${DocumentoGUID}_QRCode.png`);

    QRCode.toFile(
      filePath,
      link,
      { errorCorrectionLevel: 'H' },
      function (err) {
        if (err) {
          return reject(err);
        }

        try {
          const qrCodeBuffer = fs.readFileSync(filePath);
          fs.unlinkSync(filePath);
          resolve(qrCodeBuffer);
        } catch (readErr) {
          reject(readErr);
        }
      }
    );
  });
};
