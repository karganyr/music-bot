//https://gabrieltanner.org/blog/dicord-music-bot
const Discord = require("discord.js");
const { prefix, token } = require("./config.json");
const ytdl = require("ytdl-core");

const client = new Discord.Client();

const queue = new Map();

client.once("ready", () => {
  console.log("Ready!");
});

client.once("reconnecting", () => {
  console.log("Reconnecting!");
});

client.once("disconnect", () => {
  console.log("Disconnect!");
});

client.on("message", async message => {
  if (message.author.bot) return;
  if (!message.content.startsWith(prefix)) return;

  const serverQueue = queue.get(message.guild.id);

  if (message.content.startsWith(`${prefix}play`)) {
    execute(message, serverQueue);
    return;
  }
  else if (message.content.startsWith(`${prefix}skip`)) {
    skip(message, serverQueue);
    return;
  }
  else if (message.content.startsWith(`${prefix}stop`)) {
    stop(message, serverQueue);
    return;
  }
  else if (message.content.startsWith(`${prefix}list`)) {
    list(message, serverQueue);
    return;
  }
  else if (message.content.startsWith(`${prefix}pause`)) {
    pause(message, serverQueue);
    return;
  }
  else if (message.content.startsWith(`${prefix}resume`)) {
    resume(message, serverQueue);
    return;
  }
  else if (message.content === `${prefix}loop`) {
    loop(message, serverQueue);
    return;
  }
  else if (message.content.startsWith(`${prefix}loopall`)) {
    loopall(message, serverQueue);
    return;
  }
  else if (message.content.startsWith(`${prefix}vol`)) {
    vol(message, serverQueue);
    return;
  }
  else if (message.content.startsWith(`${prefix}test`)) {
    message.channel.send("We live baby, YEAH!");
  }
  else {
    message.channel.send("You need to enter a valid command!");
  }
});

async function execute(message, serverQueue) {
  const args = message.content.split(/ +/);

  const voiceChannel = message.member.voice.channel;
  if (!voiceChannel)
    return message.channel.send(
      "You need to be in a voice channel to play music!"
    );
  const permissions = voiceChannel.permissionsFor(message.client.user);
  if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
    return message.channel.send(
      "I need the permissions to join and speak in your voice channel!"
    );
  }

  const songInfo = await ytdl.getInfo(args[1]);
  const song = {
    title: songInfo.title,
    url: songInfo.video_url
  };

  if (!serverQueue) {
    const queueContruct = {
      textChannel: message.channel,
      voiceChannel: voiceChannel,
      connection: null,
      songs: [],
      volume: 100,
      loop: false,
      loopall: false,
      playing: true
    };

    queue.set(message.guild.id, queueContruct);

    queueContruct.songs.push(song);

    try {
      var connection = await voiceChannel.join();
      queueContruct.connection = connection;
      play(message.guild, queueContruct.songs[0]);
    } catch (err) {
      console.log(err);
      queue.delete(message.guild.id);
      return message.channel.send(err);
    }
  } else {
    serverQueue.songs.push(song);
    return message.channel.send(`${song.title} has been added to the queue!`);
  }
}

function skip(message, serverQueue) {
  if (!message.member.voice.channel)
    return message.channel.send(
      "You have to be in a voice channel to stop the music!"
    );
  if (!serverQueue)
    return message.channel.send("There is no song that I could skip!");
  serverQueue.connection.dispatcher.end();
}

function stop(message, serverQueue) {
  if (!message.member.voice.channel)
    return message.channel.send(
      "You have to be in a voice channel to stop the music!"
    );
  if (!serverQueue)
    return message.channel.send(
      "There is no music to be stopped!"
    );
  serverQueue.songs = [];
  serverQueue.connection.dispatcher.end();
}

