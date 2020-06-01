module.exports = {
    name: 'color',
    description: 'Test if bot is online',
    args: true,
    execute(message, args) {
      if (!message.mentions.roles.size) {
  			return message.reply('you need to mention a role to change color for!');
  		}
  		message.mentions.roles.first().setColor(args[1])
    	.then(updated => console.log(`Set color of role to ${updated.color}`))
    	.catch(console.error);
  		message.channel.send(`Color changed to ${args[1]}`);
    },
};
