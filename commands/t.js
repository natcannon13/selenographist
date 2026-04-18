const config_util = require("../utils/config_util.js");
const GameManager = require("../game/GameManager.js");
const roles_util = require("../utils/roles_util.js");
const WerewordsGame = require("../game/WerewordsGame.js");
const Player = require("../game/Player.js");

async function run(message, args, client){
    let game = GameManager.findGame(message.guild.id);
    if(game){
        let user = message.member;
        if(user.id != game.mayor){
            return message.reply("You must be the Mayor to use this command!");
        }
        if(game.phase != "questions"){
            return message.reply("You cannot use this right now.");
        }
        if(game.mayorChannel != message.channel.id){
            return message.reply("You can only use this command in the mayor channel.");
        }
        let token = args[0];
        let questioner = args[1];
        questioner = roles_util.getPlayerID(questioner);
        if(questioner === user.id){
            return message.reply("You are the Mayor! You can't ask questions!");
        }
        switch (token){
            case 'y':
                await game.giveToken(token, questioner);
                break;
            case 'n':
                await game.giveToken(token, questioner);
                break;
            case 'm':
                if(game.tokens.maybe == 0){
                    return message.reply("You have no more of this kind of token.");
                }
                await game.giveToken(token, questioner);
                break;
            case 'c':
                await game.wordGuessed(questioner);
                break;
            case 'w':
                if(game.tokens.wayWayOff == 0){
                    return message.reply("You have no more of this kind of token.");
                }
                await game.giveToken(token, questioner);
                break;
            case 's':
                if(game.tokens.soClose == 0){
                    return message.reply("You have no more of this kind of token.");
                }
                await game.giveToken(token, questioner);
                break;
            default:
                return message.reply("Invalid token! Valid options:\ny - Yes\nn - No\nm - maybe\nw - Way Way Off\ns - So Close\nc - Correct");
        }
        
    }
}
module.exports = {
    run
}