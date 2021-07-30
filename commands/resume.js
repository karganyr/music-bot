const bot = require("../bot.js")
const queue = bot.getq();

module.exports = {
    name: 'resume',
    description: 'Resumes playing the song',
    args: false,
    args_length: 0,
    execute(message, args) {
      const squeue = queue.get(message.guild.id);
      if (!message.member.voice.channel) {
        return message.channel.send("You have to be in a voice channel to resume the music!");
      }
      if (!squeue) {
        return message.channel.send("There is no music to be resumed!");
      }
      squeue.dispatcher.resume();
      squeue.textChannel.send('Playback resumed');
    },
};
