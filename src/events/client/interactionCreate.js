const { MessageFlags } = require('discord.js');
const { createErrorEmbed } = require('../../utils/components');
const db = require('../../utils/db');

module.exports = {
    name: 'interactionCreate',
    once: false,
    async execute(interaction) {
        if (interaction.isChatInputCommand()) {
            const command = interaction.client.commands.get(interaction.commandName);
            if (!command) return;

            db.increment('commandsRun');

            try {
                await command.execute(interaction);
            } catch (error) {
                console.error(`[InteractionCreate] Error executing command ${interaction.commandName}:`, error);

                const embed = createErrorEmbed('Error', 'There was an error executing this command.');
                const payload = { embeds: [embed], flags: Number(MessageFlags.Ephemeral) };

                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp(payload);
                } else {
                    await interaction.reply(payload);
                }
            }
        }
    },
};
