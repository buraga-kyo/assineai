const crypto = require("crypto");
const fs = require("fs");

module.exports = async (CaminhoDoArquivo) =>  {
    return new Promise((resolve, reject) => {
        var fd = fs.createReadStream(CaminhoDoArquivo);
        var hash = crypto.createHash('sha256');
        hash.setEncoding('hex');
        fd.pipe(hash);
        fd.on('end', function() {
            hash.end();
            resolve(hash.read())
        });
    })
}