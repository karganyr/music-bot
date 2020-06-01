const bot = require("../bot.js")
const queue = bot.getq();

module.exports = {
    name: 'pause',
    description: 'Test if bot is online',
    args: false,
    queue: true,
    execute(message, args) {
      const squeue = queue.get(message.guild.id);
      if (!message.member.voice.channel) {
        return message.channel.send("You have to be in a voice channel to pause the music!");
      }
      if (!squeue) {
        return message.channel.send("There is no music to be paused!");
      }
      squeue.dispatcher.pause(true);
      squeue.textChannel.send('Playback paused');
    },
};
