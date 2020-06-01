const bot = require("../bot.js")
const queue = bot.getq();

module.exports = {
    name: 'remove',
    description: 'Test if bot is online',
    args: true,
    queue: true,
    execute(message, args) {
      const squeue = queue.get(message.guild.id);
      if (!squeue) {
        return message.channel.send("There is no song to remove from the playlist!");
      }
      var rm = parseInt(args[0]);
      if (rm > squeue.songs.length) {
        return message.channel.send("Please provide a valid number for the song to be removed!");
      }
      var song = squeue.songs[rm];
      squeue.songs = squeue.songs.splice(rm, 1);
      message.channel.send(`${song.title} has been removed from the playlist!`);
    },
};
