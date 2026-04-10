require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });
const config_util = require("./utils/config_util.js");

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  config_util.loadConfig();
});

client.on('messageCreate', message => {
  if (!(message.content.startsWith("!"))) {
    return;
  }
  const args = message.content.slice(1).split(" ");
  const commandName = args.shift().toLowerCase();

  try{
    const command = require(`./commands/${commandName}.js`);
    command.run(message, args, client);
  }
  catch(err){
    console.log(err);
    message.reply('Unknown command, perhaps you mistyped it?');
  }

});

client.login(process.env.TOKEN);