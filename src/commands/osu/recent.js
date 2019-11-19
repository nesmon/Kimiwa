const Command = require("../../base/Command.js");
const kimiwaHelper = require('../../kimiwaHelper');

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

        let beatmap = parseBeatmap.map;
        let beatmapStars = await new kimiwaHelper.ojsama.diff().calc({
            map: beatmap,
            mods: parseInt(getBeatmap[0].enabled_mods)
        });
        beatmapStars = beatmapStars.toString().split(" ", 1)[0];
        let beatmapUsedMods = (kimiwaHelper.getModByNumber(getBeatmap[0].enabled_mods).length > 0) ? "+" + kimiwaHelper.getModByNumber(getBeatmap[0].enabled_mods).join(',') : "Nomod";


        message.channel.createEmbed(new kimiwaHelper.Embed()
            .setColor(16016293)
            .setTitle(`${renderBeatmapName}]+${beatmapUsedMods}`)
            .setDescription("test")
        );
        console.log(getRecent);
        console.log(getBeatmap);


    };
}



module.exports = Recent;