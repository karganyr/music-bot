const ytdl = require("ytdl-core");
const bot = require("../bot.js");
const { play } = require("./play.js");
const queue = bot.getq();

module.exports = {
    name: 'seek',
    description: 'Skip to the specified time in the video',
    args: true,
    args_length: 1,
    usage: '<seconds>, <minutes:seconds>',
    async execute(message, args) {
      const squeue = queue.get(message.guild.id);
      const song = squeue.songs[0];
      const guild = message.guild;
      let issec = /^\d+$/.test(args[0]);
      let istime = /^\d+:[0-5][0-9]+$/.test(args[0]);
      var sec;
      if (!(issec || istime)) {
        return message.channel.send("Your seek time is invalid!");
      }
      if (!squeue) {
        return message.channel.send("There is no music to be resumed!");
      }
      if (istime) {
        var times = args[0].split(':');
        sec = Number(times[1]) + (Number(times[0]) * 60);
      }
      else {
        sec = Number(args[0]);
      }
      if (song.length <= sec) {
        return message.channel.send("Your seek time is greater than the length of the video!");
      }
      const stream = ytdl(song.url, {filter: 'audioonly', quality: 'highestaudio', highWaterMark: 1<<25 });
      const dispatcher = squeue.connection.play(stream, {seek: sec, highWaterMark: 1});
      squeue.dispatcher = dispatcher;
      dispatcher.setVolumeLogarithmic(squeue.volume / 100);

      dispatcher.on('finish', () => {
    	   if (squeue.loop) {
           play(guild);
         }
         else if (squeue.loopall) {
           squeue.loopsongs.push(song);
           squeue.songs.shift();
           if (squeue.songs.length == 0 && squeue.playing) {
             squeue.songs = Array.from(squeue.loopsongs);
             squeue.loopsongs = [];
           }
           play(guild);
         }
         else {
           squeue.loopsongs.push(song);
           squeue.songs.shift();
           play(guild);
         }
      });

      if (issec) {
        return message.channel.send(`Skipped to **${args[0]}** seconds in the song`);
      }
      else {
        return message.channel.send(`Skipped to **${args[0]}** in the song`);
      }
    },
};
