const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ContainerBuilder,
    EmbedBuilder,
    MessageFlags,
    SectionBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    TextDisplayBuilder,
} = require('discord.js');

// Must be sent on every message that contains Components v2 components.
const V2_FLAGS = Number(MessageFlags.IsComponentsV2);
const V2_EPHEMERAL = V2_FLAGS | Number(MessageFlags.Ephemeral);

// ============================================================================
// v1 Helpers (ActionRows + Buttons + Selects)
// ============================================================================

function createActionRow(components) {
    return new ActionRowBuilder().addComponents(...components);
}

function createPrimaryButton(customId, label) {
    return new ButtonBuilder()
        .setCustomId(customId)
        .setLabel(label)
        .setStyle(ButtonStyle.Primary);
}

function createSecondaryButton(customId, label) {
    return new ButtonBuilder()
        .setCustomId(customId)
        .setLabel(label)
        .setStyle(ButtonStyle.Secondary);
}

function createSuccessButton(customId, label) {
    return new ButtonBuilder()
        .setCustomId(customId)
        .setLabel(label)
        .setStyle(ButtonStyle.Success);
}

function createDangerButton(customId, label) {
    return new ButtonBuilder()
        .setCustomId(customId)
        .setLabel(label)
        .setStyle(ButtonStyle.Danger);
}

function createLinkButton(label, url) {
    return new ButtonBuilder().setLabel(label).setURL(url).setStyle(ButtonStyle.Link);
}

// ============================================================================
// Components v2 Helpers
// ============================================================================

/**
 * Create a Text Display component (Components v2).
 * @param {string} content
 */
function createTextDisplay(content) {
    return new TextDisplayBuilder().setContent(content);
}

/**
 * Create a Section component (Components v2).
 * A Section holds text displays and ONE accessory (button or thumbnail).
 * @param {TextDisplayBuilder|TextDisplayBuilder[]} textDisplays
 * @param {ButtonBuilder} [buttonAccessory]
 */
function createSection(textDisplays, buttonAccessory = null) {
    const displays = Array.isArray(textDisplays) ? textDisplays : [textDisplays];
    const section = new SectionBuilder().addTextDisplayComponents(...displays);

    if (buttonAccessory) {
        section.setButtonAccessory(buttonAccessory);
    }

    return section;
}

/**
 * Create a Container component (Components v2).
 * A Container can hold text displays, sections, separators, media galleries, files, and action rows.
 * @param {Array} components
 * @param {number|null} [accentColor]
 */
function createContainer(textDisplays, accentColor = null) {
    const displays = Array.isArray(textDisplays) ? textDisplays : [textDisplays];
    const container = new ContainerBuilder().addTextDisplayComponents(...displays);
    if (accentColor !== null) {
        container.setAccentColor(accentColor);
    }
    return container;
}

/**
 * Create a Separator component (Components v2).
 * @param {boolean} [divider]
 * @param {number} [spacing]
 */
function createSeparator(divider = true, spacing = SeparatorSpacingSize.Small) {
    return new SeparatorBuilder()
        .setDivider(divider)
        .setSpacing(spacing);
}

// ============================================================================
// Common convenience builders
// ============================================================================

/**
 * Create a Components v2 message payload with a header TextDisplay,
 * optional body TextDisplay, and an optional button accessory in a Section.
 * @param {string} header
 * @param {string} [body]
 * @param {ButtonBuilder} [button]
 */
function createV2Message(header, body = null, button = null) {
    const textDisplays = [createTextDisplay(header)];
    if (body) {
        textDisplays.push(createTextDisplay(body));
    }

    if (button) {
        return createSection(textDisplays, button);
    }

    return createContainer(textDisplays);
}

/**
 * Wrap Components v2 components in a message payload with the required IsComponentsV2 flag.
 * @param {Array} components
 * @param {object} [extra]  Extra fields (ephemeral, content, etc.)
 */
function v2Payload(components, extra = {}) {
    let flags = extra.ephemeral ? V2_EPHEMERAL : V2_FLAGS;
    const { ephemeral, ...rest } = extra;
    return {
        ...rest,
        components,
        flags,
    };
}

// ============================================================================
// Embed Helpers (still valid for normal channel messages / logs)
// ============================================================================

function createBaseEmbed(title, description) {
    return new EmbedBuilder()
        .setTitle(title)
        .setDescription(description)
        .setTimestamp();
}

function createSuccessEmbed(title, description) {
    return createBaseEmbed(title, description);
}

function createErrorEmbed(title, description) {
    return createBaseEmbed(title, description);
}

function createInfoEmbed(title, description) {
    return createBaseEmbed(title, description);
}

function createWarningEmbed(title, description) {
    return createBaseEmbed(title, description);
}

module.exports = {
    V2_FLAGS,
    V2_EPHEMERAL,

    // v1
    createActionRow,
    createPrimaryButton,
    createSecondaryButton,
    createSuccessButton,
    createDangerButton,
    createLinkButton,

    // v2
    createTextDisplay,
    createSection,
    createContainer,
    createSeparator,
    createV2Message,
    v2Payload,

    // Embeds
    createBaseEmbed,
    createSuccessEmbed,
    createErrorEmbed,
    createInfoEmbed,
    createWarningEmbed,
};
