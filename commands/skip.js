const bot = require("../bot.js")
const queue = bot.getq();

module.exports = {
    name: 'skip',
    description: 'Skips the current song and moves to the next',
    args: false,
    args_length: 0,
    execute(message, args) {
      const squeue = queue.get(message.guild.id);
      if (!message.member.voice.channel) {
        return message.channel.send("You have to be in a voice channel to skip the music!");
      }
      if (!squeue) {
        return message.channel.send("There is no music to be skipped!");
      }
      squeue.dispatcher.end();
    },
};
