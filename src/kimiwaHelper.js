const fs = require('fs');
const Embed = require('./extensions/Embed');
const ReactionHandler = require('eris-reactions');
const EmbedPaginator = require('eris-pagination');

class kimiwaHelper {
    constructor() {
        this.Embed = Embed;
        this.PaginationEmbed = EmbedPaginator;
        this.ReactionHandler = ReactionHandler;
    }

    pngToBase64URI (path) {
        let bitmap = fs.readFileSync(path, {encoding: null});
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