const scamDetection = require('../../systems/scamDetection');

module.exports = {
    name: 'messageCreate',
    once: false,
    async execute(message) {
        await scamDetection.handleMessage(message);
    },
};
