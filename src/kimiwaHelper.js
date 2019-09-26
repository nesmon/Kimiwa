const fs = require('fs');
const Embed = require('./extensions/Embed');
const ReactionHandler = require('eris-reactions');
const EmbedPaginator = require('eris-pagination');
const ojsama = require("ojsama");
const fetch = require('node-fetch');

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

    
    numberToMod(modNumber) {
        const number = parseInt(modNumber);
        let mods = [];

        if (number & 1 << 0) mods.push('NF');
        if (number & 1 << 1) mods.push('EZ');
        if (number & 1 << 3) mods.push('HD');
        if (number & 1 << 4) mods.push('HR');
        if (number & 1 << 5) mods.push('SD');
        if (number & 1 << 9) mods.push('NC');
        if (number & 1 << 6) mods.push('DT');
        if (number & 1 << 7) mods.push('RX');
        if (number & 1 << 8) mods.push('HT');
        if (number & 1 << 10) mods.push('FL');
        if (number & 1 << 12) mods.push('SO');
        if (number & 1 << 14) mods.push('PF');

        if (mods.includes('NC')) {
            let dtToNC = mods.indexOf('DT');

            if (tdToNC > -1) {
                mods.splice(dtToNC, 1);
            }
        }

        return mods;
    }

    async getOsuBeatmapCache(id) {
        const file = `${__dirname}/../data/beatmap/${id}.osu`;

        if (fs.existsSync(file)) {
            const result = fs.readFileSync(file, 'utf8');
            return result;
        } else {
            const cache = await fetch(`https://osu.ppy.sh/osu/${id}`);
            const result = await cache.text();

            fs.writeFile(file, result, (err) => {
                if (err) {
                    console.log(`A error has been find when try to get osu file : \n${err}`);
                } else {
                    console.log('Successfully cached a new osu! Beatmap file!');
                }
            });
            return result;
        }
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