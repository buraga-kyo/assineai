const formidable = require('formidable');
const fs = require('fs');

module.exports = function ConverterPDFParaArrayBuffer (req) {
    const form = new formidable.IncomingForm();
    return new Promise(function (resolve, reject) {
        form.parse(req, (err, fields, data) => {
            console.log(data)
        })
    })
}