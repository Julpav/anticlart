const { ActivityType } = require('discord.js');

module.exports = {
    name: 'ready',
    once: true,
    execute(client) {
        console.log(`✅ Logged in as ${client.user.tag}`);
        console.log(`🛡️  Anti-scam detection active for new users.`);

        client.user.setPresence({
            activities: [{ name: 'for scam messages', type: ActivityType.Watching }],
            status: 'online',
        });
    },
};
