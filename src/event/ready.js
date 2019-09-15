const kimiwaHelp = require('./../kimiwaHelper');

module.exports = class Ready {
    constructor(client) {
        this.client = client;
    }

    async run() {
        this.client.editStatus('online', {
            name: "Hello"
        });
        this.client.editSelf({
            avatar: kimiwaHelp.toBase64URI('./src/assets/img/logo_kimiwa.png')
        })
    }
};