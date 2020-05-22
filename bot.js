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
  else if (message.content.startsWith(`${prefix}cp`)) {
    cp(message, serverQueue);
    return;
  }
  else if (message.content.startsWith(`${prefix}remove`)) {
    remove(message, serverQueue);
    return;
  }
  else if (message.content.startsWith(`${prefix}notf`)) {
    notf(message, serverQueue);
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
  if (args.length < 2) {
    return message.channel.send(
      "No link to song detected!"
    );
  }
  if (args[1].startsWith('https')) {
    args[1] = args[1].replace("https:", "http:");
  }
  const songInfo = await ytdl.getInfo(args[1]);
  console.log(typeof songInfo.video_url);
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
      loopsongs: [],
      volume: 100,
      loop: false,
      loopall: false,
      notf: true,
      playing: true
    };

    if(args.includes('-loop')) {
      queueContruct.loopall = false;
      queueContruct.loop = true;
    }

    if(args.includes('-loopall')) {
      queueContruct.loop = false;
      queueContruct.loopall = true;
    }

    if (args.includes('-notf')) {
      queueContruct.notf = false;
    }

    queue.set(message.guild.id, queueContruct);

    queueContruct.songs.push(song);

    try {
      var connection = await voiceChannel.join();
      queueContruct.connection = connection;
      play(message.guild, queueContruct.songs[0]);
    }
    catch (err) {
      console.log(err);
      queue.delete(message.guild.id);
      return message.channel.send(err);
    }
  }
  else {
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
  serverQueue.playing = false;
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
    message.channel.send(`${serverQueue.songs[i].title}\n`);
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
  serverQueue.connection.dispatcher.setVolumeLogarithmic(serverQueue.volume / 100);
  message.channel.send(`Volume set to ${serverQueue.volume}`);
}

function cp(message, serverQueue) {
  if (!serverQueue)
    return message.channel.send(
      "There is no song currently playing!"
    );
  message.channel.send(`Currently playing: ${serverQueue.songs[0].title}\nVolume: ${serverQueue.volume}`);
  if (serverQueue.loop) {
    message.channel.send(`Looping track`);
  }
  else if (serverQueue.loopall) {
    message.channel.send(`Looping playlist`);
  }
  else {
    message.channel.send(`Looping off`);
  }
}

function remove(message, serverQueue) {
  if (!serverQueue)
    return message.channel.send(
      "There is no song to remove from the playlist!"
    );
  const args = message.content.split(/ +/);
  if (args.length == 1) {
    return message.channel.send(
      "Please specify the song to remove from the playlist!"
    );
  }
  var rm = parseInt(args[1]);
  if (rm > serverQueue.songs.length) {
    return message.channel.send(
      "Please provide a valid number for the song to be removed!"
    );
  }
  var song = serverQueue.songs[rm];
  serverQueue.songs = serverQueue.songs.splice(rm, 1);
  message.channel.send(
    `${song.title} has been removed from the playlist!`
  );
}

function notf(message, serverQueue) {
  serverQueue.notf = !serverQueue.notf;
  message.channel.send(`Notification settings changed from ${!serverQueue.notf} to ${serverQueue.notf}`);
}

function play(guild, song) {
  const serverQueue = queue.get(guild.id);
  if (!song) {
    serverQueue.voiceChannel.leave();
    queue.delete(guild.id);
    return;
  }
  try{
    const dispatcher = serverQueue.connection
    .play(ytdl(song.url))
    .on("finish", () => {
      if (serverQueue.loop) {
        play(guild, serverQueue.songs[0]);
      }
      else if (serverQueue.loopall) {
        serverQueue.loopsongs.push(song);
        serverQueue.songs.shift();
        if (serverQueue.songs.length == 0 && serverQueue.playing) {
          serverQueue.songs = Array.from(serverQueue.loopsongs);
          serverQueue.loopsongs = [];
        }
        play(guild, serverQueue.songs[0]);
      }
      else {
        serverQueue.loopsongs.push(song);
        serverQueue.songs.shift();
        play(guild, serverQueue.songs[0]);
      }
    })
    .on("error", error => console.error(error));
    dispatcher.setVolumeLogarithmic(serverQueue.volume / 100);
    if (serverQueue.notf) {
      serverQueue.textChannel.send(`Start playing: **${song.title}**`);
    }
  }
  catch {
    console.log(typeof song.url);
  }
}

client.login(token);
