const formidable = require('formidable');
const fs = require('fs');

module.exports = function ConverterPDFParaArrayBuffer (req) {
    const form = new formidable.IncomingForm();
    return new Promise(function (resolve, reject) {
        form.parse(req, (err, fields, {file}) => {
            resolve({
                ArrayBuffer: fs.readFileSync(file.filepath), 
                Base64ChavePrivada: fields.Base64ChavePrivada
            })
        })
    })
}