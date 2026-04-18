const config_util = require("../utils/config_util.js");
const GameManager = require("../game/GameManager.js");
const WerewordsGame = require("../game/WerewordsGame.js");

function run(message, args, client){
    let game = GameManager.findGame(message.guild.id);
    if(game){
        let user = message.member;
        if(user.id != game.mayor){
            return message.reply("You must be the Mayor to use this command!");
        }
        if(game.phase != "wordChoice"){
            return message.reply("You cannot use this right now.");
        }
        if(game.mayorChannel != message.channel.id){
            return message.reply("You can only use this command in the mayor channel.");
        }
        let index = args[0] - 1;
        if (index >= game.word.length || index < 0){
            return message.reply("Invalid argument. Select a valid word.");
        }
        else{
            message.reply(`Your word is: ${game.word[index]}`);
            game.wordChosen(index);
        }
    }
}
module.exports = {
    run
}