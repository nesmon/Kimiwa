const kimiwaHelp = require('./../kimiwaHelper');

module.exports = class Ready {
    constructor(client) {
        this.kimiwa = client;
    }

    async run() {
        this.kimiwa.editStatus('online', {
            name: "First beta : type k!help"
        });

        // this.client.editSelf({
        //     avatar: kimiwaHelp.pngToBase64URI('./src/assets/img/logo_kimiwa.png')
        // })
    }
};