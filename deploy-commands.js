
const token = "token"; // token do bot
const clientId = "clientid"; // clientid do bot

const { SlashCommandBuilder, Routes } = require('discord.js');
const { REST } = require('@discordjs/rest');

const commands = [
    new SlashCommandBuilder()
        .setName('login')
        .setDescription('entra na sed e puxa seus dados')
        .addStringOption(option =>
            option.setName('ra')
                .setDescription('o registro do aluno (RA)')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('senha')
                .setDescription('senha da sed/sala do futuro')
                .setRequired(true)),
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(token);

if (!token || token === "token" || !clientId || clientId === "clientid") {
    console.error("não colocou o token ou o clientid no deploy-commands.js");
    process.exit(1);
}

(async () => {
    try {
        console.log('registrando o comando slash (/)');

        await rest.put(
            Routes.applicationCommands(clientId),
            { body: commands },
        );

        console.log('comando slash (/) registrado');
    } catch (error) {
        console.error(error);
    }
})();

