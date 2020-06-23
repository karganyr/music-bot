const bot = require("../bot.js")
const queue = bot.getq();

module.exports = {
    name: 'loop',
    description: 'Test if bot is online',
    args: false,
    execute(message, args) {
      const squeue = queue.get(message.guild.id);
      if (!message.member.voice.channel) {
        return message.channel.send("You have to be in a voice channel to loop the music!");
      }
      if (!squeue) {
        return message.channel.send("There is no music to be looped!");
      }
      squeue.loop = !squeue.loop;
      if (squeue.loopall) {
        squeue.loopall = !squeue.loopall;
      }
      message.channel.send("Current song is now being looped!");
    },
};
