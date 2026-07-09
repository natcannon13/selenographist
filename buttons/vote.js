const config_util = require("../utils/config_util.js");
const GameManager = require("../game/GameManager.js");
const roles_util = require("../utils/roles_util.js");
const WerewordsGame = require("../game/WerewordsGame.js");
const Player = require("../game/Player.js");

async function run(interaction, guildId, user, option){
    console.log(`button clicked: ${option}`);
    const game = GameManager.findGame(guildId);
    if(!game){
        return;
    }
    
}