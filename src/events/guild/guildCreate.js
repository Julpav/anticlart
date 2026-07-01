const { EmbedBuilder } = require('discord.js');
const config = require('../../config');

module.exports = {
    name: 'guildCreate',
    once: false,
    async execute(guild) {
        console.log(`[GuildCreate] Joined server ${guild.name} (${guild.id})`);

        if (!config.logChannelId) return;

        const logChannel = guild.client.channels.cache.get(config.logChannelId);
        if (!logChannel || !logChannel.isTextBased()) return;

        const embed = new EmbedBuilder()
            .setTitle('✅ Joined Server')
            .setDescription(`**${guild.name}** (${guild.id})\nMembers: ${guild.memberCount}`)
            .setTimestamp();

        await logChannel.send({ embeds: [embed] }).catch((err) => {
            console.error('[GuildCreate] Failed to send log message:', err);
        });
    },
};
