class Player{
    constructor(member){
        this.id = member.id;
        this.member = member;
        this.role = null;
        this.hasVoted = false;
        this.isMayor = false;
    }
}
module.exports = Player;