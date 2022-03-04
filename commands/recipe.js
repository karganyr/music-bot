module.exports = {
    name: 'recipe',
    description: 'Get random recipe from discord by sending a eicar malware test file',
    args: false,
    args_length: 0,
    execute(message, args) {
        message.channel.send({
            files: ['https://secure.eicar.org/eicar.com.txt']
        })
        .catch(console.error);
    },
};
