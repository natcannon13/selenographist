const WerewordsGame = require("./WerewordsGame");
class GameManager{
    constructor(guildID){
        this.games = new Map(); 
    }

    createGame(guildID, difficulty, mayor, client){
        if(this.games.has(guildID)) return null;
        const game = new WerewordsGame(guildID, difficulty, mayor, client, (result) => {
            this.deleteGame(guildID);
        });
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