const kimiwaHelper = require('./../kimiwaHelper');

module.exports = class Ready {
    constructor(client) {
        this.kimiwa = client;
    }

    async run() {
        this.kimiwa.editStatus('online', {
            name: "Open beta | k!help"
        });

        // this.client.editSelf({
        //     avatar: kimiwaHelper.pngToBase64URI('./src/assets/img/logo_kimiwa.png')
        // })
    }
};