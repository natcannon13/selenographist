const fs = require("fs");

async function getWords(difficulty, role){
    const folderPath = "../wordlists";
    const files = fs.readdirSync(folderPath);
    const matchingLists = files.filter(file => file.startsWith(difficulty));
    let secondaryPrefix = null;
    let words = [];
    let numWords = 0;
    let wordsSecondary = [];
    let wordChoice = [];

    switch(difficulty){
        case "ridiculous":
            numWords = 5;
            if(role === "Seer"){
                secondaryPrefix = "hard";
                break;
            }
        case "hard":
            numWords = 4;
            if(role === "Seer"){
                secondaryPrefix = "medium";
            }
            if(role === "Werewolf"){
                secondaryPrefix = "ridiculous";
            }
            break;
        case "medium":
            numWords = 3;
            if(role === "Seer"){
                secondaryPrefix = "easy";
            }
            if(role === "Werewolf"){
                secondaryPrefix = "hard";
            }
            break;
        case "easy":
            numWords = 2;
            if(role === "Werewolf"){
                secondaryPrefix = "medium";
            }
            break;
    }
    for(list of matchingLists){
        addWords = await fs.readFile(list, "utf-8").split('\n');
        words.concat(addWords);
    }
    matchingLists = files.filter(file => file.startsWith(secondaryPrefix));
    for(list of matchingLists){
        addWords = await fs.readFile(list, "utf-8").split('\n');
        wordsSecondary.concat(addWords);
    }
    let numModifiedWords = 0;
    if(secondaryPrefix){
        numModifiedWords = Math.floor(numWords / 2);
        numWords -= numModifiedWords;
    }
    for(let i = 0; i < numModifiedWords; i++){
        let index = Math.floor(Math.random() * wordsSecondary.length);
        wordChoice.push(wordsSecondary[index]);
    }
    for(let i = 0; i < numWords; i++){
        let index = Math.floor(Math.random() * words.length);
        wordChoice.push(words[index]);
    }
    return wordChoice;
}
module.exports = {
    getWords
};