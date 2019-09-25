const fs = require('fs');
const Embed = require('./extensions/Embed');
const ReactionHandler = require('eris-reactions');
const EmbedPaginator = require('eris-pagination');
const ojsama = require("ojsama");

class kimiwaHelper {
    constructor() {
        this.Embed = Embed;
        this.PaginationEmbed = EmbedPaginator;
        this.ReactionHandler = ReactionHandler;
        this.ojsama = ojsama;
    }

    pngToBase64URI(path) {
        let bitmap = fs.readFileSync(path, {
            encoding: null
        });
        let URI = `data:image/png;base64,${bitmap.toString('base64')}`
        return URI;
    }

    getRandomColor() {
        return '#' + (Math.random() * 0xFFFFFF << 0).toString(16);
    }

    normalizeSecondsToDHMS(time) {
        let value = Number(time);
        let hours = Math.floor(value / 3600);
        let minutes = Math.floor(value % 3600 / 60);
        let seconds = Math.floor(value % 3600 % 60);

        let normalizeHours = (hours > 0) ? hours + (hours === 1 ? ' Hour, ' : ' Hours, ') : '';
        let normalizeMinutes = (minutes > 0) ? `${minutes}m, ` : '';
        let normalizeSeconds = (seconds > 0) ? `${seconds}s` : '';

        return normalizeHours + normalizeMinutes + normalizeSeconds;
    }

    osuGetMode(mode) {
        switch (mode) {
            case 'standard' || 'std' || 'clasic':
                return mode = 0
                break;
            case 'taiko':
                return mode = 1
                break;
            case 'catch' || 'ctb':
                return mode = 2
                break;
            case 'mania':
                return mode = 3
                break;
        }
    }

    numberToMod(givenNumber) {
        const number = parseInt(givenNumber);
        let modList = [];

        if (number & 1 << 0) modList.push('NF');
        if (number & 1 << 1) modList.push('EZ');
        if (number & 1 << 3) modList.push('HD');
        if (number & 1 << 4) modList.push('HR');
        if (number & 1 << 5) modList.push('SD');
        if (number & 1 << 9) modList.push('NC');
        if (number & 1 << 6) modList.push('DT');
        if (number & 1 << 7) modList.push('RX');
        if (number & 1 << 8) modList.push('HT');
        if (number & 1 << 10) modList.push('FL');
        if (number & 1 << 12) modList.push('SO');
        if (number & 1 << 14) modList.push('PF');

        if (modList.includes('NC')) {
            let dtIndex = modList.indexOf('DT');

            if (dtIndex > -1) {
                modList.splice(dtIndex, 1);
            }
        }

        return modList;
    }

    getOsuFileCache() {
        
    }

    query(database, userQuery) {
        return new Promise((resolve, reject) => {
            database.query(userQuery, (error, results, field) => {
                if (error) {
                    reject(error);

                }

                resolve(results);
            });
        });
    }

    preparedQuery(database, userQuery, value) {
        return new Promise((resolve, reject) => {
            database.query(userQuery, value, (error, results, field) => {
                if (error) {
                    reject(error);
                }

                resolve(results);
            });
        });
    }
}

module.exports = new kimiwaHelper();