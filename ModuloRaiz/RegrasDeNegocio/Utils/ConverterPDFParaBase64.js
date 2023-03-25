const formidable = require('formidable');
const fs = require('fs');

module.exports = async function ConverterPDFParaBase64 (req) {
    const form = new formidable.IncomingForm();
    return new Promise((resolve, reject) => {
        form.parse(req, (err, fields, {file}) => {
            resolve(fs.readFileSync(file.filepath).toString("base64"));
        })
    })
}