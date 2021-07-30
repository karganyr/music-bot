module.exports = {
    name: 'test',
    description: 'Test if bot is online',
    args: false,
    args_length: 0,
    execute(message, args) {
      message.channel.send('We live baby, YEAH!');
    },
};
