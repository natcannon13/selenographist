const config_util = require("../utils/config_util.js");
const roles_util = require("../utils/roles_util.js");
const dm_util = require("../utils/dm_util.js");
const word_util = require("../utils/word_util.js");
const emoji_util = require("../utils/emoji_util.js");
const Player = require("../game/Player.js");
const SecretInfo = require("../game/SecretInfo.js");
const VoiceManager = require("../utils/VoiceManager.js");
const { EmbedBuilder,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
    ActionRow, 
    time
 } = require('discord.js');
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
        this.guildID = guildID;
        this.voice = new VoiceManager(this.guild.channels.cache.get(this.voiceChannel));
        this.timer = null;
        this.timeLeft = 0;
        this.endTime = null;
        this.status = null;
        this.mayorStatus = null;
        this.updateInterval = null;
        this.vote = null;
        this.werewolfSpokesman = null;
        this.onEnd = onEnd;
        this.questions = []
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
                clearInterval(this.updateInterval);
                this.updateInterval = null;
                this.clearTimer();
                await this.clearOpenQuestionEmbeds();
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
                await this.endgame();
                break;
            case "werewolfVote":
                this.clearTimer();
                this.phase = "end";
                await this.endgame();
                break;
            case "end":
                break;
        }
    }

    async start(){
        if(this.phase === "setup"){
            await this.voice.join();
            if(!this.getPlayers()){
                await this.destroy();
                return;
            }
            else{
            if(this.mayor == null){
                const playerArray = Array.from(this.players.values());
                const randomPlayer = playerArray[Math.floor(Math.random() * playerArray.length)];
                this.mayor = randomPlayer.member.id;
            }
            this.players.get(this.mayor).isMayor = true;
            await this.assignRoles();
            await this.voice.playAndWait("intro");
            await this.changePhase();
            }
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
        console.log(this.players.values);
        const gchannel = this.guild.channels.cache.get(this.gameChannel);
        if(this.players.size < 4){
            gchannel.send("Not enough players!");
            return false;
        }
        else if(this.players.size > 15){
            gchannel.send("Too many players!");
            return false;
        }
        return true;
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
        const gameChannel = this.guild.channels.cache.get(this.gameChannel);
        try{
            //send mayor the embed
            await dm_util.sendWordChoice(this.players.get(this.mayor), this.difficulty, this.players.get(this.mayor).role);
        }
       catch{
            await gameChannel.send("Message failed! Make sure Selenographist is able to direct message you!");
            await this.destroy();
            return;
        }
        await this.voice.playAndWait("mayorchoose");
    }

    async wordChosen(word){
        this.word = word;
        let info = new SecretInfo(this.word);
        info.setInfo(this.players);
        for(const player of this.players.values()){
           await dm_util.sendInfo(player, info);
        }
        await this.voice.playAndWait("hiddeninfo");
        await this.changePhase();
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
            clearInterval(this.updateInterval);
            this.timer = null;
        }
    }

    buildStatusEmbed(){
        let minutes = Math.floor(this.timeLeft / 60);
        let seconds = (this.timeLeft) % 60;
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
        let buttons = [];
        for(const player of this.players.values()){
            if(!player.isMayor){
                tokenCounts.push({name: `**${player.member.displayName}**`, value: `${player.tokenStatsMessage()}`});
            }
            if(player.vote){
                numVotes++;
            }
            const button = new ButtonBuilder()
            .setCustomId(`vote:${this.guildID}:${player.id}:vote`)
            .setLabel(`${player.member.displayName}`)
            .setStyle(ButtonStyle.Primary);
            buttons.push(button);
        }
        let components = [];
        for(let i = 0; i < buttons.length; i += 5){
            const row = new ActionRowBuilder();
            for(let j = 0; j < 5; j++){
                if(buttons[i + j]){
                    row.addComponents(buttons[i + j]);
                }
            }
            components.push(row);
        }
        const embed = new EmbedBuilder()
        .setTitle("Werewords Voting")
        .addFields(
            {name: "Time Remaining", value: `0:${seconds}`, inline: true},
            {name: "Votes Received", value: `${numVotes}`, inline: true},
            {name: "Magic Word", value: `${this.word}`, inline: true}
        )
        .addFields(tokenCounts);

        return({
            embeds: [embed],
            components: components
        })
    }

    buildResultsEmbed(){
        let voteCounts = [];
        let werewolves = [];
        let roles = [];
        let seer = null;
        let apprentice = null;
        if (!this.villageWin) {
            const tallies = this.getVoteTallies();
            for (const player of this.players.values()) {
                voteCounts.push({
                    name: `**${player.member.displayName}**`,
                    value: `${tallies[player.id] ?? 0}`,
                });
            }
        } else if (typeof this.vote === "string" && this.players.has(this.vote)) {
            const target = this.players.get(this.vote);
            voteCounts.push({
                name: `**${target.member.displayName}**`,
                value: "1",
            });
        } else {
            voteCounts.push({ name: "Seer kill vote", value: "None" });
        }
        for(const player of this.players.values()){
                if(player.role === "Werewolf"){
                    werewolves.push(player.member.displayName);
                }
                if(player.role === "Seer"){
                    seer = player.member.displayName;
                }
                if(player.role === "Apprentice"){
                    apprentice = player.member.displayName;
                }
        }
        let strWolves = "";
        for (const wolf of werewolves){
            strWolves += `${wolf}  `;
        }
        roles.push({name: "Werewolves", value: `${strWolves}`});
        roles.push({name: "Seer", value: `${seer}`});
        if(this.players.size > 6){
            roles.push({name: "Apprentice", value: `${apprentice}`});
        }
        return new EmbedBuilder()
        .setTitle("Werewords Results")
        .addFields(
            {name: "Magic Word", value: `${this.word}`, inline: true},
            {name: "\u200B", value: "Votes Received:"}
        )
        .addFields(voteCounts)
        .addFields(roles);
    }

    async updateEmbed(){
        this.updateInterval = setInterval(async () => {
                if(!this.status) return;
                this.timeLeft = Math.max(
                    0,
                    Math.ceil((this.endTime - Date.now()) / 1000)
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
                        await this.status.edit(this.buildVoteEmbed());
                    }
                } catch(err){
                    console.error("Embed failure", err);
                }
            }, 5000
        );
    }

    async askQuestion(user){
        let msg = this.buildTokenEmbed(user);
        const channel = this.guild.channels.cache.get(this.mayorChannel);
        const message = await channel.send(msg);
        this.players.get(user).questionEmbed = message;
    }

    async clearOpenQuestionEmbeds(){
        if(!this.players) return;
        for(const player of this.players.values()){
            if(!player.questionEmbed) continue;
            const embed = player.questionEmbed;
            player.questionEmbed = null;
            try{
                await embed.delete();
            }
            catch(err){
                console.log(err);
            }
        }
    }

    async giveToken(token, user){
        let player = this.players.get(user);
        if(!player || player.questionEmbed == null){
            return;
        }
        const embed = player.questionEmbed;
        player.questionEmbed = null;

        const stockKey = ({
            y: "yesNo",
            n: "yesNo",
            m: "maybe",
            s: "soClose",
            w: "wayWayOff"
        })[token];
        if(!stockKey || this.tokens[stockKey] <= 0){
            try{
                await embed.delete();
            }
            catch(err){
                console.log(err);
            }
            return;
        }

        let msg = `<@${user}>, The Mayor answered your question: **`;
        let depletedYesNo = false;
        switch(token){
            case 'y':
                msg += ("YES** " + emoji_util.yes);
                this.tokens.yesNo--;
                player.tokens.yes++;
                depletedYesNo = this.tokens.yesNo == 0;
                break;
            case 'n':
                msg += ("NO** " + emoji_util.no);
                this.tokens.yesNo--;
                player.tokens.no++;
                depletedYesNo = this.tokens.yesNo == 0;
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
                break;
        }
        const channel = this.guild.channels.cache.get(this.gameChannel);
        await channel.send(msg);
        try{
            await embed.delete();
        }
        catch(err){
            console.log(err);
        }
        if(depletedYesNo){
            await this.checkTokens();
        }
    }

    buildTokenEmbed(user){
        const embed = new EmbedBuilder()
        .setTitle(`${this.players.get(user).member.displayName} asked a question!`)
        .setDescription("Choose a token:");

        const yesButton = new ButtonBuilder()
            .setCustomId(`token:${this.guildID}:${user}:yes`)
            .setLabel(`Yes: ${this.tokens.yesNo}`)
            .setStyle(ButtonStyle.Primary)
            .setDisabled(!this.tokens.yesNo)
            .setEmoji('1494609206223962183');

        const noButton = new ButtonBuilder()
            .setCustomId(`token:${this.guildID}:${user}:no`)
            .setLabel(`No: ${this.tokens.yesNo}`)
            .setStyle(ButtonStyle.Primary)
            .setDisabled(!this.tokens.yesNo)
            .setEmoji('1494609273865371649');

        const maybeButton = new ButtonBuilder()
            .setCustomId(`token:${this.guildID}:${user}:maybe`)
            .setLabel(`Maybe: ${this.tokens.maybe}`)
            .setStyle(ButtonStyle.Primary)
            .setDisabled(!this.tokens.maybe)
            .setEmoji('1494609290252783779');

        const soCloseButton = new ButtonBuilder()
            .setCustomId(`token:${this.guildID}:${user}:soClose`)
            .setLabel(`So Close!: ${this.tokens.soClose}`)
            .setStyle(ButtonStyle.Primary)
            .setDisabled(!this.tokens.soClose)
            .setEmoji('1494609243981090866');

        const wayWayOffButton = new ButtonBuilder()
            .setCustomId(`token:${this.guildID}:${user}:wayWayOff`)
            .setLabel(`Way Way Off!: ${this.tokens.wayWayOff}`)
            .setStyle(ButtonStyle.Primary)
            .setDisabled(!this.tokens.wayWayOff)
            .setEmoji('1494609231654027304');

        const correctButton = new ButtonBuilder()
            .setCustomId(`token:${this.guildID}:${user}:correct`)
            .setLabel(`Correct!: ${this.tokens.correct}`)
            .setStyle(ButtonStyle.Primary)
            .setDisabled(!this.tokens.correct)
            .setEmoji('1494609305775771658');

        const row1 = new ActionRowBuilder()
            .addComponents(
                yesButton,
                noButton,
                maybeButton
            );
        const row2 = new ActionRowBuilder()
            .addComponents(
                soCloseButton,
                wayWayOffButton,
                correctButton
            )

        return ({
            embeds: [embed],
            components: [row1, row2]
        })
    }

    async wordGuessed(user){
        let player = this.players.get(user);
        if(!player || player.questionEmbed == null){
            return;
        }
        const embed = player.questionEmbed;
        player.questionEmbed = null;
        if(this.tokens.correct <= 0){
            try{
                await embed.delete();
            }
            catch(err){
                console.log(err);
            }
            return;
        }
        this.tokens.correct = 0;
        try{
            await embed.delete();
        }
        catch(err){
            console.log(err);
        }
        const channel = this.guild.channels.cache.get(this.gameChannel);
        await channel.send(`<@${user}> discovered the Magic Word!`);
        await this.voice.playAndWait("foundword");
        this.villageWin = true;
        await this.changePhase();
    }

    async checkTokens(){
        if(this.tokens.yesNo == 0){
            await this.changePhase();
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
        const channel = this.guild.channels.cache.get(this.gameChannel);
        this.status = await channel.send(this.buildVoteEmbed());
        this.updateEmbed();
    }

    async identifySeer(){
        let werewolves = [];
        for(const player of this.players.values()){
            if(player.role === "Werewolf"){
                werewolves.push(player.id);
            }
        }
        if(werewolves.length > 1){
            this.werewolfSpokesman = werewolves[Math.floor(Math.random() * werewolves.length)];
        }
        else{
            this.werewolfSpokesman = werewolves[0];
        }
        this.startTimer(30000, this.changePhase);
        const channel = this.guild.channels.cache.get(this.gameChannel);
        let msg = "Werewolves: ";
        for(const werewolfId of werewolves){
            msg += (this.players.get(werewolfId).member.displayName + " ");
        }
        const spokesmanName = this.players.get(this.werewolfSpokesman).member.displayName;
        msg += `\nThe Werewolf who will be voting is: **${spokesmanName}**`;
        await channel.send(msg);
        this.status = await channel.send(this.buildVoteEmbed());
        this.updateEmbed();
    }

    async seerVoteReceived(vote){
        this.vote = vote;
        await this.changePhase();
    }

    getVoteTallies() {
        const votes = {};
        for (const player of this.players.values()) {
            if (player.vote == null) continue;
            votes[player.vote] = (votes[player.vote] ?? 0) + 1;
        }
        return votes;
    }

    getExecutionTargets() {
        const votes = this.getVoteTallies();
        let maxVotes = 0;
        for (const count of Object.values(votes)) {
            if (count > maxVotes) maxVotes = count;
        }

        const executions = [];
        for (const [id, count] of Object.entries(votes)) {
            if (count === maxVotes) executions.push(id);
        }
        return executions;
    }

    async endgame(){
        const channel = this.guild.channels.cache.get(this.gameChannel);
        if(this.villageWin){
            let seer = null;
            let findApprentice = false;
            if(this.players.size > 6){
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
            if(seer != null && seer === this.vote){
                channel.send(`Game Over! The Werewolves win!`);
            }
            else{
                channel.send(`Game Over! The Village wins!`);
            }
        }
        else{
            let werewolves = [];
            for(const player of this.players.values()){
                if(player.role === "Werewolf"){
                    werewolves.push(player.member.id);
                }
            }
            let executions = this.getExecutionTargets();
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
            channel.send(msg);
        }
        const embed = this.buildResultsEmbed();
        this.status = await channel.send({embeds: [embed]});
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
        clearInterval(this.updateInterval);
        this.updateInterval = null;
        if (this.onEnd) {
        this.onEnd(
            this.guildID,
        );
    }
    }

}
module.exports = WerewordsGame;