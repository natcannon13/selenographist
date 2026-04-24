const {joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, entersState, VoiceConnectionStatus} = require('@discordjs/voice');
const ffmpegPath = require('ffmpeg-static');
const path = require('path');
process.env.FFMPEG_PATH = ffmpegPath;
class VoiceManager{
    constructor(channel){
        this.channel = channel;
        this.connection = null;
        this.player = createAudioPlayer();

        this.player.on('error', error => {
            console.error('Audio error:', error);
        });

        this.player.on(AudioPlayerStatus.Playing, () => {
            console.log('Playing audio');
        });

        this.player.on(AudioPlayerStatus.Idle, () => {
            console.log('Audio finished');
        });
    }

    async join(){
        if (this.connection) return;
        this.connection = joinVoiceChannel({
            channelId: this.channel.id,
            guildId: this.channel.guild.id,
            adapterCreator: this.channel.guild.voiceAdapterCreator
        })
        await entersState(this.connection, VoiceConnectionStatus.Ready, 5000);
        return this.connection;
    }

    async play(audio){
        const filePath = path.join(__dirname, '..', 'audio', `${audio}2.ogg`);
        console.log("Resolved path:", filePath);

        const resource = createAudioResource(filePath);
        this.connection.subscribe(this.player);
        this.player.play(resource);
    }

    async playAndWait(audio){
        await this.play(audio);
        await entersState(this.player, AudioPlayerStatus.Idle, 15_000);
    }

    disconnect(){
        this.connection.destroy();
        this.connection = null;
    }
}
module.exports = VoiceManager;