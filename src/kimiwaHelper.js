const fs = require('fs');
const Embed = require('./extensions/Embed');


class kimiwaHelper {
    constructor() {
        this.Embed = Embed;
    }

    pngToBase64URI (path) {
        let bitmap = fs.readFileSync(path, {encoding: null});
        let URI = `data:image/png;base64,${bitmap.toString('base64')}`
        return URI;
    }
}

module.exports = new kimiwaHelper();