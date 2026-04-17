const fs = require("fs").promises;

async function getWords(difficulty, role){
    const folderPath = "./wordlists";
    const files = await fs.readdir(folderPath);
    let matchingLists = files.filter(file => file.startsWith(difficulty));
    let secondaryPrefix = null;
    let words = [];
    let numWords = 0;
    let numModifiedWords = 0;
    let wordsSecondary = [];
    let wordChoice = [];

    switch(difficulty){
        case "ridiculous":
            numWords = 5;
            if(role === "Seer"){
                secondaryPrefix = "hard";
                numModifiedWords = 2;
                numWords = 3;
                break;
            }
        case "hard":
            numWords = 4;
            if(role === "Seer"){
                secondaryPrefix = "medium";
                numModifiedWords = 2;
                numWords = 2;
            }
            if(role === "Werewolf"){
                secondaryPrefix = "ridiculous";
                numModifiedWords = 2;
                numWords = 2;
            }
            break;
        case "medium":
            numWords = 3;
            if(role === "Seer"){
                secondaryPrefix = "easy";
                numModifiedWords = 1;
                numWords = 2;
            }
            if(role === "Werewolf"){
                secondaryPrefix = "hard";
                numModifiedWords = 1;
                numWords = 2;
            }
            break;
        case "easy":
            numWords = 2;
            if(role === "Werewolf"){
                secondaryPrefix = "medium";
                numModifiedWords = 1;
                numWords = 1;
            }
            break;
    }
    for(list of matchingLists){
        addWords = (await fs.readFile(`${folderPath}/${list}`, "utf8")).split('\n').map(w => w.trim()).filter(w => w.length > 0);
        words = words.concat(addWords);
    }
    matchingLists = files.filter(file => file.startsWith(secondaryPrefix));
    for(const list of matchingLists){
        addWords = (await fs.readFile(`${folderPath}/${list}`, "utf8")).split('\n').map(w => w.trim()).filter(w => w.length > 0);
        wordsSecondary = wordsSecondary.concat(addWords);
    }
    for(let i = 0; i < numModifiedWords; i++){
        let index = Math.floor(Math.random() * wordsSecondary.length);
        wordChoice.push(wordsSecondary[index]);
    }
    for(let i = 0; i <= numWords; i++){
        let index = Math.floor(Math.random() * words.length);
        wordChoice.push(words[index]);
    }
    return wordChoice;
}
module.exports = {
    getWords
};