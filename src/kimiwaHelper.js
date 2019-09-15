const fs = require('fs');



class kimiwaHelper {
    constructor() {

    }

    toBase64 (path) {
        let bitmap = fs.readFileSync(path, {encoding: null});
        return bitmap.toString('base64');
    }
}

module.exports = new kimiwaHelper();