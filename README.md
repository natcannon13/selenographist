# Selenographist:

## A bot to play Werewords in your Discord server.

Credit to Bezier Games for inventing Werewords.



#### What is Werewords?

Werewords is a social deduction word game for 4 to 15 players that combines Werewolf and Twenty Questions. Each game has a Mayor, who selects a Magic Word. The remaining players ask yes/no questions to the Mayor to try to guess the Magic Word. Each player has a secret role, which places them on either the Village or the Werewolf team. The Village wants the word to be guessed, whereas the Werewolf does not want the word to be guessed. A Seer on the Village team knows the word, and can guide the Villagers towards it. However, the Werewolves also know the word, and will try to mislead the town. If the word is guessed, the Werewolves can steal the victory by killing the Seer. If the word is not guessed, the Villagers can claim victory by voting out a Werewolf.



#### How to use this bot:

1. Add the bot to your server.
2. Create 2 text channels and 1 voice channel for the game.
3. Create a mayor role and restrict one of the text channels to be only visible to the mayor.
4. Run !config to link the bot to the channels and role
5. Run !werewords to play!

### 

### Bot Commands:



#### !config &lt;mayorRole&gt; &lt;gameChannel&gt; &lt;mayorChannel&gt; &lt;voiceChannel&gt;

* Saves the configuration of the bot.
* Mention the mayor role, then link the three channels.



#### !showconfig

* Displays the bot configuration for your server.



#### !werewords &lt;difficulty&gt; &lt;optional: mayor&gt;

* Begins a game of Werewords among the players in the voice channel, unless a game is already happening.
* Available difficulties / aliases:

  * 'ridiculous', 'r'
  * 'hard', 'h',
  * 'medium', 'm',
  * 'easy', 'e'
* If a user is mentioned, that user will be assigned as the Mayor. Otherwise, a random player will be assigned as the Mayor.



### Gameplay:

When the game begins, each player is assigned and direct messaged their role.

Which roles are used depends on player count:

* 4 - Seer, Werewolf, 2x Villager
* 5 - Seer, Werewolf, 3x Villager
* 6 - Seer, Werewolf, 4x Villager
* 7 - Seer, Apprentice, 2x Werewolf, 3x Villager
* 8 - Seer, Apprentice, 2x Werewolf, 4x Villager
* 9 - Seer, Apprentice, 2x Werewolf, 5x Villager
* 10 - Seer, Apprentice, 2x Werewolf, 6x Villager
* 11 - Seer, Apprentice, Beholder, 3x Werewolf, 5x Villager
* 12 - Seer, Apprentice, Beholder, 3x Werewolf, 6x Villager
* 13 - Seer, Apprentice, 2x Mason, 3x Werewolf, 6x Villager
* 14 - Seer, Apprentice, Beholder, 2x Mason, 3x Werewolf, 6x Villager
* 15 - Seer, Apprentice, Beholder, 2x Mason, 3x Werewolf, 7x Villager



The Mayor receives a Discord role granting them access to the mayor channel. The Mayor is then pinged in the mayor channel with a choice of a number of words depending on difficulty.

* 2 on easy
* 3 on medium
* 4 on hard
* 5 on ridiculous

The word choices will be numbered and displayed in the mayor channel. The mayor selects the Magic Word with

#### !word &lt;number&gt;

The Seer and Werewolves then receive a direct message containing the word. The Apprentice receives a direct message containing the word if the Mayor is the Seer.



The bot will then announce that the town has a number of minutes, depending on difficulty, to guess the word.

* 3 on easy
* 4 on medium
* 5 on hard
* 6 on ridiculous



During this time period players ask their questions to the Mayor. The Mayor will use the following command to answer:

#### !t &lt;token&gt; &lt;player&gt;

* Informs players of the Mayor's answer to their question, and tracks the remaining tokens.
* There are 6 types of token.

  * y (yes)
  * n (no)
  * m (maybe)
  * s (so close)
  * w (way way off)
  * c (correct)
* Tokens are limited.

  * 36 Yes/No tokens
  * 12 Maybe tokens
  * 1 So Close token
  * 1 Way Way Off token
  * 1 Correct token
* The mentioned player will be mentioned in the game channel with the Mayor's response.



An embed message displays the time and number of Yes/No tokens remaining, as well as the tokens received by each player.



If any player receives the Correct token, the Werewolves get an opportunity to kill the Seer. The Werewolves are revealed to the rest of the players, and get 30 seconds to discuss who the seer is. One Werewolf is randomly selected to make the final decision. To kill the Seer, this Werewolf must use the following command within the 30 seconds:

#### !vote &lt;player&gt;

If the mentioned player is the Seer, the Werewolves win.



If the town runs out of Yes/No tokens or the timer runs out before they have guessed the Magic Word, the Village must now try to vote out a Werewolf. The Magic Word is revealed to every player, and the town gets 60 seconds to discuss who the Werewolves are. Each player votes using the same vote command within the 60 seconds.



If the player(s) with the most votes is a Werewolf, the Village wins.



After either voting phase, an embed message is sent, displaying the Seer and Werewolves, and the winner of the game.

The bot then disconnects from the voice channel, removes the Mayor role, and resets so that the game can be played again!

