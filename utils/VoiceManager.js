const {joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus} = require('@discordjs/voice');
class VoiceManager{
    constructor(channel){
        this.channel = channel;
        this.connection = null;
        this.player = createAudioPlayer();
    }

    async join(){
        if (this.connection) return;
        this.connection = joinVoiceChannel({
            channelId: this.channel.id,
            guildId: this.channel.guild.id,
            adapterCreator: this.channel.guild.voiceAdapterCreator
        })
        return this.connection;
    }

    play(audio){
        const resource = createAudioResource(`../audio/${audio}.ogg`);
        this.player.play(resource);
        this.connection.subscribe(this.player);
    }

    disconnect(){
        this.connection.destroy();
        this.connection = null;
    }
}
module.exports = VoiceManager;