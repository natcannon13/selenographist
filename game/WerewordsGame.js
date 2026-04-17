const config_util = require("../utils/config_util.js");
const roles_util = require("../utils/roles_util.js");
const dm_util = require("../utils/dm_util.js");
const word_util = require("../utils/word_util.js");
const Player = require("../game/Player.js");
const SecretInfo = require("../game/SecretInfo.js");
const VoiceManager = require("../utils/VoiceManager.js");
const { time } = require("discord.js");
const { EmbedBuilder } = require('discord.js');
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
        this.voice = new VoiceManager(this.guild.channels.cache.get(this.voiceChannel));
        this.timer = null;
        this.timeLeft = 0;
        this.status = null;
        this.updateInterval = null;
    }

    async changePhase(){
        switch(this.phase){
            case "setup":
                this.phase = "wordChoice";
                await this.chooseWord();
                break;
            case "wordChoice":
                this.phase = "questions";
                await this.dayPhase();
                break;
            case "questions":
                this.updateInterval = null;
                this.clearTimer();
                if(this.villageWin){
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
            await this.voice.join();
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
        this.word = await word_util.getWords(this.difficulty, this.players.get(this.mayor).role);
        let msg = "";
        for(let i = 0; i < this.word.length; i++){
            msg += `${i+1}. ${this.word[i]}`;
            if (i < this.word.length - 1){
                msg += "\n";
            }
        }
        await mayorChannel.send(msg);
    }

    async wordChosen(index){
        this.word = this.word[index];
        let info = new SecretInfo(this.word);
        info.setInfo(this.players);
        for(const player of this.players.values()){
            dm_util.sendInfo(player, info);
        }
        this.changePhase();
    }

    async dayPhase(){
        switch (this.difficulty){
            case "ridiculous":
                this.timeLeft = 360;
                break;
            case "hard":
                this.timeLeft = 300;
                break;
            case "medium":
                this.timeLeft = 240;
                break;
            case "easy":
                this.timeLeft = 180;
                break;
        } 
        let time = (this.timeLeft - 60)* 1000;
        this.startTimer(time, this.timeWarning);
        const embed = this.buildStatusEmbed();
        const channel = this.guild.channels.cache.get(this.gameChannel);
        this.status = await channel.send({embeds: [embed]});
        this.updateEmbed();
    }

    startTimer(duration, onEnd){
        this.clearTimer();
        this.timer = setTimeout(() => {
            this.currentTimer = null;
            onEnd();
        }, duration);
    }

    clearTimer() {
        if (this.currentTimer) {
            clearTimeout(this.currentTimer);
            this.currentTimer = null;
        }
    }

    timeWarning(){
        //announce 1 minute remaining
        this.startTimer(60000, this.changePhase);
    }

    buildStatusEmbed(){
        let minutes = Math.floor(this.timeLeft / 60);
        let seconds = this.timeLeft % 60;
        if(seconds < 10){
            seconds = `0${seconds}`;
        }
        return new EmbedBuilder()
        .setTitle("Werewords")
        .addFields(
            {name: "Time Remaining", value: `${Math.floor(minutes)}:${seconds}`, inline: true},
            {name: "Yes/No Tokens Left", value: `${this.tokens.yesNo}`, inline: true}
        );
    }

    updateEmbed(){
        this.updateInterval = setInterval(async () => {
                if(!this.status) return;
                try{
                    await this.status.edit({
                        embeds: [this.buildStatusEmbed()]
                    });
                } catch(err){
                    console.error("Embed failure", err);
                }
                this.timeLeft -= 1;
            }, 1000
        );
    }

}
module.exports = WerewordsGame;