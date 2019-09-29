const Command = require("../../base/Command.js");
const kimiwaHelper = require('./../../kimiwaHelper');
const kitsu = require('node-kitsu');

class cache extends Command {
    constructor(client) {
        super(client, {
            name: "cache",
            description: "Cache some information like beatmap file or anime data",
            category: "System",
            usage: "cache [anime/beatmap] [array]",
            nsfw: false,
            permLevel: "Bot Support"
        });
    }

    async run(message, args, kimiwa) { // eslint-disable-line no-unused-vars
        let name = args.splice(1).join(' ');
        let cacheData = name.split(", ");

        if (args[0] === "beatmap") {

            for (let i = 0; i < cacheData.length; i++) {
                let getUserBestScore = await kimiwa.osu.user.getBest(cacheData[i], 0, 10);

                if (!getUserBestScore) {} else {
                    for (let j = 0; j < getUserBestScore.length; j++) {
                        await kimiwaHelper.getOsuBeatmapCache(getUserBestScore[j].beatmap_id);
                    }
                }
            }

            message.channel.createMessage("end");

        } else if (args[0] === 'anime') {

            for (let i = 0; i < cacheData.length; i++) {
                let animeSearch = await kitsu.searchAnime(cacheData[i].toLowerCase(), 0);

                if (!animeSearch) {} else{
                    for (let j = 0; j < animeSearch.length; j++) {
                        kimiwaHelper.addPoint(animeSearch[j].attributes.canonicalTitle, animeSearch[j].id, `https://kitsu.io/anime/${animeSearch[j].attributes.slug}`, kimiwa.db);
                        console.log(`Succes to cache : ${animeSearch[j].attributes.canonicalTitle}`);
                    }
                }
            }
        } else {
            message.channel.createMessage("Please select a categori to cache data");
        }
    }
}
module.exports = cache;