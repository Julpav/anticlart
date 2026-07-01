const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../../utils/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('revert')
        .setDescription('Unban a user who was banned by the anti-scam system.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option =>
            option.setName('user_id')
                .setDescription('The ID of the user to unban')
                .setRequired(true)),

    async execute(interaction) {
        const userId = interaction.options.getString('user_id');
        const guild = interaction.guild;

        const bans = db.getArray('bans');
        const banRecord = bans.find(b => b.userId === userId && b.guildId === guild.id);

        if (!banRecord) {
            await interaction.reply({
                content: 'No ban record found for that user in this server.',
                ephemeral: true,
            });
            return;
        }

        try {
            await guild.members.unban(userId, `Reverted by ${interaction.user.tag}`);

            db.remove('bans', b => b.userId === userId && b.guildId === guild.id);

            await interaction.reply({
                content: `✅ Unbanned \`${banRecord.userTag}\` (${userId})`,
                ephemeral: true,
            });
        } catch (error) {
            await interaction.reply({
                content: `Failed to unban: ${error.message}`,
                ephemeral: true,
            });
        }
    },
};