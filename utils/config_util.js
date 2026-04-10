const fs = require("fs");
const path = require("path");

let config = {};
let configpath = path.join(__dirname, "config2.json");

function loadConfig(){
    if (fs.existsSync(configpath)){
        const parsed = JSON.parse(fs.readFileSync(configpath, "utf-8"));
        for (const key in config) {
            delete config[key];
        }
        Object.assign(config, parsed);
    }
}

function saveConfig(){
    fs.writeFileSync(configpath, JSON.stringify(config, null, 2));
}

function getChannelID(input){
    const match = input.match(/^<#(\d+)>$/);
    return match ? match[1] : null;
}

module.exports = {
    loadConfig,
    saveConfig,
    getChannelID,
    config
}