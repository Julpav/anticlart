const { SlashCommandBuilder, PermissionFlagsBits, ThumbnailBuilder, MediaGalleryBuilder, MediaGalleryItemBuilder } = require('discord.js');
const { createTextDisplay, createSection, createContainer, createLinkButton, createActionRow, createSeparator, v2Payload } = require('../../utils/components');
const scamDetection = require('../../systems/scamDetection');
const db = require('../../utils/db');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('status')
        .setDescription('Show the current anti-scam detection status.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

    async execute(interaction) {
        const stats = scamDetection.getStats();

        const thumbnail = new ThumbnailBuilder().setURL('attachment://anticlart.png');
        const header = createTextDisplay('## AntiClart');
        const body = createTextDisplay(
            `**Tracked Users:** ${stats.trackedUsers}\n` +
            `**Session Bans:** ${stats.totalBans}\n` +
            `**All-Time Bans:** ${db.get('bansIssued')}\n` +
            `**Messages Deleted:** ${db.get('messagesDeleted')}\n` +
            `**Commands Run:** ${db.get('commandsRun')}`
        );
        const section = createSection([header, body], thumbnail);

        const sourceBtn = createLinkButton('Source Code', 'https://github.com/Julpav/anticlart');
        const creatorBtn = createLinkButton('Creator', 'https://discord.gg/julian');
        const row = createActionRow([sourceBtn, creatorBtn]);

        const divider = createSeparator();

        const bannerItem = new MediaGalleryItemBuilder().setURL('attachment://anticlartbanner.png');
        const banner = new MediaGalleryBuilder().addItems(bannerItem);

        const container = createContainer([section, divider, row, banner]);

        await interaction.reply({
            ...v2Payload([container], { ephemeral: true }),
            files: [
                path.join(__dirname, '..', '..', 'anticlart.png'),
                path.join(__dirname, '..', '..', 'anticlartbanner.png'),
            ],
        });
    },
};
