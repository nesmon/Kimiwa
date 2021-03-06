const Embed = require('./extensions/Embed');
const ReactionHandler = require('eris-reactions');
const EmbedPaginator = require('eris-pagination');
const fs = require('fs');
const ojsama = require("ojsama");
const fetch = require('node-fetch');

class kimiwaHelper {
    constructor() {
        this.Embed = Embed;
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
        let i, j, len = array.length,
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
        return `data:image/png;base64,${bitmap.toString('base64')}`;
    }

    async flashMessage(message, title = null, description = null, color = 'RANDOM',time) {
        const e = new this.Embed();
        e.setColor(color);
        e.setTimestamp();
        e.setFooter('\u200B');

        if (title !== null) e.setTitle(title);
        if (description !== null) e.setDescription(description)

        const flash = await message.channel.createEmbed(e)

        setTimeout(() => {
            flash.delete();
        }, time)
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

                this.preparedQuery(coreDB, `UPDATE anime SET ? WHERE aid = ${find.aid}`, find);
            } else {
                find = {
                    'aid': id,
                    'title': title,
                    'url': url,
                    'search_time': 1
                };

                this.preparedQuery(coreDB, 'INSERT INTO anime SET ?', find);
            }
        } catch (error) {
            console.log(error);
        }
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

    normalizeSecToMin(s) {
        return (s - (s %= 60)) / 60 + (9 < s ? ':' : ':0') + s;
    }

    osuCompletion(beatmapdata, hitsGlobal) {
        let beatmap = new ojsama.parser();
        beatmap.feed(beatmapdata);
        let parsebeatmap = beatmap.map;

        let beatmapHitObjects = [];
        let parseHit = (!hitsGlobal) ? parseInt(parsebeatmap.objects.length) : parseInt(hitsGlobal);

        let globalCount = parseInt(parsebeatmap.objects.length);

        parsebeatmap.objects.forEach(singleObject => beatmapHitObjects.push(parseInt(singleObject.time)));
        const timing = parseInt(beatmapHitObjects[globalCount - 1]) - parseInt(beatmapHitObjects[0]);
        const point = parseInt(beatmapHitObjects[parseHit - 1]) - parseInt(beatmapHitObjects[0]);

        return (point / timing) * 100;
    }

    osuGetModeNumberByName(mode) {
        switch (mode) {
            case 'standard' || 'std' || 'clasic':
                return mode = 0;
            case 'taiko':
                return mode = 1;
            case 'catch' || 'ctb':
                return mode = 2;
            case 'mania':
                return mode = 3;
        }
    }

    osuGetModeNameByNumber(mode) {
        switch (mode) {
            case 0:
                return "standard";
            case 1:
                return "taiko";
            case 2:
                return "ctb";
            case 3:
                return "mania";
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

        return parse;
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
            return fs.readFileSync(file, 'utf8');
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

    async osuAPI (kimiwaCore, type, id, mode = null, limit = 5, lookup = undefined) {
        mode = this.osuGetModeNumberByName(mode);
        switch (type) {
            case 'getUser' :
                break;
            case 'getBest':
                // Probably use HTTP (native module of node.js
                break;
            case 'getBeatpmapId':
                return kimiwaCore.osu.beatmaps.getByBeatmapId(id);
            case 'getRecent':
                return kimiwaCore.osu.user.getRecent(id, mode, limit, lookup);
            default :
                return console.log('Thanks to give good option.');
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