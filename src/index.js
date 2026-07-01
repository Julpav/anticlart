const { Client, Collection, GatewayIntentBits } = require('discord.js');
const config = require('./config');
const { loadCommands } = require('./handlers/commandHandler');
const { loadEvents } = require('./handlers/eventHandler');

if (!config.token) {
    console.error('❌ DISCORD_TOKEN is missing. Please check your .env file.');
    process.exit(1);
}

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent,
    ],
});

client.commands = new Collection();
client.cooldowns = new Collection();

(async () => {
    await loadCommands(client);
    await loadEvents(client);

    await client.login(config.token);
})();