function list(message, serverQueue) {
  if (!serverQueue || serverQueue.songs.length == 1)
    return message.channel.send(
      "There are no songs in the queue!"
    );
  var n;
  if (serverQueue.songs.length < 6) {
    n = serverQueue.songs.length;
  }
  else {
    n = 6;
  }
  if (n == 2) {
    message.channel.send(`There is ${serverQueue.songs.length - 1} song in the queue\n`);
    message.channel.send(`The upcoming song is:\n`);
  }
  else {
    message.channel.send(`There are ${serverQueue.songs.length - 1} songs in the queue\n`);
    message.channel.send(`The upcoming ${n - 1} songs are:\n`);
  }
  for (i = 1; i < n; i++) {
    message.channel.send(`${serverQueue.songs[i].url}\n`);
  }
}

function pause(message, serverQueue) {
  if (!message.member.voice.channel)
    return message.channel.send(
      "You have to be in a voice channel to pause the music!"
    );
  if (!serverQueue)
    return message.channel.send(
      "There is no music to be paused!"
    );
  serverQueue.connection.dispatcher.pause();
  message.channel.send("Playback paused");
}

function resume(message, serverQueue) {
  if (!message.member.voice.channel)
    return message.channel.send(
      "You have to be in a voice channel to resume the music!"
    );
  if (!serverQueue)
    return message.channel.send(
      "There is no music to be resumed!"
    );
  serverQueue.connection.dispatcher.resume();
  message.channel.send("Playback resumed");
}

function loop(message, serverQueue) {
  if (!message.member.voice.channel)
    return message.channel.send(
      "You have to be in a voice channel to loop the track!"
    );
  if (!serverQueue)
    return message.channel.send(
      "There is no track to loop!"
    );
  if (serverQueue.loop) {
    serverQueue.loop = false;
    message.channel.send("Looping turned off");
  }
  else {
    serverQueue.loop = true;
    serverQueue.loopall = false;
    message.channel.send("The current track is now being looped!");
  }
}

function loopall(message, serverQueue) {
  if (!message.member.voice.channel)
    return message.channel.send(
      "You have to be in a voice channel to loop the playlist!"
    );
  if (!serverQueue)
    return message.channel.send(
      "There is no playlist to loop!"
    );
  if (serverQueue.loopall) {
    serverQueue.loopall = false;
    message.channel.send("Looping turned off");
  }
  else {
    serverQueue.loop = false;
    serverQueue.loopall = true;
    message.channel.send("The current playlist is now being looped!");
  }
}

function vol(message, serverQueue) {
  const args = message.content.split(/ +/);
  if (args.length == 1)
    return message.channel.send(
      `The current volume is ${serverQueue.volume}`
    );
  if (args.length > 2)
    return message.channel.send(
      "Please only input the command and a value"
    );
  var volume = parseInt(args[1]);
  if (!message.member.voice.channel)
    return message.channel.send(
      "You have to be in a voice channel to change volume!"
    );
  if (!serverQueue)
    return message.channel.send(
      "There is no music to change volume for!"
    );
  if (isNaN(volume))
    return message.channel.send(
      "Please provide a valid number"
    );
  if (volume < 1 || volume > 200)
    return message.channel.send(
      "Value of volume should be between 0 and 200"
    );
  serverQueue.volume = volume;
  dispatcher.setVolumeLogarithmic(serverQueue.volume / 100);
  message.channel.send(`Volume set to ${serverQueue.volume}`);
}

function play(guild, song) {
  const serverQueue = queue.get(guild.id);
  if (!song) {
    serverQueue.voiceChannel.leave();
    queue.delete(guild.id);
    return;
  }
  const dispatcher = serverQueue.connection
    .play(ytdl(song.url))
    .on("finish", () => {
      if (serverQueue.loop) {
        play(guild, serverQueue.songs[0]);
      }
      else if (serverQueue.loopall) {
        serverQueue.songs.push(song);
        serverQueue.songs.shift();
        play(guild, serverQueue.songs[0]);
      }
      else {
        serverQueue.songs.shift();
        play(guild, serverQueue.songs[0]);
      }
    })
    .on("error", error => console.error(error));
  dispatcher.setVolumeLogarithmic(serverQueue.volume / 100);
  serverQueue.textChannel.send(`Start playing: **${song.title}**`);
}

client.login(token);
