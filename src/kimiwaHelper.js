const Embed = require('./extensions/Embed');
const KCategory = require('./constants/Category')
const kFlags = require('./kimiwaFlags');
const ReactionHandler = require('eris-reactions');
const EmbedPaginator = require('eris-pagination');
const fs = require('fs');
const ojsama = require("ojsama");
const fetch = require('node-fetch');

class kimiwaHelper {
    constructor() {
        this.Embed = Embed;
        this.kFlag = kFlags;
        this.KCategory = KCategory;
        this.PaginationEmbed = EmbedPaginator;
        this.ReactionHandler = ReactionHandler;
        this.ojsama = ojsama;
    }

    flags(value, key, limiter = "--") {
        let str = value;

        if (str.indexOf(key) === -1) return false;

        str = str.split(key + ' ')[1];
        if (str === void 0) return false;

        str = str.split(limiter)[0];

        if (str.trimEnd() === '') return false;

        return str.trimEnd();
    }

    removeUselessSpace (str) {
        str = str.replace(/[\s]{2,}/g, " ");
        return str.trim();
    }

    cleanArray(array) {
        var i, j, len = array.length,
            out = [],
            obj = {};
        for (i = 0; i < len; i++) {
            obj[array[i]] = 0;
        }
        for (j in obj) {
            out.push(j);
        }
        return out;
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

    async addPoint(title, id, url, coreDB) {
        try {
            let find;

            const getQuery = await this.preparedQuery(coreDB, `SELECT * FROM anime WHERE title = ?`, [title]);

            if (getQuery.length > 0) {
                find = {
                    'aid': getQuery[0].aid,
                    'title': getQuery[0].title,
                    'url': getQuery[0].url,
                    'search_time': getQuery[0].search_time
                };
                find.search_time++;

                this.preparedQuery(coreDB, `UPDATE anime SET ? WHERE aid = ${find.aid}`, find)
            } else {
                find = {
                    'aid': id,
                    'title': title,
                    'url': url,
                    'search_time': 1
                };

                this.preparedQuery(coreDB, 'INSERT INTO anime SET ?', find);
            };
        } catch (error) {
            console.log(error)
        };
    }

    normalizeSecondsToHMS(time) {
        let value = Number(time);
        let hours = Math.floor(value / 3600);
        let minutes = Math.floor(value % 3600 / 60);
        let seconds = Math.floor(value % 3600 % 60);

        let normalizeHours = (hours > 0) ? hours + (hours === 1 ? ' Hour, ' : ' Hours, ') : '';
        let normalizeMinutes = (minutes > 0) ? `${minutes}m, ` : '';
        let normalizeSeconds = (seconds > 0) ? `${seconds}s` : '';

        return normalizeHours + normalizeMinutes + normalizeSeconds;
    }

    osuGetModeNumberByName(mode) {
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

    osuGetModeNameByNumber(mode) {
        switch (mode) {
            case 0:
                return "standard"
                break;
            case 1:
                return "taiko"
                break;
            case 2:
                return "ctb"
                break;
            case 3:
                return "mania"
                break;
        }
    }

    osuGetAcu(h300, h100, h50, hm) {
        let parse = parseFloat((((
                (parseInt(h300) * 300) +
                (parseInt(h100) * 100) +
                (parseInt(h50) * 50) +
                (parseInt(hm) * 0)) /
            ((
                parseInt(h300) +
                parseInt(h100) +
                parseInt(h50) +
                parseInt(hm)
            ) * 300)) * 100));

        return parse.toFixed(2)
    }

    secToMin(s) {
        return (s - (s %= 60)) / 60 + (9 < s ? ':' : ':0') + s;
    }

    getModByNumber(modNumber) {
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

            if (dtToNC > -1) {
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