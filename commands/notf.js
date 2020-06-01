const bot = require("../bot.js")
const queue = bot.getq();

module.exports = {
    name: 'notf',
    description: 'Test if bot is online',
    args: false,
    execute(message, args) {
      const squeue = queue.get(message.guild.id);
      squeue.notf = !squeue.notf;
      message.channel.send(`Notification settings changed from ${!squeue.notf} to ${squeue.notf}`);
    },
};
