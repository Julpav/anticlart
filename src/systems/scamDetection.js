const { Collection } = require('discord.js');
const config = require('../config');
const db = require('../utils/db');

class ScamDetection {
    constructor() {
        /** @type {Collection<string, { joinTime: number, imageCount: number, messageIds: string[], channelIds: string[], hasText: boolean }>} */
        this.trackedUsers = new Collection();
        this.totalBans = 0;

        // Clean up stale entries every 5 minutes
        setInterval(() => this.cleanup(), 5 * 60 * 1000);
    }

    /**
     * Mark a user as newly joined and start tracking them.
     * @param {string} userId
     */
    trackNewUser(userId) {
        this.trackedUsers.set(userId, {
            joinTime: Date.now(),
            imageCount: 0,
            messageIds: [],
            channelIds: [],
            hasText: false,
        });
    }

    /**
     * Remove a user from tracking.
     * @param {string} userId
     */
    untrackUser(userId) {
        this.trackedUsers.delete(userId);
    }

    /**
     * Check if a user is currently tracked as a new user.
     * @param {string} userId
     * @returns {boolean}
     */
    isTracked(userId) {
        return this.trackedUsers.has(userId);
    }

    /**
     * Count the number of image attachments in a message.
     * @param {import('discord.js').Message} message
     * @returns {number}
     */
    countImages(message) {
        if (!message.attachments || message.attachments.size === 0) return 0;

        const imageTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp', 'image/avif'];

        return message.attachments.filter((attachment) => {
            const contentType = attachment.contentType || '';
            const name = attachment.name || '';
            return (
                imageTypes.some((type) => contentType.toLowerCase().startsWith(type)) ||
                /\.(png|jpe?g|gif|webp|avif)$/i.test(name)
            );
        }).size;
    }

    /**
     * Process a message from a potentially new user.
     * Returns true if the user was banned.
     * @param {import('discord.js').Message} message
     * @returns {Promise<boolean>}
     */
    async handleMessage(message) {
        if (message.author.bot) return false;
        if (!message.guild) return false;
        if (!this.isTracked(message.author.id)) return false;

        const userData = this.trackedUsers.get(message.author.id);
        const imageCount = this.countImages(message);

        if (imageCount === 0) {
            userData.hasText = true;
            return false;
        }

        if (userData.hasText) return false;

        userData.imageCount += imageCount;
        userData.messageIds.push(message.id);
        if (!userData.channelIds.includes(message.channelId)) {
            userData.channelIds.push(message.channelId);
        }

        console.log(
            `[ScamDetection] User ${message.author.tag} (${message.author.id}) now has ${userData.imageCount} image(s).`
        );

        if (userData.imageCount >= config.scamDetection.imageThreshold) {
            await this.banUser(message, userData);
            return true;
        }

        return false;
    }

    /**
     * Ban a user for suspected scam image spam.
     * @param {import('discord.js').Message} message
     * @param {*} userData
     */
    async banUser(message, userData) {
        const { member, author, guild } = message;

        try {
            if (config.scamDetection.deleteMessages) {
                await this.deleteTrackedMessages(guild, userData);
            }

            await guild.members.ban(author.id, {
                deleteMessageDays: config.scamDetection.deleteMessageDays,
                reason: config.scamDetection.banReason,
            });

            this.totalBans += 1;
            db.increment('bansIssued');
            db.push('bans', {
                userId: author.id,
                userTag: author.tag,
                guildId: guild.id,
                bannedAt: Date.now(),
                content: message.content,
            });
            this.untrackUser(author.id);

            console.log(
                `[ScamDetection] Banned user ${author.tag} (${author.id}) for scam image spam.`
            );

            await this.logAction(guild, author);
        } catch (error) {
            console.error(
                `[ScamDetection] Failed to ban user ${author.tag} (${author.id}):`,
                error
            );
        }
    }

    /**
     * Delete tracked messages from the offending user.
     * @param {import('discord.js').Guild} guild
     * @param {*} userData
     */
    async deleteTrackedMessages(guild, userData) {
        const deletions = [];

        for (const channelId of userData.channelIds) {
            const channel = guild.channels.cache.get(channelId);
            if (!channel || !channel.isTextBased()) continue;

            for (const messageId of userData.messageIds) {
                deletions.push(
                    channel.messages
                        .delete(messageId)
                        .then(() => db.increment('messagesDeleted'))
                        .catch((err) => console.warn(`[ScamDetection] Could not delete message ${messageId}:`, err.message))
                );
            }
        }

        await Promise.all(deletions);
    }

    /**
     * Send a log message to the configured log channel.
     * @param {import('discord.js').Guild} guild
     * @param {import('discord.js').User} user
     * @param {*} userData
     */
    async logAction(guild, user) {
        if (!config.logChannelId) return;

        const logChannel = guild.client.channels.cache.get(config.logChannelId);
        if (!logChannel || !logChannel.isTextBased()) return;

        const { EmbedBuilder } = require('discord.js');

        const embed = new EmbedBuilder()
            .setTitle('🚫 User Banned')
            .setDescription(`<@${user.id}> was banned for image spam.`)
            .setTimestamp();

        await logChannel.send({ embeds: [embed] }).catch((err) => {
            console.error('[ScamDetection] Failed to send log message:', err);
        });
    }

    /**
     * Remove users who have exceeded the new-user window.
     */
    cleanup() {
        const now = Date.now();
        const expired = [];

        for (const [userId, data] of this.trackedUsers.entries()) {
            if (now - data.joinTime > config.scamDetection.newUserWindowMs) {
                expired.push(userId);
            }
        }

        for (const userId of expired) {
            this.untrackUser(userId);
        }

        if (expired.length > 0) {
            console.log(`[ScamDetection] Cleaned up ${expired.length} expired tracked user(s).`);
        }
    }

    /**
     * Get current detection statistics.
     */
    getStats() {
        return {
            trackedUsers: this.trackedUsers.size,
            totalBans: this.totalBans,
        };
    }

    /**
     * Reset all tracked users and counters.
     */
    reset() {
        this.trackedUsers.clear();
        this.totalBans = 0;
    }
}

module.exports = new ScamDetection();
