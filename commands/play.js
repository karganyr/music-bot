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
  const songInfo = await ytdl.getInfo(url);
  const song = {
    title: songInfo.videoDetails.title,
    url: songInfo.videoDetails.video_url,
  };

  if (!squeue) {
    const qData = {
      textChannel: message.channel,
      voiceChannel: voiceChannel,
      connection: null,
      dispatcher: null,
      songs: [],
      loopsongs: [],
      volume: 100,
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

async function play(guild) {
  const squeue = queue.get(guild.id);
  const song = squeue.songs[0];

  if (!song) {
    squeue.voiceChannel.leave();
    queue.delete(guild.id);
    return;
  }
  const dispatcher = squeue.connection.play(ytdl(song.url,{filter: 'audioonly', quality: 'highestaudio', highWaterMark: 1<<25 }), {highWaterMark: 1});
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
    description: 'Test if bot is online',
    args: true,
    execute(message, args) {
      execute(message, args);
    },
};
