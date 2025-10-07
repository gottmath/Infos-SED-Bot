
const token = "token"; // token do bot
const { Client, GatewayIntentBits, Events, EmbedBuilder } = require('discord.js');
const axios = require('axios');

if (!token || token === "SEU_TOKEN_AQUI" || token.length < 50) {
    console.error("\n\nEsqueceu de colocar a porra do token");
    process.exit(1);
}

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

client.once(Events.ClientReady, readyClient => {
    console.log(`o bot ligou, gg`);
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand() || interaction.commandName !== 'login') return;

    await interaction.deferReply();
    const ra = interaction.options.getString('ra');
    const senha = interaction.options.getString('senha');

    const urlApi = "https://sedintegracoes.educacao.sp.gov.br/credenciais/api/LoginCompletoToken";
    const headersApi = {
        'Content-Type': 'application/json',
        'Ocp-Apim-Subscription-Key': '2b03c1db3884488795f79c37c069381a',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36'
    };
    const dataApi = { "user": ra, "senha": senha };

    try {
        const response = await axios.post(urlApi, dataApi, { headers: headersApi });
        const data = response.data;
        
        const dadosDoUsuario = data.DadosUsuario;
        const dataNascimentoRaw = dadosDoUsuario.A && dadosDoUsuario.A[0] ? dadosDoUsuario.A[0].DT_NASC : null;
        const dataNascimentoFormatada = dataNascimentoRaw ? dataNascimentoRaw.split('T')[0].split('-').reverse().join('/') : 'Não informado';
        const telefone = dadosDoUsuario.A && dadosDoUsuario.A[0] ? dadosDoUsuario.A[0].NR_TELEFONE : 'Não informado';
        const perfil = dadosDoUsuario.PERFIS && dadosDoUsuario.PERFIS[0] ? dadosDoUsuario.PERFIS[0].NM_PERFIL : 'Não informado';


        const userEmbed = new EmbedBuilder()
            .setColor(0x722FBE)
            .setTitle('Informações do Usuário')
            .addFields(
                { name: 'Nome', value: `${dadosDoUsuario.NAME || 'Não informado'}`, inline: true },
                { name: 'Login', value: `${dadosDoUsuario.LOGIN || 'Não informado'}`, inline: true },
                { name: '\u200B', value: '\u200B' },
                { name: 'CPF', value: `${dadosDoUsuario.NR_CPF || 'Não informado'}`, inline: true },
                { name: 'E-mail', value: `${dadosDoUsuario.EMAIL || 'Não informado'}`, inline: true },
                { name: '\u200B', value: '\u200B' },
                { name: 'E-mail Google', value: `${dadosDoUsuario.EMAIL_GOOGLE || 'Não informado'}`, inline: true },
                { name: 'E-mail Microsoft', value: `${dadosDoUsuario.EMAIL_MS || 'Não informado'}`, inline: true },
                { name: '\u200B', value: '\u200B' },
                { name: 'Apelido', value: `${dadosDoUsuario.NM_NICK || 'Não informado'}`, inline: true },
                { name: 'Data de Nascimento', value: `${dataNascimentoFormatada}`, inline: true },
                { name: '\u200B', value: '\u200B' },
                { name: 'Telefone', value: `${telefone}`, inline: true },
                { name: 'Perfil', value: `${perfil}`, inline: true },
            )
            .setTimestamp()
            .setFooter({ text: `Solicitado por: ${interaction.user.username}` });
        await interaction.editReply({ embeds: [userEmbed] });

    } catch (error) {
        console.error(`deu erro pra fazer a requisição: ${error.message}`);
        const errorEmbed = new EmbedBuilder()
            .setColor(0xFF0000)
            .setTitle('❌ Falha no Login');
        if (error.response) {
            errorEmbed.setDescription(`deu um erro na api da sed (Status: ${error.response.status}). ve se os dados estão corretos ou se deu pau na sed.`);
        } else {
            errorEmbed.setDescription('a api não funcionou, ve se o servidor ta ligado');
        }
        await interaction.editReply({ embeds: [errorEmbed], ephemeral: true });
    }
});

client.login(token);

