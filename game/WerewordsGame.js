const config_util = require("../utils/config_util.js");
const roles_util = require("../utils/roles_util.js");
const dm_util = require("../utils/dm_util.js");
const word_util = require("../utils/word_util.js");
const Player = require("../game/Player.js");
class WerewordsGame{
    constructor(guildID, difficulty, mayor, client){
        this.players = new Map();
        this.config = {};
        this.tokens = {
            yesNo: 36,
            maybe: 12,
            soClose: 1,
            wayWayOff: 1,
            correct: 1
        };
        this.difficulty = difficulty;
        this.word = null;
        this.mayor = mayor;
        this.phase = "setup";
        this.villageWin = false;
        this.gameChannel = config_util.config[guildID].gameChannel;
        this.mayorChannel = config_util.config[guildID].mayorChannel;
        this.voiceChannel = config_util.config[guildID].voiceChannel;
        this.mayorRole = config_util.config[guildID].mayorRole;
        this.client = client;
        this.guild = this.client.guilds.cache.get(guildID);
    }

    async changePhase(){
        switch(this.phase){
            case "setup":
                this.phase = "wordChoice";
                await this.chooseWord();
                break;
            case "wordChoice":
                this.phase = "questions";
                break;
            case "questions":
                if(villageWin){
                    this.phase = "seerKill";
                }
                else{
                    this.phase = "werewolfVote";
                }
                break;
            case "seerKill":
                this.phase = "end";
                break;
            case "werewolfVote":
                this.phase = "end";
        }
    }

    async start(){
        if(this.phase === "setup"){
            this.getPlayers();
            if(this.mayor == null){
                this.mayor = (this.players[Math.floor(Math.random() * this.players.length)]).id;
            }
            this.players.get(this.mayor).isMayor = true;
            await this.assignRoles();
            this.changePhase();
        }
    }

    getPlayers(){
        if (this.phase != "setup") return;
        const channel = this.guild.channels.cache.get(this.voiceChannel);

        if (!channel) {
            console.log("Voice channel not found!");
        return;
        }
        channel.members.forEach(member=>{
                if (member.user.bot) return;
                const player = new Player(member);
                this.players.set(player.id, player);
            });
    }

    async assignRoles(){
        const roleList = roles_util.getRoleList(this.players.length);
        let i = 0;
        for(const player of this.players.values()){
            player.role = roleList[i];
            i++;
        }
        //assign Mayor
        let role = this.guild.roles.cache.get(this.mayorRole);
        role.members.forEach(m => m.roles.remove(role));
        for (const player of this.players.values()){
            if (player.isMayor){
                await player.member.roles.add(role);
            }
            await dm_util.sendRole(player);
        }
    }

    async chooseWord(){
        const mayorChannel = this.guild.channels.cache.get(this.mayorChannel);
        await mayorChannel.send(`<@&${this.mayorRole}>\n Choose from these words using !word <n> where n is the number of your word.`);
        const words = await word_util.getWords(this.difficulty, this.players.get(this.mayor).role);
        let msg = "";
        for(let i = 0; i < words.length; i++){
            msg += `${i+1}. ${words[i]}`;
            if (i < words.length - 1){
                msg += "\n";
            }
        }
        await mayorChannel.send(msg);
    }
}
module.exports = WerewordsGame;