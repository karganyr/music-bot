module.exports = {
    name: 'test',
    description: 'Test if bot is online',
    execute(message, args) {
      message.channel.send('We live baby, YEAH!');
    },
};
