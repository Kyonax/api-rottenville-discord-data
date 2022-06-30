const Api = require('../../tools/api_discord_functions');
const Exe = require('../../tools/functions');

async function array(props, index) {
    try {
        let member = props.rank_users[index].id, week_member_rank = 0, month_member_rank = 0, month_iterator = 0, week_iterator = 0;
        let guild = props.rank_users[index].guild;

        props.rank_users_month.forEach(member_month => {
            if (member === member_month.id) {
                month_member_rank = month_iterator + 1;
            }
            month_iterator++
        });

        props.rank_users_week.forEach(member_week => {
            if (member === member_week.id) {
                week_member_rank = week_iterator + 1;
            }
            week_iterator++
        });

        var date = Date.now();
        const today = new Date(date);

        let _objMember = {
            general: index + 1,
            updated: today.toUTCString(),
            special: {
                week: {
                    xp: Math.abs(props.ObjMembers_Week.data["894634118267146272"].members.all[member].status.xp - props.rank_users[index].xp),
                    level: props.ObjMembers_Week.data["894634118267146272"].members.all[member].status.level,
                    data: week_member_rank,
                    timeFrom: "29 Jun 2022 02:16:11 GMT",
                },
                month: {
                    xp: Math.abs(props.ObjMembers_Month.data["894634118267146272"].members.all[member].status.xp - props.rank_users[index].xp),
                    level: props.ObjMembers_Month.data["894634118267146272"].members.all[member].status.level,
                    data: month_member_rank,
                    timeFrom: "30 Jun 2022 20:16:11 GMT"
                }
            }
        }

        await Api.patchDataMember(member, guild, "rank", _objMember).then(() => {
            console.log(`MEMBER: ${member} RANK: ${_objMember.general} MONTH: ${month_member_rank} WEEK: ${week_member_rank} GUILD: ${guild} OF: ${props.rank_users.length}`);
        })
    } catch (error) {
        console.log(error)
    }
}

async function specials(rank_users, other_rank) {
    let _return_users = [];
    rank_users.forEach(_member_rank_user => {
        other_rank.forEach(_member_other_rank => {
            if (_member_other_rank.id === _member_rank_user.id) {
                _member_other_rank.xp = Math.abs(_member_rank_user.xp - _member_other_rank.xp);
                _return_users.push(_member_other_rank);
            }
        });
    });

    _return_users.sort(function (a, b) {
        if (a.xp < b.xp) {
            return 1;
        }

        if (a.xp > b.xp) {
            return -1;
        }

        return 0;
    })

    return _return_users
}

async function run() {
    let ObjMembers = await Api.getMembers('894634118267146272'), rank_users = [], rank_users_month = [], rank_users_week = [], index = 0;
    let ObjMembers_Month = await Exe.readJSON("./src/data/Members_Month.json"), _ObjMembers_Month = JSON.parse(ObjMembers_Month);
    let ObjMembers_Week = await Exe.readJSON("./src/data/Members_Week.json"), _ObjMembers_Week = JSON.parse(ObjMembers_Week);

    for (var i in _ObjMembers_Month.data["894634118267146272"].members.all) {
        rank_users_month.push({
            xp: _ObjMembers_Month.data["894634118267146272"].members.all[i].status.xp,
            id: _ObjMembers_Month.data["894634118267146272"].members.all[i].id,
            guild: _ObjMembers_Month.data["894634118267146272"].members.all[i].guild
        })
    }

    for (var i in _ObjMembers_Week.data["894634118267146272"].members.all) {
        rank_users_week.push({
            xp: _ObjMembers_Week.data["894634118267146272"].members.all[i].status.xp,
            id: _ObjMembers_Week.data["894634118267146272"].members.all[i].id,
            guild: _ObjMembers_Week.data["894634118267146272"].members.all[i].guild
        })
    }

    for (var i in ObjMembers.all) {
        rank_users.push({
            xp: ObjMembers.all[i].status.xp,
            id: ObjMembers.all[i].id,
            guild: ObjMembers.all[i].guild
        });
    }

    rank_users_month = await specials(rank_users, rank_users_month);
    rank_users_week = await specials(rank_users, rank_users_week);

    rank_users.sort(function (a, b) {
        if (a.xp < b.xp) {
            return 1;
        }

        if (a.xp > b.xp) {
            return -1;
        }

        return 0;
    });

    let _props = {
        ObjMembers: ObjMembers,
        ObjMembers_Month: _ObjMembers_Month,
        ObjMembers_Week: _ObjMembers_Week,
        rank_users: rank_users,
        rank_users_month: rank_users_month,
        rank_users_week: rank_users_week
    }

    let _props_method = await Exe.propsObject(_props, "ObjMembers.ObjMembers_Month.ObjMembers_Week.rank_users.rank_users_month.rank_users_week")
    await Exe.loopMethodEach(array, _props_method, 200, index, rank_users.length);


}


run()