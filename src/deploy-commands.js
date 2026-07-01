const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('./config');

if (!config.token || !config.clientId) {
    console.error('❌ DISCORD_TOKEN and CLIENT_ID are required in .env');
    process.exit(1);
}

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(commandsPath);

for (const folder of commandFolders) {
    const folderPath = path.join(commandsPath, folder);
    if (!fs.statSync(folderPath).isDirectory()) continue;

    const commandFiles = fs
        .readdirSync(folderPath)
        .filter((file) => file.endsWith('.js'));

    for (const file of commandFiles) {
        const filePath = path.join(folderPath, file);
        const command = require(filePath);

        if ('data' in command && 'execute' in command) {
            commands.push(command.data.toJSON());
        } else {
            console.warn(`⚠️ Command at ${filePath} is missing required "data" or "execute" property.`);
        }
    }
}

const rest = new REST({ version: '10' }).setToken(config.token);

(async () => {
    try {
        console.log(`🚀 Started refreshing ${commands.length} application (/) commands.`);

        const route = config.guildId
            ? Routes.applicationGuildCommands(config.clientId, config.guildId)
            : Routes.applicationCommands(config.clientId);

        const data = await rest.put(route, { body: commands });

        console.log(`✅ Successfully reloaded ${data.length} application (/) commands.`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Failed to deploy commands:', error);
        process.exit(1);
    }
})();
