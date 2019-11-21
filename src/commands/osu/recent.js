const Command = require("../../base/Command.js");
const kimiwaHelper = require('../../kimiwaHelper');
const ojsama = require('ojsama');

class Recent extends Command {
    constructor(client) {
        super(client, {
            name: "recent",
            category: "Osu",
            description: "Get osu information about last play of player",
            usage: "rs --name [name of user] --mode [standard/mania/taiko/catch optional, by default std is select]",
            aliases: ["rs"]
        });
    }

    async run(message, args, kimiwa, level, IA) { // eslint-disable-line no-unused-vars
        let name;
        let mode;

        if (IA === true) {
            name = args[0];
            mode = args[1] || 'standard';
        } else {
            name = kimiwaHelper.flags(message.content, "--name");
            mode = kimiwaHelper.flags(message.content, "--mode");
        }

        if (name === false) {
            name = args.splice(0).join(' ');
            if (name === '') {
                const osuName = await kimiwaHelper.preparedQuery(kimiwa.db, 'SELECT * FROM profile WHERE user_ID = ?', message.author.id);
                name = osuName[0].osu_username;
                if (name === '' || name === null) {
                    return message.channel.createEmbed(new kimiwaHelper.Embed().setColor('RED').setAuthor("ERROR", message.author.avatarURL).setDescription(`Thanks to asigne name to your command with --name [name of command] or just put your name if you search in std`));
                }
            }
        }

        if (mode === false) mode = 'std';

        let getRecent = await kimiwaHelper.osuAPI(kimiwa, 'getRecent', name, mode, 1);
        let getBeatmap = await kimiwaHelper.osuAPI(kimiwa, 'getBeatpmapId', getRecent[0].beatmap_id);
        let renderBeatmapName = getBeatmap[0].artist + "-" + getBeatmap[0].title + "[" + getBeatmap[0].version + "]";

        let getMap = await kimiwaHelper.getOsuBeatmapCache(getBeatmap[0].beatmap_id);
        let parseBeatmap = new kimiwaHelper.ojsama.parser();
        parseBeatmap.feed(getMap);

        // Star part
        let beatmap = parseBeatmap.map;
        let beatmapStars = new kimiwaHelper.ojsama.diff().calc({
            map: beatmap,
            mods: parseInt(getRecent[0].enabled_mods)
        });

        let beatmapUsedMods = (kimiwaHelper.getModByNumber(getRecent[0].enabled_mods).length > 0) ? "+" + kimiwaHelper.getModByNumber(getRecent[0].enabled_mods).join(',') : "Nomod";

        // PP part
        let recentMisses    = parseInt(getRecent[0].countmiss);
        let recentAccuracy  = kimiwaHelper.osuGetAcu(getRecent[0].count300, getRecent[0].count100, getRecent[0].count50, getRecent[0].countmiss);

        let recentAccuracyForFC = parseFloat((((
            (parseInt(getRecent[0].count300) * 300)  +
            ((parseInt(getRecent[0].count100) + parseInt(getRecent[0].countmiss)) * 100) +
            (parseInt(getRecent[0].count50) * 50)    +
            (parseInt(0) * 0)) /
            ((
                parseInt(getRecent[0].count300)      +
                parseInt(getRecent[0].count100)      +
                parseInt(getRecent[0].count50)       +
                parseInt(getRecent[0].countmiss)
            ) * 300)) * 100));

        let recentMaxCombo  = parseInt(getRecent[0].maxcombo);

        let beatmapPP           = ojsama.ppv2({ stars: beatmapStars, combo: recentMaxCombo, nmiss: recentMisses, acc_percent: recentAccuracy });
        let beatmapACCPP        = ojsama.ppv2({ stars: beatmapStars, combo: parseInt(beatmap.max_combo()), nmiss: 0, acc_percent: recentAccuracyForFC });
        let potentialPP         = beatmapACCPP.toString().split(" ", 1)[0];
        let formattedPPmin      = beatmapPP.toString().split(" ", 1)[0];


        // Time part
        let completion = kimiwaHelper.osuCompletion(getMap, parseInt(getRecent[0].count300) + parseInt(getRecent[0].count100) + parseInt(getRecent[0].count50) + parseInt(getRecent[0].countmiss));

        let TimeRecentSecond = completion * getBeatmap[0].total_length / 100;
        TimeRecentSecond = parseInt(TimeRecentSecond);


        message.channel.createEmbed(new kimiwaHelper.Embed()
            .setColor(16016293)
            .setTitle(`${renderBeatmapName}${beatmapUsedMods}`)
            .setThumbnail(`https://b.ppy.sh/thumb/${getBeatmap[0].beatmapset_id}l.jpg?uts=${Math.floor(new Date() / 1000)}`)
            .addField('Play score :',
                `${beatmapStars.toString().split(" ", 1)[0]}★ ▸${getRecent[0].rank} ▸${getRecent[0].score}\n` +
                `**Total hits : ** ▸[${getRecent[0].count300 + "/" + getRecent[0].count100 + "/" + getRecent[0].count50 + "/" + getRecent[0].countmiss}]\n` +
                `**Accuracy : ** ▸ ${recentAccuracy.toFixed(2)}%\n`,
                true
            )
            .addField('\u200B',
                `**Completion :** ${completion.toFixed(2)}%\n**Length :** ${kimiwaHelper.normalizeSecToMin(TimeRecentSecond)}/${kimiwaHelper.normalizeSecToMin(getBeatmap[0].total_length)}`,
                true
            )
            .addField('\u200B',
                `**x${getRecent[0].maxcombo}**/${beatmap.max_combo()}\n` +
                `${formattedPPmin}pp[${potentialPP}pp if FC with ${recentAccuracyForFC.toFixed(2)}%]`,)
        );
    }
}



module.exports = Recent;