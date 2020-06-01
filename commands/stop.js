const bot = require("../bot.js")
const queue = bot.getq();

module.exports = {
    name: 'stop',
    description: 'Test if bot is online',
    args: false,
    execute(message, args) {
      const squeue = queue.get(message.guild.id);
      if (!message.member.voice.channel) {
        return message.channel.send("You have to be in a voice channel to stop the music!");
      }
      if (!squeue) {
        return message.channel.send("There is no music to be stopped!");
      }
      squeue.songs = [];
      squeue.dispatcher.end();
    },
};
