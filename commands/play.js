const ytdl = require("ytdl-core");
const bot = require("../bot.js")
const queue = bot.getq();

async function execute(message, args) {
  var url = args[0];
  var squeue = queue.get(message.guild.id);
  const voiceChannel = message.member.voice.channel;
  if (!voiceChannel) {
    return message.channel.send("You need to be in a voice channel to play music!");
  }

  try {
    const songInfo = await ytdl.getInfo(url);
    const song = {
      title: songInfo.videoDetails.title,
      url: songInfo.videoDetails.video_url,
      length: songInfo.videoDetails.lengthSeconds,
    };

    if (!squeue) {
      const qData = {
        textChannel: message.channel,
        voiceChannel: voiceChannel,
        connection: null,
        dispatcher: null,
        songs: [],
        loopsongs: [],
        volume: 25,
        loop: false,
        loopall: false,
        notf: true,
        playing: true,
      };

      queue.set(message.guild.id, qData);

      qData.songs.push(song);

      try {
        const connection = await message.member.voice.channel.join();
        qData.connection = connection;
        play(message.guild);
      }
      catch (error) {
        console.log(error);
        queue.delete(message.guild.id);
        return message.channel.send(error);
      }
    }
    else {
      squeue.songs.push(song);
      return message.channel.send(`${song.title} has been added to the queue!`);
    }
  }
  catch (error) {
    return message.channel.send("Something went wrong, please try a different link for the song!");
  }
}

async function play(guild) {
  const squeue = queue.get(guild.id);
  const song = squeue.songs[0];
  if (!song) {
    squeue.voiceChannel.leave();
    queue.delete(guild.id);
    return;
  }

  const stream = ytdl(song.url, {filter: 'audioonly', quality: 'highestaudio', highWaterMark: 1<<25 });
  const dispatcher = squeue.connection.play(stream, {highWaterMark: 1});
  squeue.dispatcher = dispatcher;
  dispatcher.setVolumeLogarithmic(squeue.volume / 100);

  if (squeue.notf) {
    dispatcher.on('start', () => {
      const temp = {
        title: 'Now Playing',
        description: `**[${song.title}](${song.url})**`
      };
      squeue.textChannel.send({embed: temp});
    });
  }

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
  // Always remember to handle errors appropriately!
  dispatcher.on('error', console.error);
}

module.exports = {
    name: 'play',
    description: 'Play the song from the YouTube link provided',
    args: true,
    args_length: 1,
    usage: '<valid_youtube_url>',
    execute(message, args) {
      execute(message, args);
    },
    play(guild) {
        play(guild);
    },
};
