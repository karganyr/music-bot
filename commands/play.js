const ytdl = require("ytdl-core-discord");

async function play(message, args) {
  if (!message.member.voice.channel) {
    return message.channel.send('You need to be in a voice channel to play!');
  }
  const connection = await message.member.voice.channel.join();
  const dispatcher = connection.play(await ytdl(args[0]), {type: 'opus', highWaterMark: 50});

  dispatcher.on('start', () => {
	   console.log('audio.mp3 is now playing!');
  });

  dispatcher.on('finish', () => {
	   console.log('audio.mp3 has finished playing!');
     connection.disconnect();
  });

  // Always remember to handle errors appropriately!
  dispatcher.on('error', console.error);
}

module.exports = {
    name: 'play',
    description: 'Test if bot is online',
    args: true,
    queue: true,
    execute(message, args) {
      play(message, args);
    },
};
