const formidable = require('formidable');
const fs = require('fs');

function zenps (req) {
    const form = new formidable.IncomingForm();
    form.parse(req, (err, fields, {file}) => {
        return fs.readFileSync(file.filepath).toString("base64");
    })
}

export default zenps