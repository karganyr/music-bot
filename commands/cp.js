const bot = require("../bot.js")
const queue = bot.getq();

module.exports = {
    name: 'cp',
    aliases: ['now', 'current', 'playing'],
    description: 'Returns the details of the current song being played',
    args: false,
    args_length: 0,
    execute(message, args) {
      const squeue = queue.get(message.guild.id);
      if (!squeue) {
        return message.channel.send("There is no music playing!");
      }
      const nlist = {
        title: "**Currently Playing**",
        fields: [
          {
            name: `**${squeue.songs[0].title}**`,
            value: `${squeue.songs[0].url}`,
          },
        ],
        footer: {
          text: `Volume: ${squeue.volume} | Loop: ${squeue.loop} | Loop playlist: ${squeue.loopall}`,
        },
      };
      message.channel.send({embed: nlist});
    },
};
