require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildVoiceStates] });
const config_util = require("./utils/config_util.js");

client.on('clientReady', () => {
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

client.on("interactionCreate", async interaction => {
  await interaction.deferUpdate();
  if(!interaction.isButton()){
    return;
  }
  const [action, guildId, user, option] =
    interaction.customId.split(":");

  try{
    const interact = require(`./buttons/${action}.js`);
    interact.run(interaction, guildId, user, option);
  }
  catch(err){
    console.log(err);
    interaction.reply("Interaction failed");
  }
});

client.login(process.env.TOKEN);