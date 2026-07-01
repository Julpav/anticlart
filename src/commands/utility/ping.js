const { SlashCommandBuilder } = require('discord.js');
const { createTextDisplay, createContainer, v2Payload } = require('../../utils/components');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with the bot latency and uptime.'),

    async execute(interaction) {
        const header = createTextDisplay('## 🏓 Pong!');
        const body = createTextDisplay(
            `**Latency:** ${interaction.client.ws.ping}ms\n**Uptime:** ${Math.floor(interaction.client.uptime / 1000)}s`
        );
        const container = createContainer([header, body]);

        await interaction.reply(v2Payload([container], { ephemeral: true }));
    },
};
