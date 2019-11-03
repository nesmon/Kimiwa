const kimiwaHelper = require('./../kimiwaHelper');

class kimiawUser {
    constructor (kimiwa) {
        this.kimiwa = kimiwa;
    }

    async verifyUser (message) {
        const getUser = await kimiwaHelper.preparedQuery(this.kimiwa.db, 'SELECT * FROM user WHERE user_ID = ?', [message.author.id]);

        if (getUser.length > 0) {
            let isBan = this.isBan(getUser[0].ban);
            if (isBan === true) return false;
        } else {
            let user = {
                user_ID: message.author.id,
                reputation: 10,
                messagesend: 1
            };

            await kimiwaHelper.preparedQuery(this.kimiwa.db, 'INSERT INTO user SET ?', user);
        }
    }

    async addMessage (message) {
        if (this.verifyUser(message) !== false) {
            const getUser = await kimiwaHelper.preparedQuery(this.kimiwa.db, 'SELECT * FROM user WHERE user_ID = ?', [message.author.id]);

            let update = {
                messagesend: getUser[0].messagesend + 1
            };

            await kimiwaHelper.preparedQuery(this.kimiwa.db, `UPDATE user SET ? WHERE user_ID = ${message.author.id}`, update);
        }
    }

    isBan (user_ban) {
        if (user_ban === 1) {
            return true;
        } else {
            return false;
        }
    }

}


module.exports = kimiawUser;