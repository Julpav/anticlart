const scamDetection = require('../../systems/scamDetection');

module.exports = {
    name: 'guildMemberAdd',
    once: false,
    execute(member) {
        // Ignore bots
        if (member.user.bot) return;

        scamDetection.trackNewUser(member.id);
        console.log(`[GuildMemberAdd] Tracking new user ${member.user.tag} (${member.id})`);
    },
};
