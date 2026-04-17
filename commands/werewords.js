const { config } = require("dotenv");
const GameManager = require("../game/GameManager.js");
const werewordsGame = require("../game/WerewordsGame.js");
const config_util = require("../utils/config_util.js");

function run(message, args, client){
    if (!(message.member.voice.channel)) {
        return message.reply("You must be in the voice channel to start Werewords!");
    }
    const voiceChannel = message.member.voice.channel.id;
    const activeChannel = config_util.config[message.guild.id].voiceChannel;
    if ((voiceChannel != activeChannel)){
        return message.reply(`You must be in <#${activeChannel}> to use this command!`);
    }
    let mayor = null;
    if(args.length == 1){
        mayor = null;
    }
    else if(args.length == 2){
        mayor = args[1];
    }
    else{
        return message.reply("Incorrect number of arguments. Correct form for this command is:\n!werewords <difficulty> <optional:mayor>");
    }
    difficulty = standardize(args[0]);
    if(difficulty.charAt(0) === "I"){
        return message.reply(difficulty);
    }
    const game = GameManager.createGame(message.guild.id, difficulty, mayor, client);
    if(!game){
        return message.reply("There is already a game happening in this server!");
    }
    GameManager.startGame(message.guild.id);
}

function standardize(difficulty){
    difficulty = difficulty.toLowerCase();
    if(difficulty === "ridiculous" || difficulty === "hard" || difficulty === "medium" || difficulty === "easy"){
        return difficulty;
    }
    if(difficulty === 'r'){
        return "ridiculous";
    }
    if(difficulty === 'e'){
        return "easy";
    }
    if(difficulty === 'm'){
        return "medium";
    }
    if(difficulty === 'h'){
        return "hard";
    }
    return "Invalid difficulty. The options are as follows:\n Ridiculous - 'ridiculous', 'r'\nHard - 'hard', 'h'\nMedium - 'medium', 'm'\nEasy - 'easy', 'e'";
}

module.exports = {
    run
}