//https://gabrieltanner.org/blog/dicord-music-bot
const fs = require("fs");
const Discord = require("discord.js");
const prefix = "!";
const token = process.env.BOT_TOKEN;

const client = new Discord.Client();
client.commands = new Discord.Collection();
const queue = new Discord.Collection();

const getq = () => {
  return queue;
};

exports.getq = getq;

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}

client.once('ready', () => {
  console.log('Ready!');
});

client.on('message', message => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const args = message.content.slice(prefix.length).split(/ +/);
  const commandName = args.shift().toLowerCase();

  const command = client.commands.get(commandName)
		|| client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

  if (!command) return;

  if (command.args && !args.length) {
    return message.channel.send(`You didn't provide any arguments ${message.author}!`);
  }

  try {
    command.execute(message, args);
  }
  catch (error) {
    console.error(error);
    message.reply('There was an error trying to execute that command!');
  }
});

client.login(token);
