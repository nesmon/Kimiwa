const fs = require('fs');



class kimiwaHelper {
    constructor() {

    }

    toBase64URI (path) {
        let bitmap = fs.readFileSync(path, {encoding: null});
        let URI = `data:image/png;base64,${bitmap.toString('base64')}`
        return URI;
    }
}

module.exports = new kimiwaHelper();