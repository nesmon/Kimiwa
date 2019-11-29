const kimiwaHelper = require('./../kimiwaHelper');
const ojsama = require('ojsama');

class OsuHelper {
    async getRangePP(osuUser, kimiwa, mode) {
        let getBest = await kimiwa.osu.user.getBest(osuUser.user_id, kimiwaHelper.osuGetMode(mode), 100, 'id');
        for (let i = 0; i < getBest.length; i++) {
            console.log(getBest[i].beatmap_id);
        }
        return 'end'
    }

}


module.exports = OsuHelper;