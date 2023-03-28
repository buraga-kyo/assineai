const fs = require("fs");

module.exports = (CaminhoDoArquivo, DocumentoBase64) =>  {

    return new Promise((resolve, reject) => {

        fs.writeFile(CaminhoDoArquivo, DocumentoBase64, 'base64', error => {
            if (error) {
                throw error;
            } else {
                resolve(true);
            }
        });
    });

}