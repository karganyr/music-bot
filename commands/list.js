const bot = require("../bot.js")
const queue = bot.getq();

module.exports = {
    name: 'list',
    aliases: ['queue', 'playlist'],
    description: 'Returns a list of songs currently in the queue, capped at 10 songs',
    args: false,
    args_length: 0,
    execute(message, args) {
      const squeue = queue.get(message.guild.id);
      if (!squeue) {
        return message.channel.send("There is no music playing!");
      }
      const nlist = {
        title: "**Next Up**",
        fields: [],
        footer: {
          text: `Volume: ${squeue.volume} | Loop: ${squeue.loop} | Loop playlist: ${squeue.loopall}`,
        },
      };
      var n = 0
      if (squeue.loopall) {n = squeue.songs.length + squeue.loopsongs.length - 1;}
      else {n = squeue.songs.length - 1;}
      if (n == 0) return message.channel.send("There are no songs in the queue!");
      if (n > 10) n = 10;
      for (i = 1; i < n + 1; i++) {
        if (i >= squeue.songs.length) {
          nlist.fields.push(
            {
              name: `**${squeue.loopsongs[i - squeue.songs.length].title}**`,
              value: `${squeue.loopsongs[i - squeue.songs.length].url}`,
            },
          );
        }
        else {
          nlist.fields.push(
            {
              name: `**${squeue.songs[i].title}**`,
              value: `${squeue.songs[i].url}`,
            },
          );
        }
      }
      message.channel.send({embed: nlist});
    },
};
