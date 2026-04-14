const WerewordsGame = require("./WerewordsGame");
const roles_util = require("../utils/roles_util.js");
class GameManager{
    constructor(guildID){
        this.games = new Map(); 
    }

    createGame(guildID, difficulty, mayor, client){
        if(this.games.has(guildID)) return null;
        let mayorID = null;
        if(mayor){
            mayorID = roles_util.getPlayerID(mayor);
        }
        const game = new WerewordsGame(guildID, difficulty, mayorID, client);
        this.games.set(guildID, game);
        return game;
    }

    findGame(guildID){
        return this.games.get(guildID);
    }

    startGame(guildID){
        const game = this.findGame(guildID);
        if(game){
            game.start();
        }
    }

    deleteGame(guildID){
        this.games.delete(guildID);
    }
}
module.exports = new GameManager();