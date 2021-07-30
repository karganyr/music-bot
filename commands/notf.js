const bot = require("../bot.js")
const queue = bot.getq();

module.exports = {
    name: 'notf',
    description: 'Toggle notification settings of the bot',
    args: false,
    args_length: 0,
    execute(message, args) {
      const squeue = queue.get(message.guild.id);
      squeue.notf = !squeue.notf;
      if (!squeue.notf) {
        message.channel.send(`Notification settings changed from **ON** to **OFF**`);
      }
      else {
        message.channel.send(`Notification settings changed from **OFF** to **ON**`);
      }
    },
};
