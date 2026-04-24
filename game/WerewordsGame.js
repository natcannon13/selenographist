const config_util = require("../utils/config_util.js");
const roles_util = require("../utils/roles_util.js");
const dm_util = require("../utils/dm_util.js");
const word_util = require("../utils/word_util.js");
const emoji_util = require("../utils/emoji_util.js");
const Player = require("../game/Player.js");
const SecretInfo = require("../game/SecretInfo.js");
const VoiceManager = require("../utils/VoiceManager.js");
const { time } = require("discord.js");
const { EmbedBuilder } = require('discord.js');
const GameManager = require("./GameManager.js");
class WerewordsGame{
    constructor(guildID, difficulty, mayor, client, onEnd){
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
        this.endTime = null;
        this.status = null;
        this.mayorStatus = null;
        this.updateInterval = null;
        this.vote = [];
        this.werewolfSpokesman = null;
        this.onEnd = onEnd;
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
                    await this.identifySeer();
                }
                else{
                    this.phase = "werewolfVote";
                    await this.voteForWerewolf();
                }
                break;
            case "seerKill":
                this.clearTimer();
                this.phase = "end";
                this.endgame();
                break;
            case "werewolfVote":
                this.clearTimer();
                this.phase = "end";
                this.endgame();
                break;
            case "end":
                break;
        }
    }

    async start(){
        if(this.phase === "setup"){
            await this.voice.join();
            this.getPlayers();
            if(this.mayor == null){
                this.mayor = (this.players[Math.floor(Math.random() * this.players.length)]).id;
            }
            this.players.get(this.mayor).isMayor = true;
            await this.assignRoles();
            await this.voice.playAndWait("intro");
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
        for (const m of role.members.values()) {
            await m.roles.remove(role);
        }
        for (const player of this.players.values()){
            if (player.isMayor){
                try{
                    await player.member.roles.add(role);
                }
                catch{
                    const channel = this.guild.channels.cache.get(this.gameChannel);
                    channel.send("Failure! Make sure Selenographist is above Mayor in the role hierarchy!");
                }
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
        await this.voice.playAndWait("mayorchoose");
    }

    async wordChosen(index){
        this.word = this.word[index];
        let info = new SecretInfo(this.word);
        info.setInfo(this.players);
        for(const player of this.players.values()){
            dm_util.sendInfo(player, info);
        }
        await this.voice.playAndWait("hiddeninfo");
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
        await this.voice.playAndWait(this.difficulty);
        let time = (this.timeLeft) * 1000;
        this.startTimer(time, this.changePhase);
        const embed = this.buildStatusEmbed();
        const channel = this.guild.channels.cache.get(this.gameChannel);
        const mayorChannel = this.guild.channels.cache.get(this.mayorChannel);
        this.status = await channel.send({embeds: [embed]});
        this.mayorStatus = await mayorChannel.send({embeds: [embed]});
        this.updateEmbed();
    }

    startTimer(duration, onEnd){
    this.endTime = Date.now() + duration;
    this.timeLeft = Math.max(0, Math.floor((this.endTime - Date.now()) / 1000));
    this.clearTimer();
    this.timer = setTimeout(() => {
        this.timer = null;
        onEnd.call(this);
    }, duration);
}

    clearTimer() {
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }
    }

    buildStatusEmbed(){
        let minutes = Math.floor(this.timeLeft / 60);
        let seconds = this.timeLeft % 60;
        if(seconds < 10){
            seconds = `0${seconds}`;
        }
        let tokenCounts = [];
        for(const player of this.players.values()){
            if(!player.isMayor){
                tokenCounts.push({name: `**${player.member.displayName}**`, value: `${player.tokenStatsMessage()}`});
            }
        }
        return new EmbedBuilder()
        .setTitle("Werewords")
        .addFields(
            {name: "Time Remaining", value: `${Math.floor(minutes)}:${seconds}`, inline: true},
            {name: "Yes/No Tokens Left", value: `${this.tokens.yesNo}`, inline: true}
        )
        .addFields(tokenCounts);
    }

    buildVoteEmbed(){
        let seconds = this.timeLeft % 60;
        if (seconds < 10){
            seconds = `0${seconds}`;
        }
        let tokenCounts = [];
        let numVotes = 0;
        for(const player of this.players.values()){
            if(!player.isMayor){
                tokenCounts.push({name: `**${player.member.displayName}**`, value: `${player.tokenStatsMessage()}`});
            }
            if(player.vote){
                numVotes++;
            }
        }
        return new EmbedBuilder()
        .setTitle("Werewords Voting")
        .addFields(
            {name: "Time Remaining", value: `0:${seconds}`, inline: true},
            {name: "Votes Received", value: `${numVotes}`, inline: true},
            {name: "Magic Word", value: `${this.word}`, inline: true}
        )
        .addFields(tokenCounts);
    }

    buildResultsEmbed(){
        let voteCounts = [];
        for(const player of this.players.values()){
        }
        return new EmbedBuilder()
        .setTitle("Werewords Results")
        .addFields(
            {name: "Magic Word", value: `${this.word}`, inline: true}
        )
        .addFields(voteCounts);
    }

    async updateEmbed(){
        this.updateInterval = setInterval(async () => {
                if(!this.status) return;
                this.timeLeft = Math.max(
                    0,
                    Math.floor((this.endTime - Date.now()) / 1000)
                );
                try{
                    if(this.phase === "questions"){
                        if(this.timeLeft == 60){
                            this.voice.play("oneminuteremaining");
                        }
                        await this.status.edit({
                            embeds: [this.buildStatusEmbed()]
                        });
                        await this.mayorStatus.edit({
                            embeds: [this.buildStatusEmbed()]
                        })
                    }
                    if(this.phase === "werewolfVote" || this.phase === "seerKill"){
                        await this.status.edit({
                            embeds: [this.buildVoteEmbed()]
                        });
                    }
                } catch(err){
                    console.error("Embed failure", err);
                }
            }, 5000
        );
    }

    async giveToken(token, user){
        let player = this.players.get(user);
        let msg = `<@${user}>, The Mayor answered your question: **`;
        switch(token){
            case 'y':
                msg += ("YES** " + emoji_util.yes);
                this.tokens.yesNo--;
                player.tokens.yes++;
                this.checkTokens();
                break;
            case 'n':
                msg += ("NO** " + emoji_util.no);
                this.tokens.yesNo--;
                player.tokens.no++;
                this.checkTokens();
                break;
            case 'm':
                msg += ("MAYBE** " + emoji_util.maybe);
                this.tokens.maybe--;
                player.tokens.maybe++;
                break;
            case 's':
                msg += ("SO CLOSE!** " + emoji_util.soClose);
                this.tokens.soClose--;
                player.tokens.soClose++;
                break;
            case 'w':
                msg += ("WAY WAY OFF!** " + emoji_util.wayWayOff);
                this.tokens.wayWayOff--;
                player.tokens.wayWayOff++;
        }
        const channel = this.guild.channels.cache.get(this.gameChannel);
        await channel.send(msg);
        /*await this.status.edit({
            embeds: [this.buildStatusEmbed()]
        });*/
    }

    async wordGuessed(user){
        //You discovered the magic word audio
        await this.voice.playAndWait("foundword");
        const channel = this.guild.channels.cache.get(this.gameChannel);
        await channel.send(`<@${user}> discovered the Magic Word!`);
        this.villageWin = true;
        this.changePhase();
    }

    async checkTokens(){
        if(this.tokens.yesNo == 0){
            this.changePhase();
        }
    }

    async voteForWerewolf(){
        //audio clip
        if(this.tokens.yesNo > 0){
            await this.voice.playAndWait("outoftime");
        }
        else{
            await this.voice.playAndWait("outoftokens");
        }
        this.startTimer(60000, this.changePhase);
        const embed = this.buildStatusEmbed();
        const channel = this.guild.channels.cache.get(this.gameChannel);
        this.status = await channel.send({embeds: [embed]});
        this.updateEmbed();
    }

    async identifySeer(){
        let werewolves = [];
        for(const player of this.players.values()){
            if(player.role === "Werewolf"){
                werewolves.push(player.member.displayName);
            }
        }
        if(werewolves.length > 1){
            this.werewolfSpokesman = werewolves[Math.floor(Math.random(werewolves.length))];
        }
        else{
            this.werewolfSpokesman = werewolves[0];
        }
        this.startTimer(30000, this.changePhase);
        const embed = this.buildStatusEmbed();
        const channel = this.guild.channels.cache.get(this.gameChannel);
        let msg = "Werewolves: ";
        for(const werewolf of werewolves){
            msg += (werewolf + " ");
        }
        msg += `\nThe Werewolf who will be voting is: **${this.werewolfSpokesman}**`;
        await channel.send(msg);
        this.status = await channel.send({embeds: [embed]});
        this.updateEmbed();
    }

    async seerVoteReceived(vote){
        this.vote = vote;
        this.changePhase();
    }

    countVotes(){
        let votes = {}
        for(const player of this.players.values()){
            if(!votes[player.id]){
                votes[player.id] = 0;
            }
            if(!votes[player.vote]){
                votes[player.vote] = 0;
            }
            votes[player.vote]++;
        }
        let maxVotes = 0;
        for(const [id, value] of Object.entries(votes)){
            if (value > maxVotes){
                maxVotes = value;
            }
        }
        let executions = [];
        for(const [id, value] of Object.entries(votes)){
            if (value == maxVotes){
                executions.push(id);
            }
        }
        return executions;
    }

    async endgame(){
        const channel = this.guild.channels.cache.get(this.gameChannel);
        if(this.villageWin){
            let seer = null;
            let findApprentice = false;
            if(this.players.values().length > 6){
                if(this.players.get(this.mayor).role === "Seer"){
                    findApprentice = true;
                }
            }
            for(const player of this.players.values()){
                if(findApprentice){
                    if(player.role === "Apprentice"){
                        seer = player.id;
                    }
                }
                else{
                    if(player.role === "Seer"){
                        seer = player.id;
                    }
                }
            }
            const seerName = this.players.get(seer).member.displayName;
            if(seer === this.vote){
                channel.send(`Game Over! The Werewolves win!`);
            }
            else{
                channel.send(`Game Over! The Village wins! The seer was: **${seerName}**.`);
            }
        }
        else{
            let werewolves = [];
            for(const player of this.players.values()){
                if(player.role === "Werewolf"){
                    werewolves.push(player.member.id);
                }
            }
            let executions = this.countVotes();
            let foundWerewolf = false;
            for(const player of executions){
                if(werewolves.includes(player)){
                    foundWerewolf = true;
                }
            }
            let msg = "Game Over! The ";
            if(foundWerewolf){
                msg += "Village wins!";
            }
            else{
                msg += "Werewolves win!";
            }
            msg += "\nThe Werewolves were: "
            for(const wolf of werewolves){
                msg += `\n${this.players.get(wolf).member.displayName}`;
            }
            channel.send(msg);
        }
        this.destroy();
    }
    async destroy(){
        this.clearTimer();
        let role = this.guild.roles.cache.get(this.mayorRole);
        for (const m of role.members.values()) {
            await m.roles.remove(role);
        }
        this.timer = null;
        this.players = null;
        this.voice.disconnect();
        clearTimeout(this.updateInterval);
        this.updateInterval = null;
        if (this.onEnd) {
        this.onEnd(
            this.guildID,
        );
    }
    }

}
module.exports = WerewordsGame;