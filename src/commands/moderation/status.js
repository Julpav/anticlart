const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { createTextDisplay, createContainer, v2Payload } = require('../../utils/components');
const scamDetection = require('../../systems/scamDetection');
const db = require('../../utils/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('status')
        .setDescription('Show the current anti-scam detection status.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

    async execute(interaction) {
        const stats = scamDetection.getStats();

        const header = createTextDisplay('## 🛡️ Anti-Scam Status');
        const body = createTextDisplay(
            `**Tracked Users:** ${stats.trackedUsers}\n` +
            `**Session Bans:** ${stats.totalBans}\n` +
            `**All-Time Bans:** ${db.get('bansIssued')}\n` +
            `**Messages Deleted:** ${db.get('messagesDeleted')}\n` +
            `**Commands Run:** ${db.get('commandsRun')}`
        );
        const container = createContainer([header, body]);

        await interaction.reply(v2Payload([container], { ephemeral: true }));
    },
};
