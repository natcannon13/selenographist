const { EmbedBuilder } = require('discord.js');

// Discord strips normal leading spaces in embeds; non-breaking spaces keep indentation.
const INDENT = '\u00A0\u00A0';

async function run(message, args, client) {
    let embed = new EmbedBuilder()
        .setTitle('Werewords Rules')
        .addFields(
            { name: '**Overview:**', value: 'In a game of Werewords, the Mayor will choose a magic word, which is hidden from the other players. Through asking the Mayor yes/no questions, the Village team attempts to discover the magic word, while the Werewolf team aims to prevent them from doing so.', inline: false },
            { name: '**Gameplay:**', value: ' ', inline: true },
            { name: '**Night Phase:**', value: '1. Each player, including the Mayor, receives a secret role.\n2. The Mayor selects a Magic Word from a list of words.\n3. All players receive any information associated with their role.', inline: false },
            { name: '**Day Phase:**', value: `• Players ask the Mayor yes/no questions about the word.\n• The Mayor answers the question with any of the tokens:\n${INDENT}◦ Yes\n${INDENT}◦ No\n${INDENT}◦ Maybe\n${INDENT}◦ So Close\n${INDENT}◦ Way Way Off\n${INDENT}◦ Correct\n• This continues until one of three victory conditions is met.\n${INDENT}◦ The word is guessed - Village victory\n${INDENT}◦ The timer runs out - Werewolf victory\n${INDENT}◦ The village runs out of tokens - Werewolf victory`, inline: false },
            { name: '**Voting Phase:**', value: '• The losing team has one last chance to change the outcome through a vote.', inline: false },
            { name: '**If the Village won:**', value: '• The Werewolves have one chance to identify the Seer.\n• If the Seer is correctly identified, the Werewolves win.', inline: false },
            { name: '**If the Werewolves won:**', value: '• Each player votes for another player who he or she would like to execute.\n• The player or player receiving the most votes is executed.\n• If any executed player is a Werewolf, the Village wins.', inline: false },
            { name: '**Roles:**', value: ' ', inline: true },
            { name: '**Village Team:**', value: '• Villager - No special abilities\n• Seer - Sees the Magic Word\n• Apprentice - If the Mayor is the Seer, sees the Magic Word, and Werewolves must identify the Apprentice instead of the Seer.\n• Beholder - Sees the Seer and Apprentice \n• Mason - Sees the other Mason', inline: false },
            { name: '**Werewolf Team:**', value: '• Werewolf - Sees the Magic Word and the other Werewolves', inline: false },
        );
    return message.reply({ embeds: [embed] });
}

module.exports = {
    run
}
