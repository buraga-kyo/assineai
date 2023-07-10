const crypto = require("crypto");
const fs = require("fs");

module.exports = async (DocumentoBase64) =>  {
    const base64SemHeader = DocumentoBase64.split(';base64,').pop();

    fs.write('documento.pdf', base64SemHeader, {encoding: 'base64'}, (err) => {
        if (err) {
            console.log(err)
        }
    })
    
}