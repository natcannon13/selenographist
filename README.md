Werewords Bot:

A bot to play Werewords in your Discord server.



Setup / Game Start Commands:

!configure (admin)

* Launches a series of prompts to configure the bot. Three prompts, each asks for a channel ID.

  * Mayor Commands
  * Gameplay Channel
  * Voice Call



!werewords <difficulty> <optional: mayor>

* Begins a game of Werewords among the players in the call if one is not already happening. Otherwise returns an error.
* Difficulty parameter looks for one of the following

  * e
  * easy
  * m
  * medium
  * h
  * hard
  * r
  * ridiculous
* Mayor parameter sets the mayor to a certain user if the user is present in the call. If left blank or the user is not in the call, selects a random valid mayor. Assigns the user the Mayor role.



Gameplay:

Roles are assigned. 

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

Player Count must be between 4 and 15.

Discord role is only given to the mayor. Players assigned other roles receive a direct message from the bot informing them what their role is. If they are a werewolf, they learn who the other werewolf is. If they are a mason, they learn who the other mason is. If they are the Beholder, they learn the Seer and Apprentice.

The Mayor is pinged in the mayor commands channel with a choice of n words depending on difficulty.

n = 

* 2 on easy
* 3 on medium
* 4 on hard
* 5 on ridiculous

The words are numbered 1-n. To select his word, the mayor uses the command "!word <x>" where x is the number of his choice.

The Seer and Werewolves then receive a direct message containing the word. The Apprentice receives a direct message containing the word if the Mayor is the Seer.



The bot will then announce that the town has n+1 minutes to guess the word. During this time period players ask their questions to the mayor. The mayor will type commands in the mayor command channel to answer.

!t <token> <player>

* The player parameter determines the person who will be pinged in the game channel with the answer.
* The token parameter can be one of 6 valid options

  * y (yes)
  * n (no)
  * m (maybe)
  * s (so close)
  * w (way way off)
  * c (correct)
* There is a limit to which tokens are available.

  * 36 yes/no combined triggers the village loss condition.
  * 12 maybe makes maybe unavailable
  * 1 s or w makes those unavailable
  * 1 c triggers the village win condition
* At any time a player may run !t r in the game channel to view how many yes/no tokens remain.



Running out of time triggers the village loss condition.



Village Win Condition:

* The Werewolves are revealed to the rest of the table. They get 15 \* w seconds to discuss who they think the seer is. At the end of this time, one werewolf votes on who the seer is.

The command is !vote <player>

* If the seer is correctly identified, the werewolves win.



Village Loss Condition:

The village gets 60 seconds to discuss who they think the werewolf is. At the end of this time, everyone votes for who they think the werewolf is.

The command is !vote <player>

If the person who receives the most votes is a werewolf, the village wins.



The mayor role is then removed and the game resets.



