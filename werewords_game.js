class WerewordsGame{
    constructor(guildID, difficulty, mayor){
        this.guildID = guildID;
        this.players = [];
        this.roles = new Map();
        this.config = {};
        this.tokens = {
            yesNo: 36,
            maybe: 12,
            soClose: 1,
            wayWayOff: 1,
            correct: 1
        };
        this.word = null;
        this.mayor = null;
        this.phase = "setup";
    }

    changePhase(villageWin){
        switch(phase){
            case "setup":
                phase = "wordChoice";
                break;
            case "wordChoice":
                phase = "questions";
                break;
            case "questions":
                if(villageWin){
                    phase = "seerKill";
                }
                else{
                    phase = "werewolfVote";
                }
                break;
            case "seerKill":
                phase = "end";
                break;
            case "werewolfVote":
                phase = "end";
        }
    }
}