const { ActivityType } = require('discord.js');
const db = require('../../utils/db');

let presenceIndex = 0;

function updatePresence(client) {
    const deleted = db.get('messagesDeleted');
    const banned = db.get('bansIssued');

    const activities = [
        { name: `${deleted} Messages deleted`, type: ActivityType.Custom },
        { name: `${banned} Clart bags banned`, type: ActivityType.Custom },
    ];

    client.user.setPresence({
        activities: [activities[presenceIndex]],
        status: 'online',
    });

    presenceIndex = (presenceIndex + 1) % activities.length;
}

module.exports = {
    name: 'ready',
    once: true,
    execute(client) {
        console.log(`✅ Logged in as ${client.user.tag}`);
        console.log(`🛡️  Anti-scam detection active for new users.`);

        updatePresence(client);
        setInterval(() => updatePresence(client), 30_000);
    },
};
