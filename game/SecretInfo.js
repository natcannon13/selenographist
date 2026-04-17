const Player = require("../game/Player.js");
class SecretInfo{
    constructor(word){
        this.word = word;
        this.werewolves = [];
        this.apprentice = false;
        this.masons = [];
        this.beholder = [];
    }

    setInfo(players){
        for (const player of players.values()){
            if (player.role === "Apprentice"){
                this.beholder.push(player.member.displayName);
            }
            if (player.role === "Seer"){
                if(player.isMayor){
                    this.apprentice = true;
                }
                this.beholder.push(player.member.displayName);
            }
            if (player.role === "Mason"){
                this.masons.push(player.member.displayName);
            }
            if(player.role === "Werewolf"){
                this.werewolves.push(player.member.displayName);
            }
        }
    }
}
module.exports = SecretInfo;