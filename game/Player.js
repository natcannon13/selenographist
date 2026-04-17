class Player{
    constructor(member){
        this.id = member.id;
        this.member = member;
        this.role = null;
        this.hasVoted = false;
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
}
module.exports = Player;