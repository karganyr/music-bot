module.exports = {
    name: 'loopall',
    description: 'Test if bot is online',
    args: false,
    queue: true,
    execute(message, args, queue) {
      const squeue = queue.get(message.guild.id);
      if (!message.member.voice.channel) {
        return message.channel.send("You have to be in a voice channel to loop the music!");
      }
      if (!squeue) {
        return message.channel.send("There is no music to be looped!");
      }
      squeue.loopall = !squeue.loopall;
      if (squeue.loop) {
        squeue.loop = !squeue.loop;
      }
    },
};
