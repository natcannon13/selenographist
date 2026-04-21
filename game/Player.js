const emoji_util = require("../utils/emoji_util");
class Player{
    constructor(member){
        this.id = member.id;
        this.member = member;
        this.role = null;
        this.vote = null;
        this.isMayor = false;
        this.tokens = {
            yes: 0,
            no: 0,
            maybe: 0,
            wayWayOff: 0,
            soClose: 0,
            correct: 0
        };
    }
    tokenStatsMessage(){
        let msg = "";
        for(let i = 0; i < this.tokens.yes; i++){
            msg += emoji_util.yes;
        }
        for(let i = 0; i < this.tokens.no; i++){
            msg += emoji_util.no;
        }
        for(let i = 0; i < this.tokens.maybe; i++){
            msg += emoji_util.maybe;
        }
        for(let i = 0; i < this.tokens.wayWayOff; i++){
            msg += emoji_util.wayWayOff;
        }
        for(let i = 0; i < this.tokens.soClose; i++){
            msg += emoji_util.soClose;
        }
        return msg;
    }
}
module.exports = Player;