require('dotenv').config();
const { Client, GatewayIntentBits, ActivityType } = require('discord.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildVoiceStates] });
const config_util = require("./utils/config_util.js");

client.on('clientReady', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  config_util.loadConfig();
  client.user.setPresence({
    activities: [{
      name: "!help message",
      type: ActivityType.Custom,
      state: "Use !help to see commands"
    }],
    status: 'online'
  });
});

const COMMANDS = new Set(["config", "showconfig", "werewords", "ask", "quit", "help", "rules"]);
const BUTTONS = new Set(["token", "vote", "word"]);

client.on('messageCreate', async (message) => {
  if (message.author.bot || !(message.content.startsWith("!"))) {
    return;
  }
  const args = message.content.slice(1).split(" ");
  const commandName = args.shift().toLowerCase();

  if (!COMMANDS.has(commandName)){
    await message.reply('Unknown command, perhaps you mistyped it?');
    return;
  }
  try{
    const command = require(`./commands/${commandName}.js`);
    await command.run(message, args, client);
  }
  catch(err){
    console.log(err);
    await message.reply('Unknown command, perhaps you mistyped it?');
  }

});

client.on("interactionCreate", async (interaction) => {
  if(!interaction.isButton()){
    return;
  }
  const [action, guildId, user, option] =
    interaction.customId.split(";");

  if (!BUTTONS.has(action)){
    await interaction.reply('Button action not found');
    return;
  }

  try{
    const interact = require(`./buttons/${action}.js`);
    await interact.run(interaction, guildId, user, option);
  }
  catch(err){
    console.log(err);
    await interaction.reply("Interaction failed");
  }
});

client.login(process.env.TOKEN);