module.exports = {
    name: 'color',
    aliases: ['colour'],
    description: 'Test if bot is online',
    args: true,
    execute(message, args) {
      if (!message.mentions.roles.size) {
  			return message.reply('You need to mention a role to change color for!');
  		}
      if (args.length != 2) {
        return message.reply('You need to mention a color to change to!');
      }
  		message.mentions.roles.first().setColor(args[1])
    	.then(updated => console.log(`Set color of role to ${updated.color}`))
    	.catch(console.error);
  		message.channel.send(`Color changed to ${args[1]}`);
    },
};
