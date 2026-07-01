require('dotenv').config();

module.exports = {
    token: process.env.DISCORD_TOKEN,
    clientId: process.env.CLIENT_ID,
    guildId: process.env.GUILD_ID || null,
    logChannelId: process.env.LOG_CHANNEL_ID || null,

    // Anti-scam detection settings
    scamDetection: {
        // How long after joining a user is considered "new" (in milliseconds)
        // Default: 24 hours
        newUserWindowMs: 24 * 60 * 60 * 1000,

        // Number of image attachments that triggers a ban
        imageThreshold: 2,

        // Ban reason shown in audit logs
        banReason: 'Automatic ban: suspected scam image spam',

        // Whether to delete the offending message(s)
        deleteMessages: true,

        // How many days of messages to delete when banning (0-7)
        deleteMessageDays: 1,
    },
};
