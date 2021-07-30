const bot = require("../bot.js")
const queue = bot.getq();

module.exports = {
    name: 'loopall',
    description: 'Toggle looping of the playlist',
    args: false,
    args_length: 0, 
    execute(message, args) {
      const squeue = queue.get(message.guild.id);
      if (!message.member.voice.channel) {
        return message.channel.send("You have to be in a voice channel to loop the music!");
      }
      if (!squeue) {
        return message.channel.send("There is no music to be looped!");
      }
      squeue.loopall = !squeue.loopall;
      if (squeue.loop) {
        squeue.loop = !squeue.loop;
      }
      message.channel.send("Current playlist is now being looped!");
    },
};
