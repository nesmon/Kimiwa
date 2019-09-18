const fs = require('fs');
const Embed = require('./extensions/Embed');
const builder = require('./extensions/PaginationEmbed');


class kimiwaHelper {
    constructor() {
        this.Embed = Embed;
        this.PaginationEmbed = builder;
    }

    pngToBase64URI (path) {
        let bitmap = fs.readFileSync(path, {encoding: null});
        let URI = `data:image/png;base64,${bitmap.toString('base64')}`
        return URI;
    }
}

module.exports = new kimiwaHelper();