const bot = require("../bot.js")
const queue = bot.getq();

module.exports = {
    name: 'vol',
    description: 'Change the volume of the music being played between 1 and 200',
    args: true,
    args_length: 1,
    usage: '<valid_volume_number>',
    execute(message, args) {
      const squeue = queue.get(message.guild.id);
      if (args.length > 1) {
        return message.channel.send("Please only input the command and a value");
      }
      var volume = parseInt(args[0]);
      if (!message.member.voice.channel) {
        return message.channel.send("You have to be in a voice channel to change volume!");
      }
      if (!squeue) {
        return message.channel.send("There is no music to change volume for!");
      }
      if (isNaN(volume)) {
        return message.channel.send("Please provide a valid number");
      }
      if (volume < 1 || volume > 200) {
        return message.channel.send("Value of volume should be between 1 and 200");
      }
      squeue.volume = volume;
      squeue.connection.dispatcher.setVolumeLogarithmic(squeue.volume / 100);
      message.channel.send(`Volume set to ${squeue.volume}`);
    },
};
