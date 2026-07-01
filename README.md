# AntiClart Discord Bot

A Discord.js bot with a modular command/event structure, Discord Components v2 support, and an automatic anti-scam image spam detection system.

## Features

- **Modular Commands & Events** — commands and events are auto-loaded from organized subfolders.
- **Slash Commands** — built with Discord.js v14 builders.
- **Components v2** — reusable buttons, embeds, and action rows.
- **Anti-Scam Detection** — automatically bans newly joined users who send 2+ image attachments.

## Project Structure

```
anticlart/
├── .env.example
├── .gitignore
├── package.json
├── README.md
└── src/
    ├── index.js              # Bot entry point
    ├── config.js             # Configuration & environment variables
    ├── deploy-commands.js    # Deploy slash commands
    ├── commands/             # Slash commands (auto-loaded)
    │   ├── moderation/
    │   │   └── status.js
    │   └── utility/
    │       └── ping.js
    ├── events/               # Event listeners (auto-loaded)
    │   ├── client/
    │   │   ├── interactionCreate.js
    │   │   └── ready.js
    │   └── guild/
    │       ├── guildMemberAdd.js
    │       └── messageCreate.js
    ├── handlers/             # Command & event loaders
    │   ├── commandHandler.js
    │   └── eventHandler.js
    ├── systems/              # Core bot systems
    │   └── scamDetection.js
    └── utils/                # Reusable component builders
        └── components.js
```

## Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure environment variables**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and fill in:

   - `DISCORD_TOKEN` — your bot token
   - `CLIENT_ID` — your Discord application client ID
   - `GUILD_ID` — test server ID (optional, for local command deployment)
   - `LOG_CHANNEL_ID` — channel to send ban logs (optional)

3. **Deploy slash commands**

   ```bash
   npm run deploy
   ```

4. **Start the bot**

   ```bash
   npm start
   ```

   Or use the watch mode during development:

   ```bash
   npm run dev
   ```

## Discord Bot Setup

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications).
2. Create a new application.
3. In **Bot**, enable these intents:
   - Server Members Intent
   - Message Content Intent
4. Copy the bot token into `.env`.
5. In **OAuth2 > URL Generator**, select:
   - `bot`
   - `applications.commands`
   - Permissions: `Ban Members`, `Read Messages/View Channels`, `Send Messages`, `Manage Messages`, `Read Message History`
6. Use the generated URL to invite the bot.

## Anti-Scam Detection

When a new user joins a server, the bot starts tracking them for a configurable window (default: 1 hour). If the user sends 2 or more image attachments during that window, the bot:

1. Deletes the offending messages (optional).
2. Bans the user from the guild.
3. Logs the action to the configured log channel (optional).

You can tweak the behavior in `src/config.js` under `scamDetection`.

## Adding Commands

Create a new `.js` file in `src/commands/<category>/`:

```js
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('hello')
        .setDescription('Say hello!'),

    async execute(interaction) {
        await interaction.reply('Hello world!');
    },
};
```

Then run `npm run deploy` again.

## Adding Events

Create a new `.js` file in `src/events/<category>/`:

```js
module.exports = {
    name: 'messageCreate',
    once: false,
    async execute(message) {
        // your logic
    },
};
```

## License

MIT
